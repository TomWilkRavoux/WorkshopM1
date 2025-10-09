import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

interface Notification {
    id: number;
    message: string;
    timestamp: Date;
}

interface TimerUpdate {
    time: number;
}

interface GameStarted {
    msg: string;
    duration: number;
}
// Liste complète des médicaments
const medicamentsBase: Medicament[] = [
    { nom: "Paracétamol", description: "Soulage la douleur et la fièvre. À utiliser avec modération." },
    { nom: "Ibuprofène", description: "Anti-inflammatoire efficace. À éviter en cas de problèmes gastriques." },
    { nom: "Aspirine", description: "Fluidifie le sang et calme la douleur. Contre-indiqué chez l'enfant." },
    { nom: "Antibiotique", description: "Traite les infections bactériennes. À ne pas utiliser sans prescription." },
    { nom: "Sirop", description: "Apaise la toux et adoucit la gorge. Contient souvent du sucre." },
    { nom: "Pommade", description: "Soulage les irritations ou douleurs locales sur la peau." },
    
    // Médicaments spécifiques pour les solutions
    { nom: "Oseltamivir", description: "Antiviral pour traiter la grippe saisonnière." },
    { nom: "Amoxicilline", description: "Antibiotique de première intention pour les infections bactériennes." },
    { nom: "Régidron", description: "Solution de réhydratation orale pour les gastro-entérites." },
    { nom: "Racécadotril", description: "Diminue la diarrhée en cas de gastro-entérite." },
    { nom: "Vitamine D", description: "Renforce le système immunitaire, utile en cas de Covid-19." },
    
    // Médicaments distracteurs
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
    { nom: "Acide salicylique", description: "Traitement des verrues plantaires" },
    { nom: "Terbinafine", description: "Antifongique oral" },
    { nom: "Alendronate", description: "Traite l'ostéoporose" },
];

interface Notification {
    id: number;
    message: string;
    timestamp: Date;
}

export default function PharmacienPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { username, room, role } = location.state as LocationState;

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [selectedMed, setSelectedMed] = useState<Medicament | null>(null);
    const [medicaments, setMedicaments] = useState<Medicament[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [timer, setTimer] = useState<number | null>(null); // Nouveau state pour le timer
    const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
    const [diagnosisReceived, setDiagnosisReceived] = useState<string | null>(null);


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
        // const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        socket.emit("join_room", { username, room });

        const handleTimerUpdate = (data: TimerUpdate) => {
            setTimer(data.time);
        };

        const handleGameStarted = (data: GameStarted) => {
            setMessages((prev) => [...prev, `[SYSTEM] ${data.msg}`]);
            setTimer(data.duration);
        };

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
        const handleDiagnosisSubmitted = (data: any) => {
            setDiagnosisReceived(data.diagnosis);
            setMessages(prev => [...prev, `[DIAGNOSTIC REÇU] ${data.username}: ${data.diagnosis}`]);
        };

        const handleMedicationSubmitted = (data: any) => {
            setMessages(prev => [...prev, `[MÉDICAMENT] ${data.username}: ${data.medication}`]);
        };

        const handleGameResult = (data: any) => {
            navigate("/endgame", {
                state: {
                    result: data.result,
                    playerName: username,
                    room: room,
                    diagnosis: data.diagnosis,
                    medications: data.medications,
                    reason: data.reason
                }
            });
        };

        socket.on("server_message", handleServerMessage);
        socket.on("chat_response", handleChatResponse);
        socket.on("timer_update", handleTimerUpdate);
        socket.on("game_started", handleGameStarted);
        socket.on("diagnosis_submitted", handleDiagnosisSubmitted);
        socket.on("medication_submitted", handleMedicationSubmitted);
        socket.on("game_result", handleGameResult);

        return () => {
        socket.off("server_message", handleServerMessage);
        socket.off("chat_response", handleChatResponse);
        socket.off("timer_update", handleTimerUpdate);
        socket.off("game_started", handleGameStarted);
        socket.off("diagnosis_submitted", handleDiagnosisSubmitted);
        socket.off("medication_submitted", handleMedicationSubmitted);
        socket.off("game_result", handleGameResult);
        };
    }, [username, room, navigate]);

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit("chat_message", { username, room, msg: message });
        setMessage("");
    };

    const handleMedClick = (med: Medicament) => {
        if (selectedMed?.nom === med.nom) setSelectedMed(null);
        else setSelectedMed(med);
    };
    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // Fonction pour formater le temps
    const formatTime = (seconds: number | null): string => {
        if (seconds === null) return "⏱️ En attente...";
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `⏱️ ${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const selectMedication = (med: Medicament) => {
        if (!selectedMedications.includes(med.nom)) {
            const newMedications = [...selectedMedications, med.nom];
            setSelectedMedications(newMedications);
            
            socket.emit("submit_medication", {
                username,
                room,
                medication: med.nom
            });
        }
    };

    const validateTreatment = () => {
        if (selectedMedications.length === 0) {
            alert("Veuillez sélectionner au moins un médicament.");
            return;
        }
        
        socket.emit("validate_solution", { room });

        setSelectedMedications([]);
        setSelectedMed(null);
    };

    const removeMedication = (medName: string) => {
        setSelectedMedications(prev => prev.filter(name => name !== medName));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen bg-green-50">
            <div className="fixed top-4 right-4 z-40 space-y-2">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm animate-slide-in"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-sm">📋 Nouveau Diagnostic</h4>
                                <p className="text-sm mt-1">{notification.message}</p>
                                <p className="text-xs opacity-75 mt-1">
                                    {notification.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-white hover:text-gray-200 text-lg font-bold ml-2"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>        

            {/* En-tête */}
            <div className="bg-white p-8 rounded-lg mb-8 border-4 border-teal-400">
                <h1 className="text-2xl font-bold">💊 Interface Pharmacien</h1>
                <p><strong>Pharmacien :</strong> {username}</p>
                <p><strong>Room :</strong> {room}</p>
                <p className={`text-lg font-bold ${timer !== null && timer < 60 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatTime(timer)}
                </p>
            </div>

            {/* Diagnostic reçu */}
            {diagnosisReceived && (
                <div className="bg-blue-100 p-4 rounded-lg mb-6 border-2 border-blue-400">
                    <h3 className="text-lg font-semibold mb-2">📋 Diagnostic reçu du médecin :</h3>
                    <p className="text-xl font-bold text-blue-800">{diagnosisReceived}</p>
                </div>
            )}

            {/* Médicaments sélectionnés */}
            {selectedMedications.length > 0 && (
                <div className="bg-yellow-100 p-4 rounded-lg mb-6 border-2 border-yellow-400">
                    <h3 className="text-lg font-semibold mb-2">💊 Traitement sélectionné :</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedMedications.map((medName, index) => (
                            <span
                                key={index}
                                className="bg-green-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                            >
                                {medName}
                                <button
                                    onClick={() => removeMedication(medName)}
                                    className="text-red-600 hover:text-red-800 font-bold"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={validateTreatment}
                        className="mt-3 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                    >
                        ✅ Valider le traitement
                    </button>
                </div>
            )}
            {/* Inventaire */}
            <div className="bg-white p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold mb-4">💊 Inventaire des Médicaments</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                    {medicaments.map((med) => {
                        const isSelected = selectedMedications.includes(med.nom);
                        return (
                            <div
                                key={med.nom}
                                onClick={() => selectMedication(med)}
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${
                                    isSelected
                                        ? "bg-green-200 border-2 border-green-600 scale-105"
                                        : selectedMed?.nom === med.nom
                                        ? "bg-blue-100 border-2 border-blue-600 scale-110 shadow-lg"
                                        : "bg-blue-50 border border-blue-400 scale-100"
                                } ${isSelected ? 'opacity-75' : ''}`}
                            >
                                <h3 className="m-0 text-center font-medium">
                                    {isSelected && "✅ "}{med.nom}
                                </h3>
                                {(selectedMed?.nom === med.nom || isSelected) && (
                                    <p className="mt-2.5 text-sm text-center text-gray-700">
                                        {med.description}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat */}
            <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">💬 Communication avec le Médecin</h3>

                <div className="border border-gray-300 h-50 overflow-y-auto p-2.5 mb-2.5 bg-gray-50">
                    {messages.map((msg, index) => (
                        <div key={index} className="mb-1.5">
                            {msg}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2.5">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Écrivez votre message..."
                        className="flex-1 p-2.5 rounded border border-gray-300"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-5 py-2.5 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
                    >
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    );
}
