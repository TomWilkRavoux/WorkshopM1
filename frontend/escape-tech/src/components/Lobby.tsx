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
      
      // Redirection après 2 secondes selon le rôle
      setTimeout(() => {
        if (role === "medecin") {
          navigate("/medecin", { 
            state: { username, room, role } 
          });
        } else if (role === "pharmacien") {
          navigate("/pharmacien", { 
            state: { username, room, role } 
          });
        }
      }, 2000);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("server_message");
      socket.off("player_status_update");
      socket.off("all_players_ready");
    };
  }, [navigate, role, username, room]);

  useEffect(() => {
    if (username && room) {
      socket.emit("join_room", { username, room });
      console.log(`🚪 Rejoindre la room ${room} avec ${username}`);
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
  };

  if (gameStarted) {
    return (
      <div style={{ 
        padding: "2rem", 
        textAlign: "center",
        background: "linear-gradient(135deg, #4A90E2, #50E3C2)",
        color: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
        <h1>🎮 Lancement du jeu...</h1>
        <p>Redirection vers votre interface {role}...</p>
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
        🏥 Lobby PharmaQuest
      </h1>
      
      <div style={{ 
        background: "white", 
        padding: "2rem", 
        borderRadius: "10px",
        marginBottom: "2rem"
      }}>
        <h2>Configuration du joueur</h2>
        
        <input
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isReady}
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
        
        <input
          placeholder="Code de la Room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          disabled={isReady}
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
        
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
          disabled={isReady}
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        >
          <option value="">Choisis ton rôle</option>
          <option value="medecin">👨‍⚕️ Médecin</option>
          <option value="pharmacien">💊 Pharmacien</option>
        </select>
        
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button 
            onClick={handleReady}
            disabled={isReady || !username || !role || !room}
            style={{
              flex: 1,
              padding: "15px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: isReady ? "#28a745" : "#007bff",
              color: "white",
              cursor: isReady ? "default" : "pointer",
              opacity: (!username || !role || !room) ? 0.5 : 1
            }}
          >
            {isReady ? "✅ Prêt" : "🚀 Je suis prêt"}
          </button>
          
          {isReady && (
            <button 
              onClick={resetReady}
              style={{
                padding: "15px 20px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#dc3545",
                color: "white",
                cursor: "pointer"
              }}
            >
              ❌ Annuler
            </button>
          )}
        </div>
      </div>

      {/* Status des joueurs */}
      <div style={{
        background: "white",
        padding: "1.5rem",
        borderRadius: "10px"
      }}>
        <h3>📊 Status de la partie</h3>
        <p>Room: <strong>{room || "Non définie"}</strong></p>
        <p>Joueurs prêts: <strong>{totalReady}/2</strong></p>
        
        {readyPlayers.length > 0 && (
          <div>
            <h4>Joueurs connectés:</h4>
            <ul>
              {readyPlayers.map((player, index) => (
                <li key={index} style={{ margin: "5px 0" }}>
                  ✅ {player}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {totalReady < 2 && (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            En attente de {2 - totalReady} joueur(s) supplémentaire(s)...
          </p>
        )}
      </div>
    </div>
  );
}