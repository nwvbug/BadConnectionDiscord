import json
from MyClient import MyClient
from flask import Flask, render_template, request
from flask_socketio import SocketIO
from flask_cors import CORS
import threading
import queue
import asyncio
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

clients = { #username:clientObj

}

@app.route("/")
def index():
    return render_template("index.html") 

@socketio.on("json")
def recieve(data): #incoming messages need NAME and INTENTS: name to send to correct user and intents to decide what to do w message
    print("\n\n-------NEW MESSAGE BREAK: SOCKETIO CLIENT MESSAGE ------ \n\n")
    parsed = json.loads(data)
    intents = parsed["intents"]
    print("INTENTS: "+intents)

    if(intents == "startup"):
        #print("Data recieved: "+data);
        print("New user connected, adding to dicts. Name: "+parsed["username"])
        print("User's ID is "+request.sid)
        parsed["sid"] = request.sid
        thread = threading.Thread(target=startDiscordClient, args=(parsed,))
        thread.start()
        onstart = {
            "intents":"startup",
            "message":"User setup complete. NWVBUG Session Active."
        }
        socketio.send(onstart, json=True)


    if (intents == "message"):
        print("user "+parsed["username"]+" is trying to send a message")
        client = clients[parsed["username"]]
        client.sendToDiscord(parsed["message"], parsed["to"])


    if (intents == "openDM"):
        recents = clients[parsed["username"]].getRecents(parsed["to"])
        returned = list()
        loaded = json.loads(recents)
        
        for message in loaded:
            newMsg = {
                "author":message["author"]["username"],
                "content":message["content"],
                "id":message["id"],
                "timestamp":message["timestamp"]
            }
            returned.append(newMsg)
        socketio.emit("openDM", returned)

@socketio.on("starting_up")
def completeHandshake(data):
    print("Handshake request made.")
    socketio.emit("starting_up", "read_successfully")

def startDiscordClient(parsed):
    new_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(new_loop)
    print("Starting discord client for user "+parsed["username"])
    if parsed["username"] in clients:
        client = clients[parsed["username"]]
        client.setVars(parsed["sid"], parsed["discordtoken"], parsed["username"], socketio)
        client.updateClient()
    else:
        client = MyClient()
        client.setVars(parsed["sid"], parsed["discordtoken"], parsed["username"], socketio)
        
        clients[parsed["username"]] = client
        client.run(parsed["discordtoken"])

@socketio.on("logging_off")
def removeClient(data):
    print("User "+data["username"]+" has logged off. Removing from list of active clients...")
    del clients[data["username"]]




if (__name__ == '__main__'):
    socketio.run(app, host='0.0.0.0', debug=True)
    
    
socketio.emit("Starting", {'data':'test'})





