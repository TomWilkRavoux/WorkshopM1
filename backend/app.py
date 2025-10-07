from flask import Flask, request
from flask_socketio import SocketIO, join_room, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # autorise le front React

# test route (API HTTP classique)
@app.route("/api/test")
def test():
    return {"message": "Backend Flask est prêt avec Socket.IO !"}

# Quand un client se connecte
@socketio.on("connect")
def on_connect():
    print(" Un client est connecté !")

# Quand un message est reçu
@socketio.on("chat_message")
def handle_message(data):
    print(f" Message reçu du front : {data}")
    emit("chat_response", {"msg": f"Serveur a bien reçu : {data['msg']}"}, broadcast=True)

# Quand un client se déconnecte
@socketio.on("disconnect")
def on_disconnect():
    print(" Un client s'est déconnecté.")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
