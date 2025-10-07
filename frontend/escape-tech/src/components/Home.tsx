import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #4A90E2, #50E3C2)",
      color: "white",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>💊 PharmaQuest</h1>
      <h2 style={{ fontWeight: "300", marginBottom: "2rem" }}>
        Communication Vitale entre Médecin et Pharmacien
      </h2>
      <p style={{ maxWidth: "500px", marginBottom: "3rem" }}>
        Collaborez avec votre partenaire pour diagnostiquer, communiquer et
        sauver vos patients dans un environnement médical sous tension.
      </p>
      <button
        onClick={() => navigate("/lobby")}
        style={{
          padding: "1rem 2rem",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#fff",
          color: "#4A90E2",
          fontSize: "1.2rem",
          cursor: "pointer"
        }}
      >
        🚀 Entrer dans le jeu
      </button>
    </div>
  );
}

export default Home;
