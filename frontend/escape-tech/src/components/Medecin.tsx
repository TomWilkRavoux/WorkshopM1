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

interface SymptomeData {
  username: string;
  maladie: string;
  symptome: string;
}

const [popup, setPopup] = useState<SymptomeData | null>(null);

export default function PharmacienPage() {
    const location = useLocation();
    const { username, room, role } = location.state as LocationState;
    
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        // Rejoindre automatiquement la room
        socket.emit("join_room", { username, room });

        socket.on("symptome_envoi", (data: SymptomeData) => {
            setPopup(data); // ouvre un popup avec le symptom envoyé par le medecin
        });

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
        //socket.off("symptome_envoi");
  
        };
    }, [username, room]);

    const sendMessage = () => {    if (!message.trim()) return;
        socket.emit("chat_message", { username, room, msg: message });
        setMessage("");
    };  

    return (
        <div style={{ 
            padding: "2rem", 
            maxWidth: "800px", 
            margin: "0 auto",
            minHeight: "100vh",
            background: "#f0fff0"
            }}>
            <div style={{ 
                background: "white", 
                padding: "2rem", 
                borderRadius: "10px",
                marginBottom: "2rem",
                border: "3px solid #50E3C2"
            }}>
                <h1>💊 Interface Pharmacien</h1>
                <p><strong>Pharmacien:</strong> {username}</p>
                <p><strong>Room:</strong> {room}</p>
                <p><strong>Statut:</strong> En ligne</p>
            </div>

            {/* Zone des médicaments */}
            <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "10px",
                marginBottom: "2rem"
            }}>
                <h2>💊 Inventaire des Médicaments</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                {["Paracétamol", "Ibuprofène", "Aspirine", "Antibiotique", "Sirop", "Pommade"].map((med) => (
                    <button
                    key={med}
                    style={{
                        padding: "15px",
                        backgroundColor: "#e3f2fd",
                        border: "1px solid #2196f3",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                    >
                    {med}
                    </button>
                ))}
                </div>
            </div>

            {/* Chat avec le médecin */}
            <div style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "10px"
            }}>
                <h3>💬 Communication avec le Médecin</h3>
                
                <div style={{
                    border: "1px solid #ccc",
                    height: "200px",
                    overflowY: "auto",
                    padding: "10px",
                    marginBottom: "10px",
                    backgroundColor: "#f9f9f9"
                }}>
                    {messages.map((msg, index) => (
                        <div key={index} style={{ marginBottom: "5px" }}>
                        {msg}
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Écrivez votre message..."
                        style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc"
                        }}
                    />
                    <button
                        onClick={sendMessage}
                        style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                        }}
                    >
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    );
}