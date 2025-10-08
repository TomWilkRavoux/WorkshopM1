import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface EndGameState {
  result: "victory" | "defeat"; 
  playerName?: string;
  room?: string;
}

export default function EndGamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, playerName, room } = (location.state || {}) as EndGameState;

  const isVictory = result === "victory";
  const title = isVictory ? "🎉 Victoire !" : "💀 Défaite...";
  const message = isVictory
    ? "Félicitations ! Vous avez réussi à sauver la situation dans le temps imparti."
    : "Malheureusement, le temps est écoulé... La mission a échoué.";
  const color = isVictory ? "#4CAF50" : "#E53935";
  const bg = isVictory
    ? "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"
    : "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          maxWidth: "500px",
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
            Retour à l’accueil
          </button>

          <button
            onClick={() => navigate("/lobby")}
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
