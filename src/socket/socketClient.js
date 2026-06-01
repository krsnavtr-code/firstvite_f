import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4002";

let socket = null;

export const initializeSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("[SOCKET] No token found for socket connection");
    return null;
  }

  console.log(`[SOCKET] Connecting to ${SOCKET_URL}`);

  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 10000, // 10 second connection timeout
  });

  socket.on("connect", () => {
    console.log("[SOCKET] Connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("[SOCKET] Connection error:", error.message);
    console.error("[SOCKET] Error details:", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("[SOCKET] Disconnected:", reason);
  });

  // Add connection timeout warning
  setTimeout(() => {
    if (socket && !socket.connected) {
      console.warn("[SOCKET] Connection taking longer than expected...");
    }
  }, 5000);

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;
