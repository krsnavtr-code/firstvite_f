import React, { useEffect, useRef, useState } from "react";

const VideoRenderer = ({
  stream,
  muted = false,
  className = "",
  onStreamEnd,
}) => {
  const videoRef = useRef(null);
  const [playError, setPlayError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;

    const handleTrackEnd = () => {
      if (onStreamEnd) onStreamEnd();
    };

    stream
      .getTracks()
      .forEach((track) => track.addEventListener("ended", handleTrackEnd));

    // 🔥 FIX: Handle Mobile Autoplay Blocks
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(
          "Autoplay blocked by browser. User interaction required:",
          err,
        );
        setPlayError(true);
      });
    }

    return () => {
      stream
        .getTracks()
        .forEach((track) => track.removeEventListener("ended", handleTrackEnd));
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream, onStreamEnd]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={className}
      />

      {/* Play Button Overlay for Mobile Browsers */}
      {playError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 rounded-xl">
          <button
            onClick={() => {
              videoRef.current?.play();
              setPlayError(false);
            }}
            className="bg-blue-600 animate-bounce text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/50"
          >
            ▶ Tap to Play Video
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoRenderer;
