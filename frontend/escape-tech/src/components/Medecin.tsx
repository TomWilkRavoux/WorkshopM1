import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000");

interface LocationState {
    username: string;
    room: string;
    role: string;
}

interface ChatResponse {
    username: string;
    msg: string;
}

interface ServerMessage {
    msg: string;
}

export default function PharmacienPage() {
    const location = useLocation();
    const { username, room, role } = location.state as LocationState;
    
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // Rejoindre automatiquement la room
        socket.emit("join_room", { username, room });

        const handleServerMessage = (data: ServerMessage) => {
        setMessages((prev) => [...prev, `[SYSTEM] ${data.msg}`]);
        };

        const handleChatResponse = (data: ChatResponse) => {
        setMessages((prev) => [...prev, `${data.username}: ${data.msg}`]);
        };

        socket.on("server_message", handleServerMessage);
        socket.on("chat_response", handleChatResponse);

        return () => {
        socket.off("server_message", handleServerMessage);
        socket.off("chat_response", handleChatResponse);
        };
    }, [username, room]);

    const sendMessage = () => {    if (!message.trim()) return;
        socket.emit("chat_message", { username, room, msg: message });
        setMessage("");
    };  

    return (
        <div className="p-8 max-w-3xl mx-auto min-h-screen bg-green-50">
            <div className="bg-white p-8 rounded-lg mb-8 border-4 border-teal-400">
                <h1 className="text-2xl font-bold">💊 Interface Pharmacien</h1>
                <p><strong>Pharmacien:</strong> {username}</p>
                <p><strong>Room:</strong> {room}</p>
                <p><strong>Statut:</strong> En ligne</p>
            </div>

            {/* Zone des médicaments */}
            <div className="bg-white p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold mb-4">💊 Inventaire des Médicaments</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {["Paracétamol", "Ibuprofène", "Aspirine", "Antibiotique", "Sirop", "Pommade"].map((med) => (
                        <button
                            key={med}
                            className="p-4 bg-blue-50 border border-blue-400 rounded cursor-pointer hover:bg-blue-100"
                        >
                            {med}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat avec le médecin */}
            <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">💬 Communication avec le Médecin</h3>
                
                <div className="border border-gray-300 h-50 overflow-y-auto p-2.5 mb-2.5 bg-gray-50">
                    {messages.map((msg, index) => (
                        <div key={index} className="mb-1.5">
                            {msg}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2.5">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Écrivez votre message..."
                        className="flex-1 p-2.5 rounded border border-gray-300"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-5 py-2.5 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
                    >
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    );
}