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
          let oldVideoTrack = localStreamRef.current.getVideoTracks()[0];

          if (oldVideoTrack && oldVideoTrack.readyState === "live") {
            oldVideoTrack.enabled = true;
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

            if (oldVideoTrack) {
              localStreamRef.current.removeTrack(oldVideoTrack);
            }
            localStreamRef.current.addTrack(newVideoTrack);

            // 🔥 FIX: Correctly replacing the SENT track, NOT the received track
            Object.values(peersRef.current).forEach((peer) => {
              if (peer && !peer.destroyed) {
                if (oldVideoTrack) {
                  try {
                    // 1st arg: purana bheja hua track, 2nd: Naya track, 3rd: Humari local stream
                    peer.replaceTrack(
                      oldVideoTrack,
                      newVideoTrack,
                      localStreamRef.current,
                    );
                  } catch (e) {
                    peer.addTrack(newVideoTrack, localStreamRef.current);
                  }
                } else {
                  peer.addTrack(newVideoTrack, localStreamRef.current);
                }
              }
            });
          }
        } catch (err) {
          console.error("[VIDEO HOOK ERROR] Cannot enable camera:", err);
          return;
        }
      } else {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = false;
          setTimeout(() => {
            track.stop();
          }, 100);
        });
      }

      setIsVideoEnabled(currentState);
      socket.current?.emit("toggle-video", {
        sessionId,
        isVideoOff: !currentState, // false means video is ON, true means OFF
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
