import React, { useEffect, useRef } from "react";

const VideoRenderer = ({
  stream,
  muted = false,
  className = "",
  onStreamEnd,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;

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

export default VideoRenderer;
