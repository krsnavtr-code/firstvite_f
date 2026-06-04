import { useState } from "react";

export const useClassroomMedia = (
  socket,
  sessionId,
  peersRef,
  localStreamRef,
) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const currentState = !isAudioEnabled;
      localStreamRef.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = currentState));
      setIsAudioEnabled(currentState);
      socket.current?.emit("toggle-audio", {
        sessionId,
        isMuted: !currentState,
      });
    }
  };

  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const currentState = !isVideoEnabled;

      if (currentState) {
        try {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = true;
          } else {
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

            Object.values(peersRef.current).forEach((peer) => {
              if (peer.streams[0] && peer.streams[0].getVideoTracks()[0]) {
                peer.replaceTrack(
                  peer.streams[0].getVideoTracks()[0],
                  newVideoTrack,
                  peer.streams[0],
                );
              }
            });
          }
        } catch (err) {
          console.error("[VIDEO HOOK ERROR] Cannot enable camera:", err);
          return;
        }
      } else {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.stop();
          localStreamRef.current.removeTrack(track);
        });
      }

      setIsVideoEnabled(currentState);
      socket.current?.emit("toggle-video", {
        sessionId,
        isVideoOff: !currentState,
      });
    }
  };

  const handleRemoteMuteAction = (shouldMute) => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = !shouldMute));
      setIsAudioEnabled(!shouldMute);
    }
  };

  return {
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    handleRemoteMuteAction,
    setIsAudioEnabled,
  };
};
