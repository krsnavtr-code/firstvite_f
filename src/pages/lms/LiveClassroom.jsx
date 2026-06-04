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
import { useClassroomMedia } from "../../hooks/useClassroomMedia";
import VideoRenderer from "./VideoRenderer";
import ChatPanel from "./ChatPanel";
import ControlDeck from "./ControlDeck";

const LiveClassroom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const socket = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenShareContainerRef = useRef(null);
  const remoteScreenContainerRef = useRef(null);
  const peersRef = useRef({});
  const screenSharePeersRef = useRef({});
  const screenShareStreamRef = useRef(null);
  const remoteStreamsRef = useRef({});
  const forceUpdateRef = useRef(0);
  const heartbeatTimerRef = useRef(null); // Heartbeat track karne ke liye
  const [peerStatus, setPeerStatus] = useState({}); // Connection establish hua ya nahi track karne ke liye

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionState, setConnectionState] = useState("connecting");
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  // Screen Share & Approval States
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareRequests, setScreenShareRequests] = useState([]);

  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    handleRemoteMuteAction,
  } = useClassroomMedia(socket, sessionId, peersRef, localStreamRef);

  const triggerUpdate = useCallback(() => {
    forceUpdateRef.current += 1;
    setParticipants((prev) => [...prev]);
  }, []);

  const forceVideoBitrate = (sdp, bitrateKbps) => {
    const lines = sdp.split("\r\n");
    let mVideoIndex = lines.findIndex((line) => line.indexOf("m=video") === 0);
    if (mVideoIndex === -1) return sdp;
    lines.splice(mVideoIndex + 1, 0, `b=AS:${bitrateKbps}`);
    return lines.join("\r\n");
  };

  const toggleFullscreen = (targetRef) => {
    if (!targetRef.current) return;
    if (!document.fullscreenElement) {
      if (targetRef.current.requestFullscreen)
        targetRef.current.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    initializeClassroom();
    return () => cleanup();
  }, [sessionId]);

  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current
        .play()
        .catch((err) => console.error("Video play error:", err));
    }
  }, [localStreamRef.current]);

  const initializeClassroom = async () => {
    try {
      setConnectionState("connecting");
      const sessionData = await getClassroomSession(sessionId);
      setSession(sessionData?.data || sessionData);

      await joinClassroomSession(sessionId);
      socket.current = getSocket();
      setupSocketListeners();

      let stream = await navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: true,
        })
        .catch(() =>
          navigator.mediaDevices
            .getUserMedia({ video: false, audio: true })
            .catch(() => null),
        );

      localStreamRef.current = stream;

      const role = currentUser?.role || "student";
      socket.current.emit("join-classroom", { sessionId, role });
    } catch (err) {
      setError(`Failed to initialize: ${err.message}`);
      setConnectionState("disconnected");
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket.current) return;

    // 🔥 FIX 1: KEEP CONNECTION ALIVE (No more 45-second drops)
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setInterval(() => {
      if (socket.current?.connected) {
        socket.current.emit("heartbeat");
      }
    }, 15000); // Har 15 second me server ko signal jayega

    socket.current.on("connect", () => setConnectionState("connected"));
    socket.current.on("disconnect", () => setConnectionState("disconnected"));

    // --- 1. USER JOINED LOGIC ---
    socket.current.on(
      "user-joined",
      ({ userId, role, fullname, timestamp }) => {
        if (userId === currentUser._id) return;
        setParticipants((prev) =>
          prev.some((p) => p.userId === userId)
            ? prev
            : [...prev, { userId, role, fullname, joinedAt: timestamp }],
        );

        // 🔥 FIX 1: ONLY TEACHER INITIATES THE CALL
        const isMeTeacher =
          currentUser?.role?.toLowerCase() === "teacher" ||
          currentUser?.role?.toLowerCase() === "admin";
        const isNewUserStudent =
          role?.toLowerCase() !== "teacher" && role?.toLowerCase() !== "admin";

        if (isMeTeacher && isNewUserStudent) {
          // Teacher is calling the new student
          setTimeout(() => createPeerConnection(userId, true), 100);
        }
      },
    );

    // --- 2. PARTICIPANTS LIST LOGIC ---
    socket.current.on("participants-list", ({ participants }) => {
      const otherParticipants = participants.filter(
        (p) => p.userId !== currentUser._id,
      );
      setParticipants(otherParticipants);
      setLoading(false);
      setConnectionState("connected");

      // 🔥 FIX 2: ONLY TEACHER INITIATES CALLS TO EXISTING STUDENTS
      const isMeTeacher =
        currentUser?.role?.toLowerCase() === "teacher" ||
        currentUser?.role?.toLowerCase() === "admin";

      if (isMeTeacher) {
        otherParticipants.forEach((p) => {
          const isPeerStudent =
            p.role?.toLowerCase() !== "teacher" &&
            p.role?.toLowerCase() !== "admin";
          if (isPeerStudent) {
            setTimeout(() => createPeerConnection(p.userId, true), 100);
          }
        });
      }
    });

    // --- 3. WEBRTC OFFER RECEIVER LOGIC ---
    socket.current.on(
      "webrtc-offer",
      async ({ offer, fromUserId, fromUserRole }) => {
        // 🔥 FIX 3: STUDENT ACCEPTS THE CALL FROM TEACHER
        const isMeStudent =
          currentUser?.role?.toLowerCase() !== "teacher" &&
          currentUser?.role?.toLowerCase() !== "admin";
        const isFromTeacher =
          fromUserRole?.toLowerCase() === "teacher" ||
          fromUserRole?.toLowerCase() === "admin";

        // Sirf tabhi accept karein jab Student ko Teacher call kare (ya Teacher ko Screen share karni ho)
        if (isMeStudent && !isFromTeacher) return;

        if (peersRef.current[fromUserId])
          peersRef.current[fromUserId].destroy();
        createPeerConnection(fromUserId, false, offer); // isInitiator = false
      },
    );

    // --- 1. WEBRTC ANSWER FIX ---
    socket.current.on("webrtc-answer", async ({ answer, fromUserId }) => {
      const peer = peersRef.current[fromUserId];
      // 🔥 FIX: Check if peer exists and is not destroyed
      if (peer && !peer.destroyed) {
        peer.signal(answer);
      }
    });

    // --- 2. WEBRTC ICE CANDIDATE FIX ---
    socket.current.on(
      "webrtc-ice-candidate",
      async ({ candidate, fromUserId }) => {
        const peer = peersRef.current[fromUserId];
        if (peer && !peer.destroyed) {
          // 🔥 FIX: Removed extra {} wrappers around candidate
          peer.signal(candidate);
        }
      },
    );

    // Screen Share Approval & Pipeline Events
    socket.current.on("screen-share-requested", ({ studentId, fullname }) => {
      if (currentUser?.role === "teacher") {
        setScreenShareRequests((prev) => {
          if (prev.find((req) => req.studentId === studentId)) return prev;
          return [...prev, { studentId, fullname }];
        });
      }
    });

    socket.current.on("screen-share-approved", () => {
      startScreenShareProcess();
    });

    socket.current.on(
      "screen-share-offer",
      async ({ offer, fromUserId, fromUserRole }) => {
        const shouldAccept =
          currentUser?.role === "teacher"
            ? fromUserRole === "student"
            : fromUserRole === "teacher";
        if (!shouldAccept) return;
        createScreenSharePeerConnection(fromUserId, false, offer);
      },
    );

    // --- 3. SCREEN SHARE ANSWER FIX ---
    socket.current.on("screen-share-answer", async ({ answer, fromUserId }) => {
      const peer = screenSharePeersRef.current[fromUserId];
      if (peer && !peer.destroyed) {
        peer.signal(answer);
      }
    });

    // --- 4. SCREEN SHARE ICE CANDIDATE FIX ---
    socket.current.on(
      "screen-share-ice-candidate",
      async ({ candidate, fromUserId }) => {
        const peer = screenSharePeersRef.current[fromUserId];
        if (peer && !peer.destroyed) {
          // 🔥 FIX: Removed extra {} wrappers
          peer.signal(candidate);
        }
      },
    );

    socket.current.on("stop-screen-share", ({ fromUserId }) => {
      screenSharePeersRef.current[fromUserId]?.destroy();
      delete screenSharePeersRef.current[fromUserId];
      delete remoteStreamsRef.current[`screen-${fromUserId}`];
      triggerUpdate();
    });

    socket.current.on("user-left", ({ userId }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      delete remoteStreamsRef.current[userId];
      delete remoteStreamsRef.current[`screen-${userId}`];
      peersRef.current[userId]?.destroy();
      delete peersRef.current[userId];
      triggerUpdate();
    });

    socket.current.on("chat-message", (messageData) =>
      setChatMessages((prev) => [...prev, messageData]),
    );
    socket.current.on(
      "student-muted",
      ({ studentUserId }) =>
        studentUserId === currentUser._id && handleRemoteMuteAction(true),
    );
    socket.current.on(
      "all-muted",
      () => currentUser?.role === "student" && handleRemoteMuteAction(true),
    );
  };

  const createPeerConnection = (
    remoteUserId,
    isInitiator,
    incomingOffer = null,
  ) => {
    if (peersRef.current[remoteUserId]) return;

    const peer = new SimplePeer({
      initiator: isInitiator,
      trickle: true,
      stream: localStreamRef.current,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" }, // Robust mobile fallback
        ],
      },
    });

    // 🔥 FIX 2: TRACK SUCCESSFUL TUNNEL CONNECTION
    peer.on("connect", () => {
      setPeerStatus((prev) => ({ ...prev, [remoteUserId]: "connected" }));
    });

    // 🔥 FIX 3: PREVENT SIGNALING PAYLOAD CRASHES
    peer.on("signal", (data) => {
      if (data.type === "offer") {
        socket.current?.emit("webrtc-offer", {
          sessionId,
          offer: data,
          toUserId: remoteUserId,
        });
      } else if (data.type === "answer") {
        socket.current?.emit("webrtc-answer", {
          sessionId,
          answer: data,
          toUserId: remoteUserId,
        });
      } else {
        socket.current?.emit("webrtc-ice-candidate", {
          sessionId,
          candidate: data,
          toUserId: remoteUserId,
        });
      }
    });

    peer.on("stream", (remoteStream) => {
      remoteStreamsRef.current[remoteUserId] = remoteStream;
      triggerUpdate();
    });

    peer.on("close", () => destroyPeer(remoteUserId));
    if (incomingOffer) peer.signal(incomingOffer);
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
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
      sdpTransform: (sdp) => forceVideoBitrate(sdp, 2000),
    });

    peer.on("signal", (data) => {
      const type =
        data.type === "offer"
          ? "screen-share-offer"
          : data.type === "answer"
            ? "screen-share-answer"
            : "screen-share-ice-candidate";
      socket.current?.emit(type, {
        sessionId,
        [data.type || "candidate"]: data.type ? data : data.candidate,
        toUserId: remoteUserId,
      });
    });

    peer.on("stream", (incomingScreenStream) => {
      remoteStreamsRef.current[`screen-${remoteUserId}`] = incomingScreenStream;
      triggerUpdate();
    });

    if (incomingOffer) peer.signal(incomingOffer);
    screenSharePeersRef.current[remoteUserId] = peer;
  };

  // Modified Screen Share Entry Point
  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShareProcess();
    } else {
      if (currentUser?.role === "student") {
        socket.current.emit("request-screen-share", {
          sessionId,
          userId: currentUser._id,
          fullname: currentUser.fullname,
        });
        alert(
          "Screen share request sent to the teacher. Please wait for approval.",
        );
      } else {
        startScreenShareProcess();
      }
    }
  };

  const stopScreenShareProcess = () => {
    screenShareStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenShareStreamRef.current = null;
    setIsScreenSharing(false);
    socket.current.emit("stop-screen-share", { sessionId });
    Object.keys(screenSharePeersRef.current).forEach((id) =>
      screenSharePeersRef.current[id].destroy(),
    );
    screenSharePeersRef.current = {};
  };

  const startScreenShareProcess = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 20, max: 30 },
        },
      });
      if (stream.getVideoTracks()[0])
        stream.getVideoTracks()[0].contentHint = "detail";
      screenShareStreamRef.current = stream;
      setIsScreenSharing(true);

      participants
        .filter((p) =>
          currentUser?.role === "teacher"
            ? p.role === "student"
            : p.role === "teacher",
        )
        .forEach((p) => createScreenSharePeerConnection(p.userId, true));

      stream.getVideoTracks()[0].onended = () => stopScreenShareProcess();
    } catch (err) {
      console.error(err);
    }
  };

  // Teacher Modals for Approval
  const approveScreenShare = (studentId) => {
    socket.current.emit("approve-screen-share", { sessionId, studentId });
    setScreenShareRequests((prev) =>
      prev.filter((r) => r.studentId !== studentId),
    );
  };
  const rejectScreenShare = (studentId) => {
    setScreenShareRequests((prev) =>
      prev.filter((r) => r.studentId !== studentId),
    );
  };

  const toggleHandRaise = () => {
    const updatedState = !isHandRaised;
    setIsHandRaised(updatedState);
    socket.current.emit(updatedState ? "raise-hand" : "lower-hand", {
      sessionId,
    });
  };

  const destroyPeer = (userId) => {
    if (peersRef.current[userId]) {
      peersRef.current[userId].destroy();
      delete peersRef.current[userId];
    }
  };

  const cleanup = () => {
    if (localStreamRef.current)
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    if (screenShareStreamRef.current)
      screenShareStreamRef.current.getTracks().forEach((t) => t.stop());
    Object.values(peersRef.current).forEach((p) => p.destroy());
    Object.values(screenSharePeersRef.current).forEach((p) => p.destroy());
    if (socket.current) {
      socket.current.emit("leave-classroom", { sessionId });
      disconnectSocket();
    }
  };

  const leaveClassroom = async () => {
    cleanup();
    await leaveClassroomSession(sessionId);
    navigate("/lms/classroom-sessions");
  };

  // Chat Form Fix
  const sendChatMessage = (e) => {
    e.preventDefault(); // 🔥 FIX: Prevents page reload on chat submission
    if (!chatInput.trim()) return;
    const messageData = {
      sessionId,
      userId: currentUser._id,
      fullname: currentUser.fullname,
      message: chatInput,
      timestamp: new Date().toISOString(),
    };
    socket.current.emit("chat-message", messageData);
    setChatInput("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading context...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white flex flex-col min-h-screen">
      {/* Teacher Screen Share Notifications Overlay */}
      {currentUser?.role === "teacher" && screenShareRequests.length > 0 && (
        <div className="fixed top-20 right-4 z-[99] flex flex-col gap-2">
          {screenShareRequests.map((req) => (
            <div
              key={req.studentId}
              className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border border-blue-500/30 flex flex-col gap-3 animate-slide-up"
            >
              <p className="text-sm font-semibold">
                {req.fullname} wants to share their screen.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => approveScreenShare(req.studentId)}
                  className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectScreenShare(req.studentId)}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header Pipeline - Student Clean View */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-sm font-bold">Session: {session?.batch?.name}</h1>
        <div className="flex items-center gap-4">
          {currentUser?.role === "teacher" && (
            <span className="text-sm font-semibold bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-lg">
              Active Members:{" "}
              <span className="text-blue-500">{participants.length + 1}</span>
            </span>
          )}
          <button
            onClick={leaveClassroom}
            className="px-4 py-1.5 text-white bg-red-600 hover:bg-red-700 transition-colors rounded text-sm font-semibold"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 pb-24">
          {isScreenSharing && screenShareStreamRef.current && (
            <div
              ref={screenShareContainerRef}
              className="relative rounded-xl overflow-hidden bg-black w-full aspect-video max-h-[50vh] flex items-center justify-center fullscreen:w-screen fullscreen:h-screen"
            >
              <VideoRenderer
                stream={screenShareStreamRef.current}
                muted
                className="w-full h-full object-contain fullscreen:w-screen fullscreen:h-screen"
              />
              <button
                onClick={() => toggleFullscreen(screenShareContainerRef)}
                className="absolute top-3 right-3 bg-black/60 p-2 rounded-xl text-white"
              >
                Full
              </button>
            </div>
          )}

          {Object.keys(remoteStreamsRef.current)
            .filter((k) => k.startsWith("screen-"))
            .filter((key) => {
              const userId = key.replace("screen-", "");
              const participant = participants.find((p) => p.userId === userId);
              if (!participant) return false;
              return currentUser?.role === "teacher"
                ? participant.role === "student"
                : participant.role === "teacher";
            })
            .map((key) => (
              <div
                key={key}
                ref={remoteScreenContainerRef}
                className="relative rounded-xl overflow-hidden bg-black w-full aspect-video max-h-[50vh] fullscreen:w-screen fullscreen:h-screen"
              >
                <VideoRenderer
                  stream={remoteStreamsRef.current[key]}
                  className="w-full h-full object-contain fullscreen:w-screen fullscreen:h-screen"
                />
                <button
                  onClick={() => toggleFullscreen(remoteScreenContainerRef)}
                  className="absolute top-3 right-3 bg-black/60 p-2 rounded-xl text-white"
                >
                  Full
                </button>
              </div>
            ))}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!isScreenSharing && (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-900 border border-gray-800 shadow-sm">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  You
                </div>
              </div>
            )}

            {/* 🔥 FIX 4: SMART ROLE FILTER (Case-Insensitive) */}
            {participants
              .filter((p) =>
                currentUser?.role === "teacher"
                  ? p.role === "student"
                  : p.role === "teacher",
              )
              .map((p) => (
                <div
                  key={p.userId}
                  className="relative rounded-xl overflow-hidden aspect-video bg-gray-900 border border-gray-800 shadow-sm"
                >
                  {remoteStreamsRef.current[p.userId] ? (
                    <VideoRenderer
                      stream={remoteStreamsRef.current[p.userId]}
                      className="w-full h-full object-cover"
                    />
                  ) : peerStatus[p.userId] === "connected" ? (
                    // 🔥 FIX 4: SHOW THIS IF CONNECTED BUT NO CAMERA/MIC
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                      <div className="h-16 w-16 bg-gray-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2 shadow-inner uppercase">
                        {p.fullname.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-400">
                        Mic / Cam Off
                      </span>
                    </div>
                  ) : (
                    // SHOW SPINNER ONLY WHILE ESTABLISHING TUNNEL
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-blue-400 bg-gray-900">
                      <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></span>
                      Connecting Securely...
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    {p.fullname}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <ChatPanel
          showChat={showChat}
          setShowChat={setShowChat}
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          sendChatMessage={sendChatMessage}
          currentUserId={currentUser._id}
        />
      </div>

      <ControlDeck
        isAudioEnabled={isAudioEnabled}
        toggleAudio={toggleAudio}
        isVideoEnabled={isVideoEnabled}
        toggleVideo={toggleVideo}
        isScreenSharing={isScreenSharing}
        toggleScreenShare={toggleScreenShare}
        isHandRaised={isHandRaised}
        toggleHandRaise={toggleHandRaise}
        showChat={showChat}
        setShowChat={setShowChat}
        userRole={currentUser?.role}
      />
    </div>
  );
};

export default LiveClassroom;
