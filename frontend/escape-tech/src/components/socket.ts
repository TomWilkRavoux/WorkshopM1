import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  server_message: (data: { msg: string }) => void;
  chat_response: (data: { username: string; msg: string }) => void;
  timer_update: (data: { time: number }) => void;
}

interface ClientToServerEvents {
  join_room: (data: { username: string; room: string }) => void;
  leave_room: (data: { username: string; room: string }) => void;
  chat_message: (data: { username: string; room: string; msg: string }) => void;
  start_game: (data: { room: string; duration: number }) => void;
}

// 🔧 URL du backend : locale en dev, Render en prod
const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

console.log("🌍 Backend URL:", backendUrl);

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  backendUrl,
  {
    transports: ["websocket"], // 🔥 garantit la compatibilité Socket.IO/Flask
  }
);

export default socket;
