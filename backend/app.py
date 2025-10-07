from flask import Flask, request
from flask_socketio import SocketIO, join_room, emit
import time
import threading

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # on force le serveur Flask-SocketIO sur le front React (à modifier)

rooms = {}

@app.route("/api/test")
def test():
    return {"message": "Backend Flask est prêt avec Socket.IO !"}

@app.route("/lobby")
@socketio.on("connect")
def on_connect():
    print("✅ Un client est connecté !")
    emit("server_message", {"msg": "Bienvenue sur Flask-SocketIO !"})

@socketio.on("disconnect")
def on_disconnect():
    print("❌ Un client s'est déconnecté.")

# Test accès aux rooms

@socketio.on("join_room")
def join_room_event(data):
    username = data.get("username")
    room = data.get("room")

    join_room(room)
    print(f"👤 {username} a rejoint la salle {room}")

    emit("server_message", {"msg": f"{username} a rejoint la salle {room}"}, to=room)
@socketio.on("join_room")
def join(data):
    username = data.get("username")
    room = data.get("room")
    join_room(room)
    rooms.setdefault(room, {"users": set(), "timer": 0, "thread": None})
    rooms[room]["users"].add(username)
    emit("server_message", {"msg": f"{username} a rejoint {room}."}, room=room)
    print(f"[JOIN] {username} → {room}")

@socketio.on("chat_message")
def chat(data):
    room = data.get("room")
    username = data.get("username")
    msg = data.get("msg")
    print(f"[CHAT] {room} | {username}: {msg}")
    emit("chat_response", {"username": username, "msg": msg}, room=room)

def start_timer(room, duration):
    print(f"[TIMER] Lancement du timer {duration}s pour {room}")
    rooms[room]["timer"] = duration
    while rooms[room]["timer"] > 0:
        time.sleep(1)
        rooms[room]["timer"] -= 1
        socketio.emit("timer_update", {"time": rooms[room]["timer"]}, room=room)
    socketio.emit("server_message", {"msg": "Temps écoulé !"}, room=room)
    rooms[room]["thread"] = None

@socketio.on("start_game")
def start_game(data):
    room = data.get("room")
    duration = data.get("duration", 60)
    if room not in rooms:
        rooms[room] = {"users": set(), "timer": duration, "thread": None}

    if not rooms[room]["thread"]:
        t = threading.Thread(target=start_timer, args=(room, duration))
        rooms[room]["thread"] = t
        t.start()
        emit("server_message", {"msg": f"⏳ Partie lancée ({duration}s)!"}, room=room)
    else:
        emit("server_message", {"msg": "⚠️ Une partie est déjà en cours."}, room=room)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
    print("🚀 Serveur Flask démarré sur http://localhost:5000")