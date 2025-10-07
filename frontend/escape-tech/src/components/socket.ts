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

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:5000" // ton backend Flask
);

export default socket;
