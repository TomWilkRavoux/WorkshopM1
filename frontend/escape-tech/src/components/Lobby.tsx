import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000"); // adresse du back Flask

export default function Lobby() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connecté au serveur Socket.IO !");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur de connexion :", err.message);
    });

    socket.on("server_message", (data) => {
      console.log("💬 Message serveur :", data.msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleReady = () => {
    console.log("✅ Joueur prêt :", { username, role, room });
    // on testera la room ici
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Lobby</h1>
      <input
        placeholder="Nom"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Choisis un rôle</option>
        <option value="medecin">Médecin</option>
        <option value="pharmacien">Pharmacien</option>
      </select>
      <button onClick={handleReady}>Prêt</button>
    </div>
  );
}
