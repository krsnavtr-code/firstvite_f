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
          // Camera on karne ki koshish (Check karein kya pehle se track hai)
          let videoTrack = localStreamRef.current.getVideoTracks()[0];
          
          if (videoTrack && videoTrack.readyState === "live") {
            // Agar track exist karta hai aur zinda hai, toh bas enable kardo
            videoTrack.enabled = true;
          } else {
            // Agar track stop ho chuka tha ya permission hi nahi di thi, naya laao
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: "user",
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
              audio: false,
            });
            const newVideoTrack = newStream.getVideoTracks()[0];
            
            // Purana band ya kharab track remove kardo
            if (videoTrack) {
                localStreamRef.current.removeTrack(videoTrack);
            }
            // Naya fresh track local stream me add kardo
            localStreamRef.current.addTrack(newVideoTrack);

            // 🔥 FIX: Check karein ki peer pipeline me replace karna hai ya add
            Object.values(peersRef.current).forEach((peer) => {
              if (peer && !peer.destroyed && peer.streams[0]) {
                const oldPeerTrack = peer.streams[0].getVideoTracks()[0];
                
                if (oldPeerTrack) {
                  // Agar WebRTC connection pipeline me track tha, toh safely replace karo
                  try {
                    peer.replaceTrack(oldPeerTrack, newVideoTrack, peer.streams[0]);
                  } catch (e) {
                    // Fallback for "Cannot replace track that was never added"
                    peer.addTrack(newVideoTrack, peer.streams[0]);
                  }
                } else {
                  // Agar pipeline me track gaya hi nahi tha, toh seedhe naya add karo
                  peer.addTrack(newVideoTrack, peer.streams[0]);
                }
              }
            });
          }
        } catch (err) {
          console.error("[VIDEO HOOK ERROR] Cannot enable camera:", err);
          return; // Early exit so state doesnt update if camera fails
        }
      } else {
        // Camera band karne par
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = false; // Soft stop (maintain track object to avoid replaceTrack error later)
          setTimeout(() => {
              track.stop(); // Hard stop hardware light after a delay
          }, 100);
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