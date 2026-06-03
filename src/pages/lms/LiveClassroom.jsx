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
  const screenShareContainerRef = useRef(null);
  const remoteScreenContainerRef = useRef(null); // Remote screens ke liye alag ref
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
  const [isCameraPopupMinimized, setIsCameraPopupMinimized] = useState(false);
  const [cameraPopupPosition, setCameraPopupPosition] = useState({
    x: 20,
    y: 20,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Force re-render helper
  const triggerUpdate = useCallback(() => {
    forceUpdateRef.current += 1;
    setParticipants((prev) => [...prev]);
  }, []);

  // SDP bitrate control for network optimization
  const forceVideoBitrate = (sdp, bitrateKbps) => {
    const lines = sdp.split("\r\n");
    let mVideoIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].indexOf("m=video") === 0) {
        mVideoIndex = i;
        break;
      }
    }

    if (mVideoIndex === -1) return sdp; // No video line found, return raw sdp

    // Insert bandwidth modifier line directly below video media definitions
    lines.splice(mVideoIndex + 1, 0, `b=AS:${bitrateKbps}`);
    return lines.join("\r\n");
  };

  // Drag handlers for camera popup
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setCameraPopupPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Fullscreen toggle for screen share
  const toggleFullscreen = (targetRef) => {
    if (!targetRef.current) return;

    if (!document.fullscreenElement) {
      if (targetRef.current.requestFullscreen) {
        targetRef.current.requestFullscreen();
      } else if (targetRef.current.webkitRequestFullscreen) {
        targetRef.current.webkitRequestFullscreen();
      } else if (targetRef.current.msRequestFullscreen) {
        targetRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
    };
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
      // console.error("[ERROR] Failed to initialize classroom:", err);
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
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      },
      // 🔥 BITRATE EXTENDED UPTO 2000kbps (2Mbps) FOR CRYSTAL CLEAR TEXT
      sdpTransform: (sdp) => {
        return forceVideoBitrate(sdp, 2000);
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

    peer.on("error", (err) => {
      console.error("[SCREEN PEER ERROR]", err);
    });

    peer.on("close", () => {
      delete remoteStreamsRef.current[`screen-${remoteUserId}`];
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

  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const currentState = !isVideoEnabled;

      if (currentState) {
        // Enable video - need to get new video track
        try {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = true;
          } else {
            // No video track exists, need to get new stream
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: "user",
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
              audio: false,
            });
            const newVideoTrack = newStream.getVideoTracks()[0];
            localStreamRef.current.addTrack(newVideoTrack);
            // Update local video element
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
            }
            // Update all peer connections with new stream
            Object.values(peersRef.current).forEach((peer) => {
              peer.replaceTrack(
                peer.streams[0].getVideoTracks()[0],
                newVideoTrack,
                peer.streams[0],
              );
            });
          }
        } catch (err) {
          console.error("[VIDEO ERROR] Failed to enable camera:", err);
          return;
        }
      } else {
        // Disable video - stop the video track completely
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.stop();
          localStreamRef.current.removeTrack(track);
        });
      }

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
          video: {
            width: { ideal: 1920, max: 1920 }, // Standard Full HD for clear board text
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 20, max: 30 }, // 20-30 fps controls the delay balance
            displaySurface: "monitor",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        // 🔥 CRITICAL FIX: Browser ko force karein text sharp render karne ke liye
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && "contentHint" in videoTrack) {
          videoTrack.contentHint = "detail"; // This prioritizes text clarity over camera motion blurring
        }

        screenShareStreamRef.current = stream;
        setIsScreenSharing(true);

        participants.forEach((p) => {
          createScreenSharePeerConnection(p.userId, true);
        });

        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
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
          {/* <div className="text-xs text-gray-500 mt-2">
            Check browser console for detailed logs
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white flex flex-col">
      {/* Error Banner */}
      {/* {error && (
        <div className="bg-yellow-900/30 border-b border-yellow-700 px-6 py-3 text-sm text-yellow-300 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-yellow-400 hover:text-yellow-200"
          >
            ✕
          </button>
        </div>
      )} */}

      {/* Header */}
      <div className="px-6 pb-2 flex items-center justify-between border-b border-gray-700">
        <div>
          <h1 className="text-sm flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 animate-ping"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Session {session?.batch?.name || "LMS Virtual Engine"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">
            <span
              className={`mr-2 ${
                connectionState === "connected"
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {connectionState === "connected" ? "●" : "○"}
            </span>
            Active:{" "}
            <span className="text-blue-800 dark:text-blue-300 font-bold">
              {participants.length + 1}
            </span>
          </span>
          <button
            onClick={leaveClassroom}
            className="px-4 py-1.5 text-white bg-red-600 rounded hover:bg-red-700 transition-all text-sm font-semibold"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative h-full">
        {/* Main Communications View */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 pb-24 h-full">
          {/* Active Broadcast Screen Layout */}
          {isScreenSharing && screenShareStreamRef.current && (
            <div
              ref={screenShareContainerRef}
              className="relative rounded-xl overflow-hidden border border-blue-500/30 shadow-lg mx-auto aspect-video max-h-[50vh] bg-black w-full flex items-center justify-center 
               fullscreen:max-h-none fullscreen:w-screen fullscreen:h-screen fullscreen:rounded-none"
            >
              <VideoRenderer
                stream={screenShareStreamRef.current}
                muted
                className="w-full h-full object-contain fullscreen:w-screen fullscreen:h-screen"
              />

              {/* Fullscreen Toggle Button */}
              <button
                onClick={() => toggleFullscreen(screenShareContainerRef)}
                className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-2.5 rounded-xl hover:bg-black/80 transition-all z-[200] border border-white/10"
              >
                {isFullscreen ? (
                  /* Exit Fullscreen Icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25"
                    />
                  </svg>
                ) : (
                  /* Fullscreen Icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* 2. Incoming Global Screens Stream Box (Remote Screen Share) */}
          {Object.keys(remoteStreamsRef.current)
            .filter((k) => k.startsWith("screen-"))
            .map((key) => (
              <div
                key={key}
                ref={remoteScreenContainerRef}
                className="relative rounded-xl overflow-hidden border border-purple-500/30 shadow-lg mx-auto aspect-video max-h-[50vh] bg-black w-full"
              >
                <VideoRenderer
                  stream={remoteStreamsRef.current[key]}
                  className="w-full h-full object-contain"
                />

                {/* Remote Screen Fullscreen Button */}
                <button
                  onClick={() => toggleFullscreen(remoteScreenContainerRef)}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-2.5 rounded-xl hover:bg-black/80 transition-all z-50 border border-white/10"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                      />
                    </svg>
                  )}
                </button>
              </div>
            ))}

          {/* Grid View */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
            {/* Owner Camera Window - Hide when screen sharing */}
            {!isScreenSharing && (
              <div className="relative rounded-xl overflow-hidden aspect-video border border-gray-800 shadow-md">
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
            )}

            {/* Remote Peer Iteration Panels - Using ref-buffered streams */}
            {participants.map((p) => (
              <div
                key={p.userId}
                className="relative rounded-xl overflow-hidden aspect-video border border-gray-800 shadow-md"
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
        </div>

        {/* Messaging Box Panel (Bottom-to-Top Popup Drawer) */}
        {showChat && (
          <div className="fixed z-50 bottom-12 right-4 w-96 h-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="font-bold text-sm tracking-wide text-gray-800 dark:text-gray-200">
                  Classroom Feed
                </h3>
              </div>

              {/* Close button inside popup */}
              <button
                onClick={() => setShowChat(false)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-gray-950/10">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-gray-400 mb-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.596.596 0 0 1-.73-.73 5.972 5.972 0 0 1 1.058-2.006C4.037 16.243 2 14.333 2 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                    />
                  </svg>
                  <p className="text-xs text-gray-400">
                    No messages yet. Say hello to the class!
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === currentUser._id ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] mb-1 px-1 text-gray-500 dark:text-gray-400 font-medium">
                      {msg.sender === currentUser._id
                        ? "You"
                        : msg.senderFullname}
                    </span>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm leading-relaxed ${
                        msg.sender === currentUser._id
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-tl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form Input Deck */}
            <form
              onSubmit={sendChatMessage}
              className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message all members..."
                  className="w-full pl-4 pr-12 py-2.5 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-gray-200 dark:focus:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-gray-900 dark:text-gray-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="absolute right-1.5 p-1.5 bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white disabled:text-gray-400 dark:disabled:text-gray-600 rounded-lg transition-all hover:bg-blue-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Fixed Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-2 md:gap-4 py-1 border-t border-gray-200 dark:border-gray-900 z-50 shadow-xl">
        {/* Audio Control (Mic) */}
        <button
          onClick={toggleAudio}
          title={isAudioEnabled ? "Mute Mic" : "Unmute Mic"}
          className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center ${
            isAudioEnabled
              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              : "bg-red-600 text-white hover:bg-red-500 animate-pulse-slow"
          }`}
        >
          {isAudioEnabled ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636M12 15.75a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z"
              />
            </svg>
          )}
        </button>

        {/* Video Control (Camera) */}
        <button
          onClick={toggleVideo}
          title={isVideoEnabled ? "Stop Camera" : "Start Camera"}
          className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center ${
            isVideoEnabled
              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              : "bg-red-600 text-white hover:bg-red-500"
          }`}
        >
          {isVideoEnabled ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 4.5 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 19.5h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 8.25v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m3 3 18 18"
              />
            </svg>
          )}
        </button>

        {/* Screen Share Control */}
        <button
          onClick={toggleScreenShare}
          title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center ${
            isScreenSharing
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15.75V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z"
            />
          </svg>
        </button>

        {/* Student Hand Raise Control */}
        {currentUser?.role === "student" && (
          <button
            onClick={toggleHandRaise}
            title={isHandRaised ? "Lower Hand" : "Raise Hand"}
            className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center ${
              isHandRaised
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.05 4.575a1.5 1.5 0 1 1 3 0V9.75M4.5 10.5a1.5 1.5 0 1 1 3 0v5.625M7.5 7.875a1.5 1.5 0 1 1 3 0v6.75m6.75-3a1.5 1.5 0 0 1 3 0v3.375c0 4.349-4.03 7.875-9 7.875a11.96 11.96 0 0 1-7.5-2.656V16.5A1.5 1.5 0 0 1 10.05 15"
              />
            </svg>
          </button>
        )}

        {/* Chat Panel Toggle Control */}
        <button
          onClick={() => setShowChat(!showChat)}
          title="Toggle Chat"
          className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center ${
            showChat
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
        </button>
      </div>

      {/* Floating Camera Popup - Shows when screen sharing */}
      {isScreenSharing && localStreamRef.current && (
        <div
          className={`fixed z-50 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
            isCameraPopupMinimized ? "w-12 h-12" : "w-48 h-36"
          }`}
          style={{
            left: cameraPopupPosition.x,
            top: cameraPopupPosition.y,
          }}
          onMouseDown={(e) => {
            if (!isCameraPopupMinimized) {
              setIsDragging(true);
              setDragOffset({
                x: e.clientX - cameraPopupPosition.x,
                y: e.clientY - cameraPopupPosition.y,
              });
            }
          }}
        >
          {/* Header with minimize button */}
          <div className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-1 flex justify-between items-center z-10 cursor-move">
            {!isCameraPopupMinimized && (
              <span className="text-white text-xs px-2">You</span>
            )}
            <button
              onClick={() => setIsCameraPopupMinimized(!isCameraPopupMinimized)}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            >
              {isCameraPopupMinimized ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 12h-15m0 0l7.5-7.5M4.5 12l7.5 7.5"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Video content */}
          {!isCameraPopupMinimized && (
            <VideoRenderer
              stream={localStreamRef.current}
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Muted indicator */}
          {!isAudioEnabled && !isCameraPopupMinimized && (
            <div className="absolute top-8 right-2 bg-red-600 p-1 rounded-md shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3 h-3 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                />
              </svg>
            </div>
          )}

          {/* Camera off indicator */}
          {!isVideoEnabled && !isCameraPopupMinimized && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveClassroom;
