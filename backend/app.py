import os
from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room
import time
import threading

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")



# Solutions correctes pour chaque maladie
SOLUTIONS = {
    "Grippe saisonnière": ["Paracétamol", "Oseltamivir"],
    "Angine bactérienne": ["Amoxicilline", "Paracétamol"],
    "Gastro-entérite": ["Régidron", "Racécadotril"],
    "Covid-19 (forme légère)": ["Paracétamol", "Vitamine D"]
}

rooms = {}

@app.route("/api/test")
def test():
    return {"message": "Backend Flask prêt"}

@socketio.on("connect")
def on_connect():
    print("✅ Un client est connecté !")
    emit("server_message", {"msg": "Bienvenue sur Flask-SocketIO !"})

@socketio.on("disconnect")
def on_disconnect():
    print("❌ Un client s'est déconnecté.")

@socketio.on("join_room")
def join_room_event(data):
    username = data.get("username")
    room = data.get("room")

    join_room(room)
    print(f"👤 {username} a rejoint la salle {room}")
    
    # Si la room existe et a des joueurs prêts, les envoyer au nouveau joueur
    if room in rooms and rooms[room]["ready_players"]:
        emit("player_status_update", {
            "ready_players": list(rooms[room]["ready_players"].keys()),
            "total_ready": len(rooms[room]["ready_players"])
        })
        print(f"📊 Envoi du statut actuel à {username}: {list(rooms[room]['ready_players'].keys())}")
    
    emit("server_message", {"msg": f"{username} a rejoint la salle {room}"}, to=room)

# Événement pour réinitialiser une room (seulement quand nécessaire)
@socketio.on("reset_room")
def reset_room(data):
    room = data.get("room")
    if room in rooms:
        # Arrêter le timer s'il existe
        if rooms[room].get("thread"):
            rooms[room]["game_over"] = True
            rooms[room]["thread"] = None
        
        # Réinitialiser complètement la room
        del rooms[room]
        print(f"🔄 Room {room} réinitialisée")
        emit("room_reset", {"msg": "Room réinitialisée"}, room=room)

@socketio.on("player_ready")
def player_ready(data):
    username = data.get("username")
    room = data.get("room")
    role = data.get("role")
    
    print(f"🎮 Player ready reçu: {username} ({role}) dans {room}")
    
    # Créer la room si elle n'existe pas
    if room not in rooms:
        rooms[room] = {
            "users": set(), 
            "timer": 0, 
            "thread": None, 
            "ready_players": {},
            "diagnosis": None,
            "medications": [],
            "game_over": False
        }
        print(f"🏠 Nouvelle room créée: {room}")
    
    #Seulement réinitialiser si le jeu était vraiment terminé ET qu'on essaie de rejouer
    if rooms[room].get("game_over", False):
        print(f"🔄 Game over détecté, réinitialisation de {room}")
        # Arrêter l'ancien thread s'il existe
        if rooms[room].get("thread"):
            rooms[room]["thread"] = None
        
        # Réinitialiser la room
        rooms[room] = {
            "users": set(), 
            "timer": 0, 
            "thread": None, 
            "ready_players": {},
            "diagnosis": None,
            "medications": [],
            "game_over": False
        }
    
    # Ajouter le joueur comme prêt
    rooms[room]["ready_players"][username] = {"role": role, "ready": True}
    print(f"📊 Joueurs prêts dans {room}: {list(rooms[room]['ready_players'].keys())}")
    
    # Messages à toute la room
    emit("server_message", {"msg": f"{username} ({role}) est prêt !"}, room=room)

    # Toujours envoyer le statut à TOUTE la room
    emit("player_status_update", {
        "ready_players": list(rooms[room]["ready_players"].keys()),
        "total_ready": len(rooms[room]["ready_players"])
    }, room=room)
    
    print(f"📡 Status envoyé à la room {room}: {len(rooms[room]['ready_players'])} joueurs")
    
    # Vérifier si on peut démarrer (2 joueurs avec rôles différents)
    if len(rooms[room]["ready_players"]) >= 2:
        roles = [player["role"] for player in rooms[room]["ready_players"].values()]
        has_medecin = "Médecin" in roles
        has_pharmacien = "Pharmacien" in roles
        
        print(f"🎭 Rôles présents: {roles}")
        
        if has_medecin and has_pharmacien:
            emit("all_players_ready", {"msg": "Tous les joueurs sont prêts ! Lancement du jeu..."}, room=room)
            
            # Démarrer le timer seulement si aucun n'est en cours
            if not rooms[room]["thread"]:
                t = threading.Thread(target=start_timer, args=(room, 600))
                rooms[room]["thread"] = t
                t.start()
                emit("game_started", {"msg": "🎮 Partie démarrée ! Vous avez 10 minutes.", "duration": 600}, room=room)
            
            print(f"[GAME START] Room {room} - 2 joueurs prêts (Médecin + Pharmacien), timer lancé")
        else:
            emit("server_message", {"msg": "⚠️ Il faut un Médecin ET un Pharmacien pour commencer !"}, room=room)
            print(f"⚠️ Rôles incomplets dans {room}: {roles}")

# Fonctions existantes...
def cleanup_room(room):
    if room in rooms:
        if rooms[room].get("thread"):
            rooms[room]["game_over"] = True
            rooms[room]["thread"] = None
        print(f"🧹 Nettoyage de la room {room}")

@socketio.on("submit_diagnosis")
def submit_diagnosis(data):
    username = data.get("username")
    room = data.get("room")
    diagnosis = data.get("diagnosis")
    
    if room not in rooms or rooms[room].get("game_over", False):
        return
    
    rooms[room]["diagnosis"] = diagnosis
    print(f"[DIAGNOSIS] {room} - {username}: {diagnosis}")
    
    emit("diagnosis_submitted", {
        "username": username,
        "diagnosis": diagnosis
    }, room=room)

@socketio.on("submit_medication")
def submit_medication(data):
    username = data.get("username")
    room = data.get("room")
    medication = data.get("medication")
    
    if room not in rooms or rooms[room].get("game_over", False):
        return
    
    if medication not in rooms[room]["medications"]:
        rooms[room]["medications"].append(medication)
    
    print(f"[MEDICATION] {room} - {username}: {medication}")
    
    emit("medication_submitted", {
        "username": username,
        "medication": medication,
        "current_medications": rooms[room]["medications"]
    }, room=room)



@socketio.on("remove_medication")
def remove_medication(data):
    username = data.get("username")
    room = data.get("room")
    medication = data.get("medication")
    
    if room not in rooms or rooms[room].get("game_over", False):
        return
    
    if medication in rooms[room]["medications"]:
        rooms[room]["medications"].remove(medication)
    
    print(f"[MEDICATION REMOVED] {room} - {username}: {medication}")
    
    emit("medication_removed", {
        "username": username,
        "medication": medication,
        "current_medications": rooms[room]["medications"]
    }, room=room)


@socketio.on("validate_solution")
def validate_solution(data):
    room = data.get("room")
    
    if room not in rooms or rooms[room].get("game_over", False):
        return
    
    diagnosis = rooms[room]["diagnosis"]
    medications = rooms[room]["medications"]
    
    print(f"[VALIDATION] Room {room} - Diagnostic: {diagnosis}, Médicaments: {medications}")
    
    # Vérifier si la solution est correcte
    if diagnosis in SOLUTIONS:
        correct_medications = SOLUTIONS[diagnosis]
        is_correct = set(medications) == set(correct_medications)
        
        if is_correct:
            # Victoire !
            rooms[room]["game_over"] = True
            rooms[room]["timer"] = 0
            print(f"[VICTOIRE] Room {room}")
            emit("game_result", {
                "result": "victory",
                "diagnosis": diagnosis,
                "medications": medications
            }, room=room)
        else:
            # Défaite - mauvais médicaments
            rooms[room]["game_over"] = True
            rooms[room]["timer"] = 0
            print(f"[DÉFAITE] Room {room} - Mauvais médicaments")
            emit("game_result", {
                "result": "defeat",
                "reason": "wrong_medications",
                "diagnosis": diagnosis,
                "medications": medications,
                "correct_medications": correct_medications
            }, room=room)
    else:
        # Défaite - mauvais diagnostic
        rooms[room]["game_over"] = True
        rooms[room]["timer"] = 0
        print(f"[DÉFAITE] Room {room} - Mauvais diagnostic")
        emit("game_result", {
            "result": "defeat",
            "reason": "wrong_diagnosis",
            "diagnosis": diagnosis,
            "medications": medications
        }, room=room)

@socketio.on("chat_message")
def chat(data):
    room = data.get("room")
    username = data.get("username")
    msg = data.get("msg")
    print(f"[CHAT] {room} | {username}: {msg}")
    emit("chat_response", {"username": username, "msg": msg}, room=room)

def start_timer(room, duration):
    print(f"[TIMER] Lancement du timer {duration}s pour {room}")
    if room in rooms:
        rooms[room]["timer"] = duration
        while rooms[room]["timer"] > 0 and not rooms[room].get("game_over", False):
            time.sleep(1)
            rooms[room]["timer"] -= 1
            socketio.emit("timer_update", {"time": rooms[room]["timer"]}, room=room)
        
        if not rooms[room].get("game_over", False):
            # Temps écoulé = défaite
            rooms[room]["game_over"] = True
            print(f"[TIMEOUT] Room {room}")
            socketio.emit("game_result", {
                "result": "defeat",
                "reason": "timeout"
            }, room=room)
        
        rooms[room]["thread"] = None

@socketio.on("start_game")
def start_game(data):
    room = data.get("room")
    duration = data.get("duration", 60)
    if room not in rooms:
        rooms[room] = {"users": set(), "timer": duration, "thread": None}

    if not rooms[room].get("thread"):
        t = threading.Thread(target=start_timer, args=(room, duration))
        rooms[room]["thread"] = t
        t.start()
        emit("server_message", {"msg": f"⏳ Partie lancée ({duration}s)!"}, room=room)
    else:
        emit("server_message", {"msg": "⚠️ Une partie est déjà en cours."}, room=room)

# if __name__ == "__main__":
#     socketio.run(app, host="0.0.0.0", port=5000)
#     print("🚀 Serveur Flask démarré sur http://localhost:5000")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)
    print(f"🚀 Serveur Flask démarré sur le port {port}")