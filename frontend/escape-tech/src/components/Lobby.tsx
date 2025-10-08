import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000");

interface PlayerStatusUpdate {
  ready_players: string[];
  total_ready: number;
}

interface ServerMessage {
  msg: string;
}

export default function Lobby() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [room, setRoom] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [totalReady, setTotalReady] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ CORRECTION : Réinitialiser les états du lobby au montage
    setIsReady(false);
    setReadyPlayers([]);
    setTotalReady(0);
    setGameStarted(false);

    socket.on("connect", () => {
      console.log("✅ Connecté au serveur Socket.IO !");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur de connexion :", err.message);
    });

    socket.on("server_message", (data: ServerMessage) => {
      console.log("💬 Message serveur :", data.msg);
    });

    socket.on("player_status_update", (data: PlayerStatusUpdate) => {
      console.log("📊 Mise à jour status:", data);
      setReadyPlayers(data.ready_players);
      setTotalReady(data.total_ready);
    });

    socket.on("all_players_ready", (data: ServerMessage) => {
      console.log("🎮 Tous les joueurs sont prêts !");
      setGameStarted(true);
    });

    // ✅ NOUVEAU : Écouter la réinitialisation de room
    socket.on("room_reset", (data: ServerMessage) => {
      console.log("🔄 Room réinitialisée :", data.msg);
      resetReady();
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("server_message");
      socket.off("player_status_update");
      socket.off("all_players_ready");
      socket.off("room_reset");
    };
  }, [navigate, role, username, room]);

  useEffect(() => {
    if (username && room) {
      // ✅ CORRECTION : Réinitialiser la room quand on rejoint
      socket.emit("reset_room", { room });
    }
  }, [username, room]);
  
  const handleReady = () => {
    if (!username || !role || !room) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    // Rejoindre la room d'abord
    socket.emit("join_room", { username, room });
    
    // Marquer comme prêt
    socket.emit("player_ready", { username, role, room });
    setIsReady(true);
    
    console.log("✅ Joueur prêt :", { username, role, room });
  };

  const resetReady = () => {
    setIsReady(false);
    setReadyPlayers([]);
    setTotalReady(0);
    setGameStarted(false);
  };

  // ✅ CORRECTION : Réinitialiser quand on change de room
  const handleRoomChange = (newRoom: string) => {
    setRoom(newRoom);
    resetReady(); // Réinitialiser le statut ready
  };

  if (gameStarted) {
    const targetRoute = role === "Médecin" ? "/medecin" : "/pharmacien";
    
    setTimeout(() => {
      navigate(targetRoute, {
        state: { username, room, role }
      });
    }, 2000);

    return (
      <div style={{ 
        padding: "2rem", 
        textAlign: "center",
        background: "#4CAF50",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
        <h1>🎮 Partie en cours de lancement...</h1>
        <p>Redirection vers l'interface {role}...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: "600px", 
      margin: "0 auto",
      background: "#f5f5f5",
      minHeight: "100vh"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        🏥 Lobby - PharmaQuest
      </h1>
      
      <div style={{ marginBottom: "1rem" }}>
        <label>👤 Nom d'utilisateur :</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isReady}
          style={{ 
            width: "100%", 
            padding: "0.5rem", 
            marginTop: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>🏠 Salle :</label>
        <input
          type="text"
          value={room}
          onChange={(e) => handleRoomChange(e.target.value)} // ✅ Utiliser la nouvelle fonction
          disabled={isReady}
          style={{ 
            width: "100%", 
            padding: "0.5rem", 
            marginTop: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label>🎭 Rôle :</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={isReady}
          style={{ 
            width: "100%", 
            padding: "0.5rem", 
            marginTop: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        >
          <option value="">-- Choisir un rôle --</option>
          <option value="Médecin">👨‍⚕️ Médecin</option>
          <option value="Pharmacien">💊 Pharmacien</option>
        </select>
      </div>

      {!isReady ? (
        <button
          onClick={handleReady}
          disabled={!username || !role || !room}
          style={{
            width: "100%",
            padding: "1rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.1rem",
            cursor: "pointer"
          }}
        >
          ✅ Je suis prêt !
        </button>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#4CAF50", fontWeight: "bold" }}>
            ✅ Vous êtes prêt ! En attente des autres joueurs...
          </p>
          <button
            onClick={resetReady}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            ❌ Annuler
          </button>
        </div>
      )}

      {/* ✅ AJOUT : Affichage des joueurs prêts avec votre design */}
      {totalReady > 0 && (
        <div style={{ 
          marginTop: "2rem", 
          padding: "1rem", 
          backgroundColor: "#e3f2fd", 
          borderRadius: "8px" 
        }}>
          <h3>👥 Joueurs prêts ({totalReady}/2) :</h3>
          <ul>
            {readyPlayers.map((player, index) => (
              <li key={index}>🎮 {player}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}