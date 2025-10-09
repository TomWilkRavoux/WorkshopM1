import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");
  

interface EndGameState {
  result: "victory" | "defeat"; 
  playerName?: string;
  room?: string;
  diagnosis?: string;
  medications?: string[];
  reason?: "timeout" | "wrong_diagnosis" | "wrong_medications";
}

export default function EndGamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, playerName, room, diagnosis, medications, reason } = (location.state || {}) as EndGameState;

  const isVictory = result === "victory";
  const title = isVictory ? "🎉 Victoire !" : "💀 Défaite...";
  
  let message = "";
  if (isVictory) {
    message = "Félicitations ! Vous avez réussi à sauver le patient avec le bon diagnostic et le bon traitement !";
  } else {
    switch (reason) {
      case "timeout":
        message = "Le temps est écoulé ! Le patient n'a pas pu être soigné à temps...";
        break;
      case "wrong_diagnosis":
        message = "Le diagnostic était incorrect. Le patient n'a pas reçu le bon traitement...";
        break;
      case "wrong_medications":
        message = "Le diagnostic était correct mais les médicaments prescrits étaient inadaptés...";
        break;
      default:
        message = "Malheureusement, la mission a échoué...";
    }
  }

  const color = isVictory ? "#4CAF50" : "#E53935";
  const bg = isVictory
    ? "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"
    : "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)";

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Nettoyer la room quand on arrive sur EndGame
    if (room) {
      socket.emit("reset_room", { room });
    }
  }, [room]);


  const handleReplay = () => {
    if (room) {
      socket.emit("reset_room", { room });
    }
    navigate("/lobby");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        color: "#333",
        textAlign: "center",
        padding: "2rem",
        transition: "all 0.5s ease",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "3rem",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          maxWidth: "600px",
          width: "90%",
          border: `4px solid ${color}`,
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color }}>
          {title}
        </h1>

        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          {message}
        </p>

        {playerName && (
          <p>
            👤 Joueur : <strong>{playerName}</strong>
          </p>
        )}
        {room && (
          <p>
            🏠 Salle : <strong>{room}</strong>
          </p>
        )}

        {/* Détails de la partie */}
        {diagnosis && (
          <div style={{ 
            marginTop: "1.5rem", 
            padding: "1rem", 
            backgroundColor: "#f5f5f5", 
            borderRadius: "10px",
            textAlign: "left"
          }}>
            <h3 style={{ marginBottom: "0.5rem" }}>📋 Résumé de la partie :</h3>
            <p><strong>Diagnostic :</strong> {diagnosis}</p>
            {medications && medications.length > 0 && (
              <div>
                <strong>Médicaments prescrits :</strong>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                  {medications.map((med, index) => (
                    <li key={index}>{med}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "0.8rem 1.5rem",
              border: "none",
              borderRadius: "8px",
              backgroundColor: color,
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Retour à l'accueil
          </button>

          <button
            onClick={handleReplay} 
            style={{
              padding: "0.8rem 1.5rem",
              border: "2px solid #555",
              borderRadius: "8px",
              backgroundColor: "white",
              color: "#333",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            Rejouer 🔄
          </button>
        </div>
      </div>
    </div>
  );
}