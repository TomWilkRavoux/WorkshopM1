import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { io, Socket } from "socket.io-client";

// Ajout de l'import des images
import patient1 from "../assets/toux_ses_grands_morts.png";
import patient2 from "../assets/petite_toux.png";
import patient3 from "../assets/mal_crane.png";
import patient4 from "../assets/mal_gorge.png";


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

// type MaladieKey = keyof typeof maladies;
// Tableau des images des patients
const patientImages = [patient1, patient2, patient3, patient4];


export default function MedecinPage() {
    const location = useLocation();
    const { username, room } = location.state as LocationState;

    // const [selectedMaladie, setSelectedMaladie] = useState<MaladieKey | "">("");
    // const [selectedSymptome, setSelectedSymptome] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [symptoms, setSymptoms] = useState(""); // Nouvel état pour les symptômes
    const [currentPatientImage, setCurrentPatientImage] = useState("");
    const [isImageZoomed, setIsImageZoomed] = useState(false); // Nouvel état pour le zoom
    const [timer, setTimer] = useState<number | null>(null); // Nouveau state pour le timer





    useEffect(() => {
        // Sélection aléatoire d'une image au chargement du composant
        const randomIndex = Math.floor(Math.random() * patientImages.length);
        setCurrentPatientImage(patientImages[randomIndex]);

        // Rejoindre automatiquement la room
        socket.emit("join_room", { username, room });

        //Timer
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

        const handleChatResponse = (data: ChatResponse) => {
        setMessages((prev) => [...prev, `${data.username}: ${data.msg}`]);
        };
        socket.on("server_message", handleServerMessage);
        socket.on("chat_response", handleChatResponse);
        socket.on("timer_update", handleTimerUpdate);
        socket.on("game_started", handleGameStarted);

        return () => {
        socket.off("server_message", handleServerMessage);
        socket.off("chat_response", handleChatResponse);
        socket.off("timer_update", handleTimerUpdate);
        socket.off("game_started", handleGameStarted);
        };
    }, [username, room]);


    const toggleImageZoom = () => {
        setIsImageZoomed(!isImageZoomed);
    };

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit("chat_message", { username, room, msg: message });
        setMessage("");
    };

    // Nouvelle fonction pour envoyer les symptômes
    const sendSymptoms = () => {
        if (!symptoms.trim()) {
            alert("Veuillez décrire les symptômes avant d'envoyer.");
            return;
        }
        
        const symptomMessage = `📋 DIAGNOSTIC: ${symptoms}`;
        socket.emit("chat_message", { username, room, msg: symptomMessage });
        setSymptoms(""); // Vider le champ après envoi
    };
    // // Fonction pour notif diagnostic
    // const handleChatResponse = (data: ChatResponse) => {
    //     // Vérifier si c'est un diagnostic
    //     if (data.msg.startsWith("📋 DIAGNOSTIC:")) {
    //         // Créer une notification au lieu d'ajouter au chat
    //         const newNotification: Notification = {
    //             id: Date.now(),
    //             message: data.msg.replace("📋 DIAGNOSTIC:", "").trim(),
    //             timestamp: new Date()
    //         };
    //         setNotifications(prev => [...prev, newNotification]);
                
    //             // Auto-suppression après 10 secondes
    //         setTimeout(() => {
    //             setNotifications(prev => prev.filter(notif => notif.id !== newNotification.id));
    //         }, 10000);
    //     } else {
    //         // Messages normaux dans le chat
    //         setMessages((prev) => [...prev, `${data.username}: ${data.msg}`]);
    //     }
    // };

    // Fonction pour supprimer une notification manuellement
    // const removeNotification = (id: number) => {
    //     setNotifications(prev => prev.filter(notif => notif.id !== id));
    // };


    // Fonction pour formater le temps en MM:SS
    const formatTime = (seconds: number | null): string => {
        if (seconds === null) return "⏱️ En attente...";
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `⏱️ ${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen bg-blue-50">
            {/* Notifications en haut à droite */}
            {/* <div className="fixed top-4 right-4 z-40 space-y-2">
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
            </div> */}
            <div className="bg-white p-8 rounded-lg mb-8 border-4 border-blue-400">
                <h1 className="text-2xl font-bold">👨‍⚕️ Interface Médecin</h1>
                <p>
                    <strong>Docteur:</strong> {username}
                </p>
                <p>
                    <strong>Room:</strong> {room}
                </p>
                <p className={`text-lg font-bold ${timer !== null && timer < 60 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatTime(timer)}
                </p>
            </div>

            {/* Zone de description */}
            <div className="bg-white p-8 rounded-lg mb-8 border-4 border-blue-400">
                <h2 className="text-xl font-semibold mb-4">🧾 El Malade</h2>
                <div className="flex flex-wrap gap-2.5 justify-center">
                    <img 
                        src={currentPatientImage} 
                        alt="Patient actuel" 
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
                        onClick={toggleImageZoom}
                    />
                </div>
            </div>
            {isImageZoomed && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={toggleImageZoom}
                >
                    <div className="relative max-w-3xl max-h-3xl">
                        <img 
                            src={currentPatientImage} 
                            alt="Patient actuel - Zoom" 
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()} // Empêche la fermeture au clic sur l'image
                        />
                        <button 
                            className="absolute top-4 right-4 text-white text-2xl font-bold bg-red-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700"
                            onClick={toggleImageZoom}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white p-8 rounded-lg mb-8 border-4 border-blue-400">
                <h2 className="text-xl font-semibold mb-4">🧾 Maladies et Symptômes</h2>
                <div className="flex flex-wrap gap-2.5">
                    {Object.entries(maladies).map(([maladie, symptomes]) => (
                        <div
                            key={maladie}
                            className="flex-[0_0_48%] border border-gray-300 rounded-lg p-2.5 bg-blue-50 mb-2.5"
                        >
                            <strong>{maladie}</strong>
                            <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
                                {symptomes.map((symptome, i) => (
                                    <span
                                        key={i}
                                        className="flex-[0_0_48%] py-1.5 px-2 rounded-xl bg-green-100 text-sm text-center"
                                    >
                                        {symptome}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Zone de diagnostic */}
            <div className="bg-white p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold mb-4">📋 Zone de Diagnostic</h2>
                <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Décrivez les symptômes du patient..."
                    className="w-full h-30 p-2.5 rounded border border-gray-300 resize-y"
                />
                <button 
                    onClick={sendSymptoms} 
                    className="mt-2.5 px-5 py-2.5 bg-green-600 text-white border-none rounded cursor-pointer hover:bg-green-700"
                >
                    📤 Envoyer au Pharmacien
                </button>
            </div>

            {/* Chat */}
            <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">💬 Communication avec le Pharmacien</h3>

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