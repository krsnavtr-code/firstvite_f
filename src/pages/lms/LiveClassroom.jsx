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
  const screenShareContainerRef = useRef(null);
  const remoteScreenContainerRef = useRef(null);
  const peersRef = useRef({});
  const screenSharePeersRef = useRef({});
  const screenShareStreamRef = useRef(null);
  const remoteStreamsRef = useRef({});
  const forceUpdateRef = useRef(0);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionState, setConnectionState] = useState("connecting");
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isCameraPopupMinimized, setIsCameraPopupMinimized] = useState(false);
  const [cameraPopupPosition, setCameraPopupPosition] = useState({
    x: 20,
    y: 20,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const {
    localStreamRef,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    handleRemoteMuteAction,
  } = useClassroomMedia(socket, sessionId, peersRef);

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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setCameraPopupPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

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
      if (stream && localVideoRef.current)
        localVideoRef.current.srcObject = stream;

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

    socket.current.on("connect", () => setConnectionState("connected"));
    socket.current.on("disconnect", () => setConnectionState("disconnected"));

    socket.current.on(
      "user-joined",
      ({ userId, role, fullname, timestamp }) => {
        if (userId === currentUser._id) return;
        setParticipants((prev) =>
          prev.some((p) => p.userId === userId)
            ? prev
            : [...prev, { userId, role, fullname, joinedAt: timestamp }],
        );

        const shouldConnect =
          currentUser?.role === "teacher"
            ? role === "student"
            : role === "teacher";
        if (shouldConnect) {
          setTimeout(() => createPeerConnection(userId, true), 100);
        }
      },
    );

    socket.current.on("participants-list", ({ participants }) => {
      const otherParticipants = participants.filter(
        (p) => p.userId !== currentUser._id,
      );
      setParticipants(otherParticipants);
      setLoading(false);
      setConnectionState("connected");

      otherParticipants.forEach((p) => {
        const shouldConnect =
          currentUser?.role === "teacher"
            ? p.role === "student"
            : p.role === "teacher";
        if (shouldConnect) {
          setTimeout(() => createPeerConnection(p.userId, true), 100);
        }
      });
    });

    socket.current.on(
      "webrtc-offer",
      async ({ offer, fromUserId, fromUserRole }) => {
        const shouldAccept =
          currentUser?.role === "teacher"
            ? fromUserRole === "student"
            : fromUserRole === "teacher";
        if (!shouldAccept) return;

        if (peersRef.current[fromUserId])
          peersRef.current[fromUserId].destroy();
        createPeerConnection(fromUserId, false, offer);
      },
    );

    socket.current.on("webrtc-answer", async ({ answer, fromUserId }) => {
      peersRef.current[fromUserId]?.signal(answer);
    });

    socket.current.on(
      "webrtc-ice-candidate",
      async ({ candidate, fromUserId }) => {
        peersRef.current[fromUserId]?.signal({ candidate });
      },
    );

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
    socket.current.on("screen-share-answer", async ({ answer, fromUserId }) =>
      screenSharePeersRef.current[fromUserId]?.signal(answer),
    );
    socket.current.on(
      "screen-share-ice-candidate",
      async ({ candidate, fromUserId }) =>
        screenSharePeersRef.current[fromUserId]?.signal({ candidate }),
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
        ],
      },
    });

    peer.on("signal", (data) => {
      const type =
        data.type === "offer"
          ? "webrtc-offer"
          : data.type === "answer"
            ? "webrtc-answer"
            : "webrtc-ice-candidate";
      socket.current?.emit(type, {
        sessionId,
        [data.type || "candidate"]: data.type ? data : data.candidate,
        toUserId: remoteUserId,
      });
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

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      screenShareStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenShareStreamRef.current = null;
      setIsScreenSharing(false);
      socket.current.emit("stop-screen-share", { sessionId });
      Object.keys(screenSharePeersRef.current).forEach((id) =>
        screenSharePeersRef.current[id].destroy(),
      );
      screenSharePeersRef.current = {};
    } else {
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
        stream.getVideoTracks()[0].onended = () => toggleScreenShare();
      } catch (err) {
        console.error(err);
      }
    }
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

  const sendChatMessage = () => {
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
      <div className="px-6 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-sm font-bold">Session: {session?.batch?.name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">
            Active Members: {participants.length + 1}
          </span>
          <button
            onClick={leaveClassroom}
            className="px-4 py-1.5 text-white bg-red-600 rounded text-sm font-semibold"
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
                className="w-full h-full object-contain"
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
                className="relative rounded-xl overflow-hidden bg-black w-full aspect-video max-h-[50vh]"
              >
                <VideoRenderer
                  stream={remoteStreamsRef.current[key]}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => toggleFullscreen(remoteScreenContainerRef)}
                  className="absolute top-3 right-3 bg-black/60 p-2 rounded-xl text-white"
                >
                  Full
                </button>
              </div>
            ))}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {!isScreenSharing && (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-900">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  You
                </div>
              </div>
            )}

            {participants
              .filter((p) =>
                currentUser?.role === "teacher"
                  ? p.role === "student"
                  : p.role === "teacher",
              )
              .map((p) => (
                <div
                  key={p.userId}
                  className="relative rounded-xl overflow-hidden aspect-video bg-gray-900"
                >
                  {remoteStreamsRef.current[p.userId] ? (
                    <VideoRenderer
                      stream={remoteStreamsRef.current[p.userId]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                      Connecting...
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
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
