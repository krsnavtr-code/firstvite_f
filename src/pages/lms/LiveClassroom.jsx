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
  const socket = useRef(null);
  const localVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const peersRef = useRef({});
  const screenSharePeerRef = useRef(null);
  const remoteVideoRefs = useRef({});

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenShareStream, setScreenShareStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    initializeClassroom();
    return () => {
      cleanup();
    };
  }, [sessionId]);

  const initializeClassroom = async () => {
    try {
      // Get session details
      const sessionData = await getClassroomSession(sessionId);
      setSession(sessionData?.data || sessionData);

      // Join session
      await joinClassroomSession(sessionId);

      // Initialize socket
      socket.current = getSocket();

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join classroom room
      const role = currentUser?.role || "student";
      socket.current.emit("join-classroom", { sessionId, role });

      // Setup socket listeners
      setupSocketListeners();

      setLoading(false);
    } catch (err) {
      console.error("Error initializing classroom:", err);
      setError("Failed to join classroom. Please try again.");
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket.current) return;

    // User joined
    socket.current.on("user-joined", ({ userId, role, fullname }) => {
      console.log(`User ${fullname} joined as ${role}`);
      setParticipants((prev) => [...prev, { userId, role, fullname }]);

      // Create peer connection based on roles
      // Teacher connects to new students
      if (currentUser?.role === "teacher" && role === "student") {
        createPeerConnection(userId, true);
      }
      // Student connects to teacher
      else if (currentUser?.role === "student" && role === "teacher") {
        createPeerConnection(userId, false);
      }
    });

    // User left
    socket.current.on("user-left", ({ userId, fullname }) => {
      console.log(`User ${fullname} left`);
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));

      // Clean up peer connection
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
      }
    });

    // Participants list
    socket.current.on("participants-list", (participantsList) => {
      setParticipants(participantsList);

      // Create peer connections for existing participants
      participantsList.forEach((participant) => {
        if (participant.userId !== currentUser._id) {
          // Teacher connects to all students
          if (
            currentUser?.role === "teacher" &&
            participant.role === "student"
          ) {
            createPeerConnection(participant.userId, true);
          }
          // Student connects only to teacher
          else if (
            currentUser?.role === "student" &&
            participant.role === "teacher"
          ) {
            createPeerConnection(participant.userId, false);
          }
        }
      });
    });

    // WebRTC offer
    socket.current.on(
      "webrtc-offer",
      async ({ offer, fromUserId, fromFullname }) => {
        console.log(`Received offer from ${fromFullname}`);
        createPeerConnection(fromUserId, true, offer);
      },
    );

    // WebRTC answer
    socket.current.on("webrtc-answer", async ({ answer, fromUserId }) => {
      console.log("Received answer");
      const peer = peersRef.current[fromUserId];
      if (peer) {
        await peer.signal(answer);
      }
    });

    // ICE candidates
    socket.current.on(
      "webrtc-ice-candidate",
      async ({ candidate, fromUserId }) => {
        const peer = peersRef.current[fromUserId];
        if (peer) {
          await peer.signal({ candidate });
        }
      },
    );

    // Screen share offer
    socket.current.on(
      "screen-share-offer",
      async ({ offer, fromUserId, fromFullname }) => {
        console.log(`Received screen share offer from ${fromFullname}`);
        createScreenSharePeerConnection(fromUserId, true, offer);
      },
    );

    // Screen share answer
    socket.current.on("screen-share-answer", async ({ answer, fromUserId }) => {
      console.log("Received screen share answer");
      const peer = screenSharePeerRef.current;
      if (peer) {
        await peer.signal(answer);
      }
    });

    // Screen share ICE candidates
    socket.current.on(
      "screen-share-ice-candidate",
      async ({ candidate, fromUserId }) => {
        const peer = screenSharePeerRef.current;
        if (peer) {
          await peer.signal({ candidate });
        }
      },
    );

    // Stop screen share
    socket.current.on("stop-screen-share", ({ fromUserId, fromFullname }) => {
      console.log(`${fromFullname} stopped screen sharing`);
      if (screenSharePeerRef.current) {
        screenSharePeerRef.current.destroy();
        screenSharePeerRef.current = null;
      }
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = null;
      }
      setScreenShareStream(null);
      setIsScreenSharing(false);
    });

    // Audio toggle
    socket.current.on("user-audio-toggled", ({ userId, isMuted, fullname }) => {
      console.log(`${fullname} ${isMuted ? "muted" : "unmuted"} audio`);
    });

    // Video toggle
    socket.current.on(
      "user-video-toggled",
      ({ userId, isVideoOff, fullname }) => {
        console.log(
          `${fullname} ${isVideoOff ? "turned off" : "turned on"} video`,
        );
      },
    );

    // Hand raised
    socket.current.on("hand-raised", ({ userId, fullname }) => {
      console.log(`${fullname} raised hand`);
    });

    // Hand lowered
    socket.current.on("hand-lowered", ({ userId, fullname }) => {
      console.log(`${fullname} lowered hand`);
    });

    // Speak approved
    socket.current.on("speak-approved", ({ studentUserId, approvedBy }) => {
      if (studentUserId === currentUser._id) {
        setIsAudioEnabled(true);
        alert("Teacher approved you to speak");
      }
    });

    // Student muted
    socket.current.on("student-muted", ({ studentUserId, mutedBy }) => {
      if (studentUserId === currentUser._id) {
        setIsAudioEnabled(false);
        alert("Teacher muted you");
      }
    });

    // All muted
    socket.current.on("all-muted", ({ mutedBy }) => {
      if (currentUser?.role === "student") {
        setIsAudioEnabled(false);
        alert("Teacher muted all students");
      }
    });

    // Chat message
    socket.current.on("chat-message", (messageData) => {
      setChatMessages((prev) => [...prev, messageData]);
    });

    // User typing
    socket.current.on("user-typing", ({ userId, fullname }) => {
      console.log(`${fullname} is typing`);
    });

    // User stopped typing
    socket.current.on("user-stopped-typing", ({ userId }) => {
      // Handle stopped typing indicator
    });
  };

  const createPeerConnection = (userId, isInitiator, offer = null) => {
    if (peersRef.current[userId]) return;

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      stream: localStream,
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
          toUserId: userId,
        });
      } else if (data.type === "answer") {
        socket.current.emit("webrtc-answer", {
          sessionId,
          answer: data,
          toUserId: userId,
        });
      } else if (data.candidate) {
        socket.current.emit("webrtc-ice-candidate", {
          sessionId,
          candidate: data.candidate,
          toUserId: userId,
        });
      }
    });

    peer.on("stream", (stream) => {
      // Handle remote stream
      console.log("Received remote stream from", userId);
      const videoElement = remoteVideoRefs.current[userId];
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
    });

    peer.on("close", () => {
      console.log("Peer connection closed");
      delete peersRef.current[userId];
    });

    if (offer) {
      peer.signal(offer);
    }

    peersRef.current[userId] = peer;
  };

  const createScreenSharePeerConnection = (
    userId,
    isInitiator,
    offer = null,
  ) => {
    if (screenSharePeerRef.current) {
      screenSharePeerRef.current.destroy();
    }

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      stream: isScreenSharing ? screenShareStream : localStream,
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
        });
      } else if (data.type === "answer") {
        socket.current.emit("screen-share-answer", {
          sessionId,
          answer: data,
          toUserId: userId,
        });
      } else if (data.candidate) {
        socket.current.emit("screen-share-ice-candidate", {
          sessionId,
          candidate: data.candidate,
          toUserId: userId,
        });
      }
    });

    peer.on("stream", (stream) => {
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = stream;
      }
      setScreenShareStream(stream);
    });

    peer.on("error", (err) => {
      console.error("Screen share peer error:", err);
    });

    peer.on("close", () => {
      console.log("Screen share peer closed");
      screenSharePeerRef.current = null;
    });

    if (offer) {
      peer.signal(offer);
    }

    screenSharePeerRef.current = peer;
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
      socket.current.emit("toggle-audio", {
        sessionId,
        isMuted: isAudioEnabled,
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
      socket.current.emit("toggle-video", {
        sessionId,
        isVideoOff: isVideoEnabled,
      });
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen share
      if (screenShareStream) {
        screenShareStream.getTracks().forEach((track) => track.stop());
      }
      setScreenShareStream(null);
      setIsScreenSharing(false);
      socket.current.emit("stop-screen-share", { sessionId });
      if (screenSharePeerRef.current) {
        screenSharePeerRef.current.destroy();
        screenSharePeerRef.current = null;
      }
    } else {
      // Start screen share
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenShareStream(stream);
        setIsScreenSharing(true);
        createScreenSharePeerConnection(null, true);
      } catch (err) {
        console.error("Error starting screen share:", err);
        alert("Failed to start screen share");
      }
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    if (!isHandRaised) {
      socket.current.emit("raise-hand", { sessionId });
    } else {
      socket.current.emit("lower-hand", { sessionId });
    }
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      socket.current.emit("send-chat", {
        sessionId,
        message: chatInput,
      });
      setChatInput("");
    }
  };

  const leaveClassroom = async () => {
    try {
      await leaveClassroomSession(sessionId);
      cleanup();
      navigate("/smart-board/classroom-sessions");
    } catch (err) {
      console.error("Error leaving classroom:", err);
      navigate("/smart-board/classroom-sessions");
    }
  };

  const cleanup = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
    }

    // Destroy peer connections
    Object.values(peersRef.current).forEach((peer) => peer.destroy());
    if (screenSharePeerRef.current) {
      screenSharePeerRef.current.destroy();
    }

    // Clear remote video refs
    Object.keys(remoteVideoRefs.current).forEach((userId) => {
      if (remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId].srcObject = null;
      }
    });
    remoteVideoRefs.current = {};

    // Leave socket room
    if (socket.current) {
      socket.current.emit("leave-classroom", { sessionId });
      disconnectSocket();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading classroom...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {session?.batch?.name || "Classroom"}
          </h1>
          <p className="text-sm text-gray-400">
            {session?.status === "live" ? "🔴 Live" : "Scheduled"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {participants.length + 1} participants
          </span>
          <button
            onClick={leaveClassroom}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-72px)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-4">
          {/* Screen Share View */}
          {isScreenSharing && screenShareStream && (
            <div className="mb-4 bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={screenShareRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Local Video */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                You
              </div>
              {!isAudioEnabled && (
                <div className="absolute top-2 right-2 bg-red-600 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Remote Videos */}
            {participants.map((participant) => (
              <div
                key={participant.userId}
                className="relative bg-black rounded-lg overflow-hidden aspect-video"
              >
                <video
                  ref={(el) => {
                    if (el) remoteVideoRefs.current[participant.userId] = el;
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  {participant.fullname}
                </div>
                <div className="absolute top-2 right-2 bg-gray-600 bg-opacity-50 px-2 py-1 rounded text-xs capitalize">
                  {participant.role}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-colors ${
                isAudioEnabled
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isAudioEnabled ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoEnabled
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isVideoEnabled ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-colors ${
                isScreenSharing
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </button>

            {currentUser?.role === "student" && (
              <button
                onClick={toggleHandRaise}
                className={`p-4 rounded-full transition-colors ${
                  isHandRaised
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-bold">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`${
                    msg.sender === currentUser._id ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] px-3 py-2 rounded-lg ${
                      msg.sender === currentUser._id
                        ? "bg-blue-600"
                        : "bg-gray-700"
                    }`}
                  >
                    <div className="text-xs text-gray-300 mb-1">
                      {msg.senderFullname}
                    </div>
                    <div className="text-sm">{msg.message}</div>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={sendChatMessage}
              className="p-4 border-t border-gray-700"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClassroom;
