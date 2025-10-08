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

interface Medicament {
  nom: string;
  description: string;
}

// Liste complète des médicaments
const medicamentsBase: Medicament[] = [
  { nom: "Paracétamol", description: "Soulage la douleur et la fièvre. À utiliser avec modération." },
  { nom: "Ibuprofène", description: "Anti-inflammatoire efficace. À éviter en cas de problèmes gastriques." },
  { nom: "Aspirine", description: "Fluidifie le sang et calme la douleur. Contre-indiqué chez l’enfant." },
  { nom: "Antibiotique", description: "Traite les infections bactériennes. À ne pas utiliser sans prescription." },
  { nom: "Sirop", description: "Apaise la toux et adoucit la gorge. Contient souvent du sucre." },
  { nom: "Pommade", description: "Soulage les irritations ou douleurs locales sur la peau." },
  { nom: "Virocillin", description: "Parfum énergisant aux notes boisées." },
  { nom: "Ambramycin", description: "Crème hydratante pour peau citadine." },
  { nom: "Nexacill", description: "Boisson tonique aux extraits botaniques." },
  { nom: "Solvamyx", description: "Sérum éclat pour teint lumineux." },
  { nom: "Treadocill", description: "Baume chauffant pour muscles de sportifs." },
  { nom: "Clarivex", description: "Brume rafraîchissante visage et cheveux." },
  { nom: "Pulsamycin", description: "Gel coiffant à effet longue tenue." },
  { nom: "Bactorex", description: "Savon exfoliant à microbilles naturelles." },
  { nom: "Fimocill", description: "Lotion nourrissante pour mains sèches." },
  { nom: "Luminavir", description: "Masque de nuit illuminateur visage." },
  { nom: "Serovex", description: "Huile apaisante pour massage relaxant." },
  { nom: "Faviroz", description: "Complément aromatique pour boissons fruitées." },
  { nom: "Heptavir", description: "Spray hydratant pour peau sensible." },
  { nom: "Ribonazole", description: "Poudre énergisante goût tropical." },
  { nom: "Cryptofangin", description: "Parfum mystérieux aux notes ambrées." },
  { nom: "Neutravir", description: "Déodorant minéral sans aluminium." },
  { nom: "Polymazol", description: "Crème réparatrice pour peaux fatiguées." },
  {nom:"Acide salicylique", description:"traitement des verrues plantaires"},
  {nom:"Terbinafine ", description:"antifongique oral"},
  {nom:"Alendronate ", description:"traite l’ostéoporose"},
];

interface Notification {
    id: number;
    message: string;
    timestamp: Date;
}

export default function PharmacienPage() {
  const location = useLocation();
  const { username, room, role } = location.state as LocationState;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medicament | null>(null);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);

  const shuffleArray = (array: Medicament[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  useEffect(() => {
    setMedicaments(shuffleArray(medicamentsBase));
  }, []);
    const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    socket.emit("join_room", { username, room });

    const handleServerMessage = (data: ServerMessage) => {
      setMessages((prev) => [...prev, `[SYSTEM] ${data.msg}`]);
    };

        // const handleChatResponse = (data: ChatResponse) => {
        // setMessages((prev) => [...prev, `${data.username}: ${data.msg}`]);
        // };

    const handleChatResponse = (data: ChatResponse) => {
            // Vérifier si c'est un diagnostic
            if (data.msg.startsWith("📋 DIAGNOSTIC:")) {
                // Créer une notification au lieu d'ajouter au chat
                const newNotification: Notification = {
                    id: Date.now(),
                    message: data.msg.replace("📋 DIAGNOSTIC:", "").trim(),
                    timestamp: new Date()
                };
                setNotifications(prev => [...prev, newNotification]);
                
                // Auto-suppression après 10 secondes
                setTimeout(() => {
                    setNotifications(prev => prev.filter(notif => notif.id !== newNotification.id));
                }, 10000);
            } else {
                // Messages normaux dans le chat
              setMessages((prev) => [...prev, `${data.username}: ${data.msg}`]);
            }
    };

    socket.on("server_message", handleServerMessage);
    socket.on("chat_response", handleChatResponse);

    return () => {
      socket.off("server_message", handleServerMessage);
      socket.off("chat_response", handleChatResponse);
    };
  }, [username, room]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chat_message", { username, room, msg: message });
    setMessage("");
  };

  const handleMedClick = (med: Medicament) => {
    if (selectedMed?.nom === med.nom) setSelectedMed(null);
    else setSelectedMed(med);
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
        minHeight: "100vh",
        background: "#f0fff0",
      }}
    >
      {/* En-tête */}
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "10px",
          marginBottom: "2rem",
          border: "3px solid #50E3C2",
        }}
      >
        <h1>💊 Interface Pharmacien</h1>
        <p><strong>Pharmacien :</strong> {username}</p>
        <p><strong>Room :</strong> {room}</p>
        <p><strong>Statut :</strong> En ligne</p>
      </div>

      {/* Inventaire */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "10px",
          marginBottom: "2rem",
        }}
      >
        <h2>💊 Inventaire des Médicaments</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
          }}
        >
          {medicaments.map((med) => (
            <div
              key={med.nom}
              onClick={() => handleMedClick(med)}
              style={{
                padding: "15px",
                backgroundColor:
                  selectedMed?.nom === med.nom ? "#d1f7c4" : "#e3f2fd",
                border:
                  selectedMed?.nom === med.nom
                    ? "2px solid #388e3c"
                    : "1px solid #2196f3",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform:
                  selectedMed?.nom === med.nom ? "scale(1.1)" : "scale(1)",
                boxShadow:
                  selectedMed?.nom === med.nom
                    ? "0 4px 10px rgba(0, 0, 0, 0.2)"
                    : "none",
              }}
            >
              <h3 style={{ margin: 0, textAlign: "center" }}>{med.nom}</h3>
              {selectedMed?.nom === med.nom && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "0.9rem",
                    textAlign: "center",
                    color: "#333",
                  }}
                >
                  {med.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "10px",
        }}
      >
        <h3>💬 Communication avec le Médecin</h3>

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
