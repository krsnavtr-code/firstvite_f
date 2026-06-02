import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

const SOCKET_URL = "https://www.eklabya.com";

let socket = null;

export const initializeSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("[SOCKET] No token found for socket connection");
    return null;
  }

  console.log(`[SOCKET] Connecting to ${SOCKET_URL}`);

  // --- Inside socketClient.js ---
  socket = io(SOCKET_URL, {
    auth: { token: token },
    transports: ["websocket"], // Hard fallback block karke direct layer open karein
    upgrade: false, // In-transit handshakes drop hone se bachaega
    reconnection: true,
    reconnectionDelay: 500, // Connection drop hote hi 0.5 sec me reconnect karega
    reconnectionAttempts: 10,
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
