import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import socket from "../components/socket";

// --- Typage des événements ---
interface ChatResponse {
    username: string;
    msg: string;
}

interface ServerMessage {
    msg: string;
}

interface TimerUpdate {
    time: number;
}

function RoomTest() {
    const [username, setUsername] = useState<string>("");
    const [room, setRoom] = useState<string>("");
    const [joined, setJoined] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<string[]>([]);
    const [timer, setTimer] = useState<number | null>(null);

    // === Gestion des events Socket.IO ===
    useEffect(() => {
        const handleServerMessage = (data: ServerMessage) => {
            setMessages((prev) => [...prev, `[SYSTEM] ${data.msg}`]);
        };

        const handleChatResponse = (data: ChatResponse) => {
            setMessages((prev) => [...prev, `${data.username}: ${data.msg}`]);
        };

        const handleTimerUpdate = (data: TimerUpdate) => {
            setTimer(data.time);
        };

        socket.on("server_message", handleServerMessage);
        socket.on("chat_response", handleChatResponse);
        socket.on("timer_update", handleTimerUpdate);

        return () => {
            socket.off("server_message", handleServerMessage);
            socket.off("chat_response", handleChatResponse);
            socket.off("timer_update", handleTimerUpdate);
        };
    }, []);

    const joinRoom = () => {
        if (!username || !room) {
            alert("Pseudo et room obligatoires !");
            return;
        }
        socket.emit("join_room", { username, room });
        setJoined(true);
        ;
    }

    const leaveRoom = () => {
        socket.emit("leave_room", { username, room });
        setJoined(false);
        setMessages([]);
        setTimer(null);
    };

    const sendMessage = () => {
        if (!message) return;
        socket.emit("chat_message", { username, room, msg: message });
        setMessage("");
    };

    const startGame = () => {
        socket.emit("start_game", { room, duration: 15 }); // 15s pour test
    };

    const handleChange =
        (setter: React.Dispatch<React.SetStateAction<string>>) =>
        (e: ChangeEvent<HTMLInputElement>) =>
            setter(e.target.value);

    return (
            <div className="p-4 max-w-md mx-auto">
            {!joined ? (
                <div>
                <h2 className="text-xl font-bold mb-2">Créer / rejoindre une Room</h2>
                <input
                    placeholder="Ton pseudo"
                    value={username}
                    onChange={handleChange(setUsername)}
                    className="border p-2 w-full mb-2"
                />
                <input
                    placeholder="Nom de la Room (ex: game1)"
                    value={room}
                    onChange={handleChange(setRoom)}
                    className="border p-2 w-full mb-2"
                />
                <button
                    onClick={joinRoom}
                    className="bg-blue-600 text-white p-2 rounded w-full"
                >
                    🔌 Rejoindre
                </button>
                </div>
            ) : (
                <div>
                <h2 className="text-lg font-bold mb-2">Room : {room}</h2>
                <p className="mb-2">⏱️ Timer : {timer ?? "non démarré"}</p>

                <div className="border p-2 h-48 overflow-y-auto bg-gray-100 mb-2">
                    {messages.map((m, i) => (
                    <div key={i}>{m}</div>
                    ))}
                </div>

                <input
                    placeholder="Écris un message"
                    value={message}
                    onChange={handleChange(setMessage)}
                    onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                    }}
                    className="border p-2 w-full mb-2"
                />
                <div className="flex gap-2">
                    <button
                    onClick={sendMessage}
                    className="bg-green-500 text-white p-2 rounded flex-1"
                    >
                    💬 Envoyer
                    </button>
                    <button
                    onClick={startGame}
                    className="bg-orange-500 text-white p-2 rounded flex-1"
                    >
                    ⏳ Démarrer
                    </button>
                </div>

                <button
                    onClick={leaveRoom}
                    className="bg-red-600 text-white p-2 rounded w-full mt-4"
                >
                    🚪 Quitter la Room
                </button>
                </div>
            )}
            </div>
        );
}

export default RoomTest;
