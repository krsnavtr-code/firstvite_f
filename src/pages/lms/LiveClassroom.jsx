import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimplePeer from "simple-peer";
import { getSocket, disconnectSocket } from "../../socket/socketClient";
import {
  getClassroomSession,
  joinClassroomSession,
  leaveClassroomSession,
} from "../../api/classroomApi";
import { useAuth } from "../../contexts/AuthContext";

const LiveClassroom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Refs for consistent instant access across event listeners
  const socket = useRef(null);
  const localVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const peersRef = useRef({}); // { userId: peerInstance }
  const screenSharePeersRef = useRef({}); // Multi-target screen management
  const localStreamRef = useRef(null);
  const screenShareStreamRef = useRef(null);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI Sync States
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // Track rendering mappings cleanly
  const [remoteStreams, setRemoteStreams] = useState({}); // { userId: MediaStream }

  useEffect(() => {
    initializeClassroom();
    return () => {
      cleanup();
    };
  }, [sessionId]);

  const initializeClassroom = async () => {
    try {
      const sessionData = await getClassroomSession(sessionId);
      setSession(sessionData?.data || sessionData);

      await joinClassroomSession(sessionId);
      socket.current = getSocket();

      // Get local media stream first and lock it inside Ref immediately
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const role = currentUser?.role || "student";
      socket.current.emit("join-classroom", { sessionId, role });

      setupSocketListeners();
      setLoading(false);
    } catch (err) {
      console.error("Error initializing classroom:", err);
      setError("Failed to initialize system or camera access denied.");
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket.current) return;

    // User joined
    socket.current.on("user-joined", ({ userId, role, fullname }) => {
      if (userId === currentUser._id) return;

      console.log(`📡 New participant detected: ${fullname} (${role})`);

      // Force strict functional state copy to avoid batching ignore
      setParticipants((prev) => {
        const exists = prev.some((p) => p.userId === userId);
        if (exists) return prev;
        const updatedList = [...prev, { userId, role, fullname }];
        console.log("📊 Updated Participants List Count:", updatedList.length);
        return updatedList;
      });

      // Teacher establishes connection to naye students
      if (currentUser?.role === "teacher" && role === "student") {
        createPeerConnection(userId, true);
      }
    });

    // Handle existing participants sync safely
    socket.current.on("participants-list", (participantsList) => {
      console.log(
        "📋 Received raw server participants array:",
        participantsList,
      );

      // Filter out the current user to keep pure peer metrics
      const otherParticipants = participantsList.filter(
        (p) => p.userId !== currentUser._id,
      );

      // Directly set the cleaned state slice
      setParticipants(otherParticipants);

      otherParticipants.forEach((participant) => {
        if (currentUser?.role === "student" && participant.role === "teacher") {
          createPeerConnection(participant.userId, true);
        }
      });
    });

    // WebRTC Offer
    socket.current.on("webrtc-offer", async ({ offer, fromUserId }) => {
      createPeerConnection(fromUserId, false, offer);
    });

    // WebRTC Answer
    socket.current.on("webrtc-answer", async ({ answer, fromUserId }) => {
      const peer = peersRef.current[fromUserId];
      if (peer) peer.signal(answer);
    });

    // ICE Candidates
    socket.current.on(
      "webrtc-ice-candidate",
      async ({ candidate, fromUserId }) => {
        const peer = peersRef.current[fromUserId];
        if (peer) peer.signal({ candidate });
      },
    );

    // Screen Share Offer Routing
    socket.current.on("screen-share-offer", async ({ offer, fromUserId }) => {
      createScreenSharePeerConnection(fromUserId, false, offer);
    });

    socket.current.on("screen-share-answer", async ({ answer, fromUserId }) => {
      const peer = screenSharePeersRef.current[fromUserId];
      if (peer) peer.signal(answer);
    });

    socket.current.on(
      "screen-share-ice-candidate",
      async ({ candidate, fromUserId }) => {
        const peer = screenSharePeersRef.current[fromUserId];
        if (peer) peer.signal({ candidate });
      },
    );

    socket.current.on("stop-screen-share", ({ fromUserId }) => {
      if (screenSharePeersRef.current[fromUserId]) {
        screenSharePeersRef.current[fromUserId].destroy();
        delete screenSharePeersRef.current[fromUserId];
      }
      setRemoteStreams((prev) => {
        const copy = { ...prev };
        delete copy[`screen-${fromUserId}`];
        return copy;
      });
    });

    // User Left CleanUp
    socket.current.on("user-left", ({ userId, fullname }) => {
      console.log(`🛑 User left the engine node: ${fullname}`);

      setParticipants((prev) => prev.filter((p) => p.userId !== userId));

      // Dynamic state stream pruning
      setRemoteStreams((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        delete copy[`screen-${userId}`];
        return copy;
      });

      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
      }
    });

    // Chat handling
    socket.current.on("chat-message", (messageData) => {
      setChatMessages((prev) => [...prev, messageData]);
    });

    // Mod Handlers
    socket.current.on("speak-approved", ({ studentUserId }) => {
      if (studentUserId === currentUser._id) {
        handleRemoteMuteAction(false);
        alert("Teacher approved you to speak. You are now unmuted.");
      }
    });

    socket.current.on("student-muted", ({ studentUserId }) => {
      if (studentUserId === currentUser._id) {
        handleRemoteMuteAction(true);
        alert("The teacher has muted your microphone.");
      }
    });

    socket.current.on("all-muted", () => {
      if (currentUser?.role === "student") {
        handleRemoteMuteAction(true);
        alert("Teacher muted all students.");
      }
    });
  };

  // Safe programmatic control logic for system locks
  const handleRemoteMuteAction = (shouldMute) => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = !shouldMute));
      setIsAudioEnabled(!shouldMute);
    }
  };

  // Stable Core Peer connection setup
  const createPeerConnection = (
    remoteUserId,
    isInitiator,
    incomingOffer = null,
  ) => {
    if (peersRef.current[remoteUserId]) return;

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      stream: localStreamRef.current, // Use locked instant memory reference
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (data) => {
      if (data.type === "offer") {
        socket.current.emit("webrtc-offer", {
          sessionId,
          offer: data,
          toUserId: remoteUserId,
        });
      } else if (data.type === "answer") {
        socket.current.emit("webrtc-answer", {
          sessionId,
          answer: data,
          toUserId: remoteUserId,
        });
      } else if (data.candidate) {
        socket.current.emit("webrtc-ice-candidate", {
          sessionId,
          candidate: data.candidate,
          toUserId: remoteUserId,
        });
      }
    });

    peer.on("stream", (remoteStream) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [remoteUserId]: remoteStream,
      }));
    });

    peer.on("error", (err) => console.error("Peer pipeline breakdown:", err));

    peer.on("close", () => {
      destroyPeer(remoteUserId);
    });

    if (incomingOffer) {
      peer.signal(incomingOffer);
    }

    peersRef.current[remoteUserId] = peer;
  };

  const createScreenSharePeerConnection = (
    remoteUserId,
    isInitiator,
    incomingOffer = null,
  ) => {
    if (screenSharePeersRef.current[remoteUserId]) return;

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      stream: screenShareStreamRef.current,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (data) => {
      if (data.type === "offer") {
        socket.current.emit("screen-share-offer", {
          sessionId,
          offer: data,
          toUserId: remoteUserId,
        });
      } else if (data.type === "answer") {
        socket.current.emit("screen-share-answer", {
          sessionId,
          answer: data,
          toUserId: remoteUserId,
        });
      } else if (data.candidate) {
        socket.current.emit("screen-share-ice-candidate", {
          sessionId,
          candidate: data.candidate,
          toUserId: remoteUserId,
        });
      }
    });

    peer.on("stream", (incomingScreenStream) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [`screen-${remoteUserId}`]: incomingScreenStream,
      }));
    });

    if (incomingOffer) {
      peer.signal(incomingOffer);
    }

    screenSharePeersRef.current[remoteUserId] = peer;
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const currentState = !isAudioEnabled;
      localStreamRef.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = currentState));
      setIsAudioEnabled(currentState);
      socket.current.emit("toggle-audio", {
        sessionId,
        isMuted: !currentState,
      });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const currentState = !isVideoEnabled;
      localStreamRef.current
        .getVideoTracks()
        .forEach((t) => (t.enabled = currentState));
      setIsVideoEnabled(currentState);
      socket.current.emit("toggle-video", {
        sessionId,
        isVideoOff: !currentState,
      });
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      screenShareStreamRef.current = null;
      setIsScreenSharing(false);
      socket.current.emit("stop-screen-share", { sessionId });

      Object.keys(screenSharePeersRef.current).forEach((id) => {
        screenSharePeersRef.current[id].destroy();
      });
      screenSharePeersRef.current = {};
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenShareStreamRef.current = stream;
        setIsScreenSharing(true);

        // Notify downstream clients and build targeted dispatch
        participants.forEach((p) => {
          createScreenSharePeerConnection(p.userId, true);
        });

        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare(); // Auto-destruct share layout safely on native desktop exit
        };
      } catch (err) {
        console.error("Screen share deployment engine block:", err);
      }
    }
  };

  const destroyPeer = (userId) => {
    if (peersRef.current[userId]) {
      peersRef.current[userId].destroy();
      delete peersRef.current[userId];
    }
  };

  const toggleHandRaise = () => {
    const updatedState = !isHandRaised;
    setIsHandRaised(updatedState);
    socket.current.emit(updatedState ? "raise-hand" : "lower-hand", {
      sessionId,
    });
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      socket.current.emit("send-chat", { sessionId, message: chatInput });
      setChatInput("");
    }
  };

  const leaveClassroom = async () => {
    try {
      await leaveClassroomSession(sessionId);
      cleanup();
      navigate("/smart-board/classroom-sessions");
    } catch (err) {
      navigate("/smart-board/classroom-sessions");
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    Object.values(peersRef.current).forEach((p) => p.destroy());
    Object.values(screenSharePeersRef.current).forEach((p) => p.destroy());

    if (socket.current) {
      socket.current.emit("leave-classroom", { sessionId });
      disconnectSocket();
    }
  };

  // Video Renderer Helper Component to link streams dynamically without pipeline leakage
  const VideoElement = ({ stream, muted = false, className = "" }) => {
    const videoTagRef = useRef(null);
    useEffect(() => {
      if (videoTagRef.current && stream) {
        videoTagRef.current.srcObject = stream;
      }
    }, [stream]);

    return (
      <video
        ref={videoTagRef}
        autoPlay
        playsInline
        muted={muted}
        className={className}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl animate-pulse">
          Loading live architecture context...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold">
            {session?.batch?.name || "LMS Virtual Engine"}
          </h1>
          <p className="text-sm text-green-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />{" "}
            Live Session
          </p>
        </div>
        {/* Replace your current participant display counter with this */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 font-semibold bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-750">
            👥 Total Active:{" "}
            <span className="text-blue-400 font-bold">
              {participants.length + 1}
            </span>
          </span>
          <button
            onClick={leaveClassroom}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-all text-sm font-semibold"
          >
            Leave Room
          </button>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-73px)] overflow-hidden">
        {/* Main Communications View */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          {/* Active Broadcast Screen Layout */}
          {isScreenSharing && screenShareStreamRef.current && (
            <div className="bg-black rounded-xl overflow-hidden aspect-video max-h-[50vh] border border-blue-500/30 shadow-lg mx-auto">
              <VideoElement
                stream={screenShareStreamRef.current}
                muted
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Incoming Global Screens Stream Box */}
          {Object.keys(remoteStreams)
            .filter((k) => k.startsWith("screen-"))
            .map((key) => (
              <div
                key={key}
                className="bg-black rounded-xl overflow-hidden aspect-video max-h-[50vh] border border-purple-500/30 shadow-lg mx-auto"
              >
                <VideoElement
                  stream={remoteStreams[key]}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}

          {/* Grid View */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
            {/* Owner Camera Window */}
            <div className="relative bg-gray-950 rounded-xl overflow-hidden aspect-video border border-gray-800 shadow-md">
              <VideoElement
                stream={localStreamRef.current}
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium">
                You ({currentUser?.fullname})
              </div>
              {!isAudioEnabled && (
                <div className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-md shadow-md">
                  Muted
                </div>
              )}
            </div>

            {/* Remote Peer Iteration Panels */}
            {participants.map((p) => (
              <div
                key={p.userId}
                className="relative bg-gray-950 rounded-xl overflow-hidden aspect-video border border-gray-800 shadow-md"
              >
                {remoteStreams[p.userId] ? (
                  <VideoElement
                    stream={remoteStreams[p.userId]}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-gray-900/50">
                    Connecting encrypted media lines...
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium">
                  {p.fullname}
                </div>
                <div className="absolute top-2 right-2 bg-gray-800/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] uppercase font-bold text-gray-300 tracking-wider">
                  {p.role}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Bottom Deck Panel Controls */}
          <div className="mt-auto pt-4 flex items-center justify-center gap-3 bg-gray-950/40 backdrop-blur-md py-3 rounded-xl border border-gray-800">
            <button
              onClick={toggleAudio}
              className={`p-3.5 rounded-xl transition-all ${isAudioEnabled ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}
            >
              {isAudioEnabled ? "Mute Mic" : "Unmute Mic"}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-xl transition-all ${isVideoEnabled ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}
            >
              {isVideoEnabled ? "Stop Cam" : "Start Cam"}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3.5 rounded-xl transition-all ${isScreenSharing ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-800 hover:bg-gray-700"}`}
            >
              {isScreenSharing ? "Stop Share" : "Share Screen"}
            </button>

            {currentUser?.role === "student" && (
              <button
                onClick={toggleHandRaise}
                className={`p-3.5 rounded-xl transition-all ${isHandRaised ? "bg-yellow-600 hover:bg-yellow-500" : "bg-gray-800 hover:bg-gray-700"}`}
              >
                Hand {isHandRaised ? "Down" : "Raise"}
              </button>
            )}

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3.5 rounded-xl transition-all ${showChat ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}
            >
              Toggle Chat
            </button>
          </div>
        </div>

        {/* Messaging Box Panel */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
            <div className="p-4 border-b border-gray-700 bg-gray-850">
              <h3 className="font-bold text-sm tracking-wide text-gray-200">
                Classroom Feed
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === currentUser._id ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] text-gray-400 mb-1 px-1">
                    {msg.senderFullname}
                  </span>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.sender === currentUser._id ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-700 text-gray-100 rounded-tl-none"}`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={sendChatMessage}
              className="p-4 border-t border-gray-700 bg-gray-850"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message all members..."
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-750 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-200"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClassroom;
