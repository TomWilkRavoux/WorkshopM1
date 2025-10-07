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
  const [selectedSymptome, setSelectedSymptome] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

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

  const sendSymptome = () => {
  if (!selectedMaladie || !selectedSymptome) return;
  socket.emit("symptome_envoi", {
    username,
    room,
    maladie: selectedMaladie,
    symptome: selectedSymptome
  });
};

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chat_message", { username, room, msg: message });
    setMessage("");
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

      {/* Zone de diagnostic */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "10px",
          marginBottom: "2rem",
        }}
      >
        <h2>📋 Zone de Diagnostic</h2>

        {/* Sélecteur de maladie */}
        <label>
          Choisir une maladie :
          <select
            value={selectedMaladie}
            onChange={(e) =>
              setSelectedMaladie(e.target.value as MaladieKey | "")
            }
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "8px",
              marginBottom: "12px",
            }}
          >
            <option value="">-- Sélectionnez une maladie --</option>
            {Object.keys(maladies).map((maladie) => (
              <option key={maladie} value={maladie}>
                {maladie}
              </option>
            ))}
          </select>
        </label>

        {/* Sélecteur de symptôme */}
        {selectedMaladie && (
          <label>
            Choisir un symptôme :
            <select
              value={selectedSymptome}
              onChange={(e) => setSelectedSymptome(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "8px",
              }}
            >
              <option value="">-- Sélectionnez un symptôme --</option>
              {maladies[selectedMaladie].map((symptome) => (
                <option key={symptome} value={symptome}>
                  {symptome}
                </option>
              ))}
            </select>
          </label>
        )}

        <button onClick={sendSymptome} style={{
                marginTop: "15px",
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
            }}
            >
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
