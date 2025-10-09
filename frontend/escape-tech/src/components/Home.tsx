import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowStory(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #4A90E2, #50E3C2)",
        color: "white",
        textAlign: "center",
        padding: "2rem",
        transition: "opacity 1s ease",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>💊 PharmaQuest</h1>
      <h2 style={{ fontWeight: "300", marginBottom: "2rem" }}>
        Collaboration médicale sous tension
      </h2>

      {showStory && (
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "1.5rem",
            maxWidth: "600px",
            marginBottom: "2rem",
            fontSize: "1.1rem",
            lineHeight: "1.5",
            animation: "fadeIn 1s ease",
          }}
        >
          <p>
            🚨 <strong>Alerte Urgences</strong> : plusieurs patients viennent d’être
            admis avec des symptômes graves et variés.
          </p>
          <p>
            L’origine est incertaine infection, intoxication, virus ?  
            Les premiers diagnostics sont contradictoires, et chaque minute compte.
          </p>
          <p>
            Vous formez une équipe <strong>Médecin et Pharmacien</strong>.  
            Collaborez, échangez les bonnes informations et prescrivez les bons traitements
            pour stabiliser les patients avant que la situation ne devienne critique.
          </p>
        </div>
      )}

      <button
        onClick={() => navigate("/lobby")}
        style={{
          padding: "1rem 2rem",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#fff",
          color: "#4A90E2",
          fontSize: "1.2rem",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        🚀 Commencer la mission
      </button>
    </div>
  );
}

export default Home;
