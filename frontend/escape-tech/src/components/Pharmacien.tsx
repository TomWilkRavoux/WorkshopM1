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

const maladies = {
    "Grippe saisonnière": [
        "Fièvre élevée",
        "Fatigue intense",
        "Toux sèche",
        "Courbatures",
    ],
    "Angine bactérienne": [
        "Fièvre élevée",
        "Gorge rouge douloureuse",
        "Difficulté à avaler",
        "Fatigue",
    ],
    "Gastro-entérite": [
        "Fièvre légère",
        "Douleurs abdominales",
        "Diarrhée / vomissements",
        "Fatigue",
    ],
    "Covid-19 (forme légère)": [
        "Fièvre légère à modérée",
        "Toux sèche",
        "Fatigue",
        "Perte du goût / odorat",
    ],
} as const;

type MaladieKey = keyof typeof maladies;


export default function MedecinPage() {
    const location = useLocation();
    const { username, room } = location.state as LocationState;

    const [selectedMaladie, setSelectedMaladie] = useState<MaladieKey | "">("");
    // const [selectedSymptome, setSelectedSymptome] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [symptoms, setSymptoms] = useState(""); // Nouvel état pour les symptômes


    useEffect(() => {
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

    // const sendSymptome = () => {
    //     if (!selectedMaladie || !selectedSymptome) return; 
    //     socket.emit("symptome_envoi", {
    //         username,
    //         room,
    //         maladie: selectedMaladie
    //     });
    // };

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit("chat_message", { username, room, msg: message });
        setMessage("");
    };

    // Nouvelle fonction pour envoyer les symptômes
    const sendSymptoms = () => {
        if (!symptoms.trim()) {
            alert("Veuillez décrire les symptômes avant d'envoyer.");
            return;
        }
        
        const symptomMessage = `📋 DIAGNOSTIC: ${symptoms}`;
        socket.emit("chat_message", { username, room, msg: symptomMessage });
        setSymptoms(""); // Vider le champ après envoi
    };    

    return (
        <div
        style={{
            padding: "2rem",
            maxWidth: "800px",
            margin: "0 auto",
            minHeight: "100vh",
            background: "#f0f8ff",
        }}
        >
        <div
            style={{
            background: "white",
            padding: "2rem",
            borderRadius: "10px",
            marginBottom: "2rem",
            border: "3px solid #4A90E2",
            }}
        >
            <h1>👨‍⚕️ Interface Médecin</h1>
            <p>
            <strong>Docteur:</strong> {username}
            </p>
            <p>
            <strong>Room:</strong> {room}
            </p>
        </div>
            {/* Zone de description */}
            <div
            style={{
                background: "white",
                padding: "2rem",
                borderRadius: "10px",
                marginBottom: "2rem",
                border: "3px solid #4A90E2",
            }}
            >
            <h2>🧾 Maladies et Symptômes</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {Object.entries(maladies).map(([maladie, symptomes]) => (
                <div
                    key={maladie}
                    style={{
                    flex: "0 0 48%", // 2 maladies par ligne
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                    backgroundColor: "#f0f8ff",
                    marginBottom: "10px",
                    }}
                >
                    <strong>{maladie}</strong>
                    <div
                    style={{
                        marginTop: "8px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "5px",
                        justifyContent: "center", // centre les symptômes horizontalement
                    }}
                    >
                    {symptomes.map((symptome, i) => (
                        <span
                        key={i}
                        style={{
                            flex: "0 0 48%", // 2 symptômes par ligne
                            padding: "5px 8px",
                            borderRadius: "12px",
                            backgroundColor: "#d1e7dd",
                            fontSize: "0.9rem",
                            textAlign: "center", // centre le texte dans la pill
                        }}
                        >
                        {symptome}
                        </span>
                    ))}
                    </div>
                </div>
                ))}
            </div>
            </div>

        {/* Zone de diagnostic */}
        <div style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "10px",
            marginBottom: "2rem"
        }}>
            <h2>📋 Zone de Diagnostic</h2>
            <textarea
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Décrivez les symptômes du patient..."
            style={{
                width: "100%",
                height: "120px",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                resize: "vertical"
            }}
            />
            <button onClick={sendSymptoms} style={{
            marginTop: "10px",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
            }}>
            📤 Envoyer au Pharmacien
            </button>
        </div>


        {/* Chat */}
        <div
            style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "10px",
            }}
        >
            <h3>💬 Communication avec le Pharmacien</h3>

            <div
            style={{
                border: "1px solid #ccc",
                height: "200px",
                overflowY: "auto",
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: "#f9f9f9",
            }}
            >
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
                border: "1px solid #ccc",
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
                cursor: "pointer",
                }}
            >
                Envoyer
            </button>
            </div>
        </div>
        </div>
    );
}