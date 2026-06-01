import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimplePeer from "simple-peer";
import { getSocket, disconnectSocket } from "../../socket/socketClient";
import {
  getClassroomSession,
  joinClassroomSession,
  leaveClassroomSession,
} from "../../api/classroomApi";
import { useAuth } from "../../contexts/AuthContext";

// Isolated VideoRenderer Component for stable stream binding
const VideoRenderer = ({
  stream,
  muted = false,
  className = "",
  onStreamEnd,
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(stream);

  // Update stream ref when stream changes
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    // Bind stream to video element
    video.srcObject = stream;

    // Handle track termination
    const handleTrackEnd = () => {
      if (onStreamEnd) onStreamEnd();
    };

    stream.getTracks().forEach((track) => {
      track.addEventListener("ended", handleTrackEnd);
    });

    return () => {
      stream.getTracks().forEach((track) => {
        track.removeEventListener("ended", handleTrackEnd);
      });
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream, onStreamEnd]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
};

const LiveClassroom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // REFS: All streams and peers stored in refs for atomic access
  const socket = useRef(null);
  const localVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const peersRef = useRef({}); // { userId: peerInstance }
  const screenSharePeersRef = useRef({}); // { userId: peerInstance }
  const localStreamRef = useRef(null);
  const screenShareStreamRef = useRef(null);
  const remoteStreamsRef = useRef({}); // { userId: MediaStream } - ref-buffered
  const remoteVideoRefs = useRef({}); // { userId: videoElementRef }
  const screenVideoRefs = useRef({}); // { userId: videoElementRef }
  const forceUpdateRef = useRef(0); // Trigger re-renders

  // STATE: Minimal state for UI updates only
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionState, setConnectionState] = useState("connecting");
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);

  // Force re-render helper
  const triggerUpdate = useCallback(() => {
    forceUpdateRef.current += 1;
    setParticipants((prev) => [...prev]);
  }, []);

  useEffect(() => {
    initializeClassroom();
    return () => {
      cleanup();
    };
  }, [sessionId]);

  // Heartbeat mechanism
  useEffect(() => {
    if (connectionState === "connected" && socket.current) {
      const interval = setInterval(() => {
        socket.current.emit("heartbeat");
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [connectionState]);

  const initializeClassroom = async () => {
    const initTimeout = setTimeout(() => {
      console.error("[TIMEOUT] Initialization timeout after 30 seconds");
      setError(
        "Connection timeout. Please check your internet connection and try again.",
      );
      setLoading(false);
      setConnectionState("disconnected");
    }, 30000);

    try {
      setConnectionState("connecting");
      console.log(`[INIT] Step 1: Fetching session data for ${sessionId}`);
      const sessionData = await getClassroomSession(sessionId);
      setSession(sessionData?.data || sessionData);
      console.log(`[INIT] Step 2: Session fetched successfully`);

      console.log(`[INIT] Step 3: Joining classroom session`);
      await joinClassroomSession(sessionId);
      console.log(`[INIT] Step 4: Getting socket connection`);
      socket.current = getSocket();

      // Setup socket listeners BEFORE joining
      console.log(`[INIT] Step 5: Setting up socket listeners`);
      setupSocketListeners();

      // Get local media stream with fallbacks
      console.log(`[INIT] Step 6: Requesting media access`);
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: true,
        });
        console.log(`[INIT] Step 7: Media access granted`);
      } catch (mediaError) {
        console.error(`[MEDIA ERROR] Failed to get camera/mic:`, mediaError);
        try {
          console.log(`[INIT] Step 7b: Trying audio-only fallback`);
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          console.log(`[INIT] Step 7c: Audio-only access granted`);
        } catch (audioError) {
          console.error(`[AUDIO ERROR] Failed to get audio:`, audioError);
          console.log(`[INIT] Step 7d: Continuing without media access`);
          stream = null;
          setError(
            "Camera/microphone access denied. Joining with audio/video disabled.",
          );
        }
      }

      localStreamRef.current = stream;

      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const role = currentUser?.role || "student";
      console.log(`[INIT] Step 8: Emitting join-classroom as ${role}`);
      socket.current.emit("join-classroom", { sessionId, role });

      console.log(
        `[INIT] Classroom initialization completed for user ${currentUser._id}`,
      );
      clearTimeout(initTimeout);
    } catch (err) {
      clearTimeout(initTimeout);
      console.error("[ERROR] Failed to initialize classroom:", err);
      console.error("[ERROR] Error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
      });

      if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost"
      ) {
        setError(
          "Camera access requires HTTPS. Please use a secure connection.",
        );
      } else {
        setError(`Failed to initialize: ${err.message}`);
      }

      setConnectionState("disconnected");
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket.current) return;

    socket.current.on("connect", () => {
      console.log(`[SOCKET] Connected with ID ${socket.current.id}`);
      setConnectionState("connected");
    });

    socket.current.on("disconnect", (reason) => {
      console.log(`[SOCKET] Disconnected. Reason: ${reason}`);
      setConnectionState("disconnected");
    });

    socket.current.on("error", (error) => {
      console.error(`[SOCKET ERROR]`, error);
      setError(`Connection error: ${error.message}`);
    });

    // User joined - ASYMMETRIC: Teacher initiates, Student receives
    socket.current.on(
      "user-joined",
      ({ userId, role, fullname, timestamp }) => {
        if (userId === currentUser._id) return;

        console.log(
          `[USER JOINED] ${fullname} (${role}) at ${new Date(timestamp).toISOString()}`,
        );

        setParticipants((prev) => {
          const exists = prev.some((p) => p.userId === userId);
          if (exists) return prev;
          return [...prev, { userId, role, fullname, joinedAt: timestamp }];
        });

        // STRICT ASYMMETRIC RULE: Only TEACHER initiates connections
        if (currentUser?.role === "teacher" && role === "student") {
          console.log(
            `[WEBRTC] Teacher initiating connection to student ${userId}`,
          );
          setTimeout(() => createPeerConnection(userId, true), 100);
        }
      },
    );

    // Participants list - No timeout fallback, rely on proper socket events
    socket.current.on("participants-list", ({ participants, timestamp }) => {
      console.log(
        `[PARTICIPANTS LIST] Received ${participants.length} participants at ${new Date(timestamp).toISOString()}`,
      );

      const otherParticipants = participants.filter(
        (p) => p.userId !== currentUser._id,
      );

      setParticipants(otherParticipants);
      setLoading(false);
      setConnectionState("connected");

      // STRICT ASYMMETRIC: Students wait for teacher offers
      if (currentUser?.role === "student") {
        const teacher = otherParticipants.find((p) => p.role === "teacher");
        if (teacher) {
          console.log(
            `[WEBRTC] Student found teacher ${teacher.userId}, waiting for offer`,
          );
        }
      }
    });

    // WebRTC Offer - Only students receive from teacher
    socket.current.on(
      "webrtc-offer",
      async ({ offer, fromUserId, fromFullname, timestamp }) => {
        console.log(
          `[WEBRTC OFFER] Received from ${fromFullname} (${fromUserId}) at ${new Date(timestamp).toISOString()}`,
        );

        if (peersRef.current[fromUserId]) {
          console.log(`[WEBRTC] Destroying existing peer for ${fromUserId}`);
          peersRef.current[fromUserId].destroy();
          delete peersRef.current[fromUserId];
        }

        createPeerConnection(fromUserId, false, offer);
      },
    );

    // WebRTC Answer - Only teacher receives from students
    socket.current.on(
      "webrtc-answer",
      async ({ answer, fromUserId, timestamp }) => {
        console.log(
          `[WEBRTC ANSWER] Received from ${fromUserId} at ${new Date(timestamp).toISOString()}`,
        );

        const peer = peersRef.current[fromUserId];
        if (peer) {
          peer.signal(answer);
        } else {
          console.warn(
            `[WEBRTC] No peer found for ${fromUserId} when receiving answer`,
          );
        }
      },
    );

    // ICE Candidates
    socket.current.on(
      "webrtc-ice-candidate",
      async ({ candidate, fromUserId, timestamp }) => {
        const peer = peersRef.current[fromUserId];
        if (peer) {
          peer.signal({ candidate });
        }
      },
    );

    // Screen Share
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
      delete remoteStreamsRef.current[`screen-${fromUserId}`];
      triggerUpdate();
    });

    // User Left
    socket.current.on("user-left", ({ userId, fullname, timestamp }) => {
      console.log(
        `[USER LEFT] ${fullname} at ${new Date(timestamp).toISOString()}`,
      );

      setParticipants((prev) => prev.filter((p) => p.userId !== userId));

      // Clean up refs
      delete remoteStreamsRef.current[userId];
      delete remoteStreamsRef.current[`screen-${userId}`];
      delete remoteVideoRefs.current[userId];

      if (peersRef.current[userId]) {
        console.log(`[WEBRTC] Destroying peer for ${userId}`);
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
      }

      triggerUpdate();
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

  // ASYMMETRIC PEER CONNECTION: Teacher initiates, Student receives
  const createPeerConnection = (
    remoteUserId,
    isInitiator,
    incomingOffer = null,
  ) => {
    if (peersRef.current[remoteUserId]) {
      console.log(`[WEBRTC] Peer for ${remoteUserId} already exists, skipping`);
      return;
    }

    console.log(
      `[WEBRTC] Creating peer to ${remoteUserId} (initiator: ${isInitiator})`,
    );

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      stream: localStreamRef.current,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
        ],
      },
      allowHalfTrickle: true,
      iceCompleteTimeout: 5000, // Mobile network optimization
    });

    peer.on("signal", (data) => {
      if (!socket.current || socket.current.disconnected) {
        console.warn(`[WEBRTC] Socket disconnected, cannot send signal`);
        return;
      }

      if (data.type === "offer") {
        console.log(`[WEBRTC SIGNAL] Sending offer to ${remoteUserId}`);
        socket.current.emit("webrtc-offer", {
          sessionId,
          offer: data,
          toUserId: remoteUserId,
        });
      } else if (data.type === "answer") {
        console.log(`[WEBRTC SIGNAL] Sending answer to ${remoteUserId}`);
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
      console.log(`[WEBRTC STREAM] Received stream from ${remoteUserId}`);
      // Store in ref, trigger update
      remoteStreamsRef.current[remoteUserId] = remoteStream;
      triggerUpdate();
    });

    peer.on("error", (err) => {
      console.error(`[WEBRTC ERROR] Peer error for ${remoteUserId}:`, err);
      // Only teacher recreates on error
      if (currentUser?.role === "teacher") {
        setTimeout(() => {
          destroyPeer(remoteUserId);
          createPeerConnection(remoteUserId, true);
        }, 1000);
      }
    });

    peer.on("close", () => {
      console.log(`[WEBRTC] Peer closed for ${remoteUserId}`);
      destroyPeer(remoteUserId);
    });

    peer.on("connect", () => {
      console.log(`[WEBRTC] Peer connected to ${remoteUserId}`);
    });

    if (incomingOffer) {
      console.log(`[WEBRTC] Processing incoming offer from ${remoteUserId}`);
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
      remoteStreamsRef.current[`screen-${remoteUserId}`] = incomingScreenStream;
      triggerUpdate();
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
    console.log(`[CLEANUP] Starting cleanup for session ${sessionId}`);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((t) => t.stop());
      screenShareStreamRef.current = null;
    }

    Object.values(peersRef.current).forEach((p) => {
      try {
        p.destroy();
      } catch (e) {}
    });
    peersRef.current = {};

    Object.values(screenSharePeersRef.current).forEach((p) => {
      try {
        p.destroy();
      } catch (e) {}
    });
    screenSharePeersRef.current = {};

    remoteStreamsRef.current = {};
    remoteVideoRefs.current = {};
    screenVideoRefs.current = {};

    if (socket.current) {
      socket.current.emit("leave-classroom", { sessionId });
      socket.current.removeAllListeners();
      disconnectSocket();
      socket.current = null;
    }

    setParticipants([]);
    console.log(`[CLEANUP] Cleanup complete`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl animate-pulse flex flex-col items-center gap-4 max-w-md text-center px-4">
          <div className="text-2xl">🔄</div>
          <div>
            {connectionState === "reconnecting"
              ? "Reconnecting to classroom..."
              : "Loading live architecture context..."}
          </div>
          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-800">
              {error}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Check browser console for detailed logs
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-900/30 border-b border-yellow-700 px-6 py-3 text-sm text-yellow-300 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-yellow-400 hover:text-yellow-200"
          >
            ✕
          </button>
        </div>
      )}

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
            <span
              className={`mr-2 ${
                connectionState === "connected"
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {connectionState === "connected" ? "●" : "○"}
            </span>
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
              <VideoRenderer
                stream={screenShareStreamRef.current}
                muted
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Incoming Global Screens Stream Box - Using ref-buffered streams */}
          {Object.keys(remoteStreamsRef.current)
            .filter((k) => k.startsWith("screen-"))
            .map((key) => (
              <div
                key={key}
                className="bg-black rounded-xl overflow-hidden aspect-video max-h-[50vh] border border-purple-500/30 shadow-lg mx-auto"
              >
                <VideoRenderer
                  stream={remoteStreamsRef.current[key]}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}

          {/* Grid View */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
            {/* Owner Camera Window */}
            <div className="relative bg-gray-950 rounded-xl overflow-hidden aspect-video border border-gray-800 shadow-md">
              <VideoRenderer
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

            {/* Remote Peer Iteration Panels - Using ref-buffered streams */}
            {participants.map((p) => (
              <div
                key={p.userId}
                className="relative bg-gray-950 rounded-xl overflow-hidden aspect-video border border-gray-800 shadow-md"
              >
                {remoteStreamsRef.current[p.userId] ? (
                  <VideoRenderer
                    stream={remoteStreamsRef.current[p.userId]}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-500 bg-gray-900/50">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                    <div>Connecting encrypted media lines...</div>
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
