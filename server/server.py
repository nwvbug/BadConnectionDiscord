import json
from MyClient import MyClient
from flask import Flask, render_template, request
from flask_socketio import SocketIO
from flask_cors import CORS
import threading
import uuid
import asyncio
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

clients = { #uuid:client obj

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
    onstart = {}
    if(intents == "startup"):
        #print("Data recieved: "+data);
        print("New user connected, adding to dicts.")
        print("User's socket ID is "+request.sid)
        if ("user_id" in parsed):
            client = None
            print("User reconnecting, user_id already exists")
            try:
                client = clients[parsed["user_id"]]
            except:
                print("User sent outdated token, forcing reset")
                socketio.emit("reset_id", room=request.sid, )
                assignID(parsed, request.sid)
                return
            if (client != None):
                parsed["sid"] = request.sid
                client.setVars(socketID=parsed["sid"], socketio=socketio)
                client.updateClient()
        else:
            assignID(parsed, request.sid)
        onstart["intents"] = "startup"
        onstart["message"]="User setup complete. NWVBUG Session Active.",
        onstart["user_id"] = parsed["user_id"]
        socketio.send(onstart, json=True, room=request.sid)


    if (intents == "message"):
        print("user "+parsed["user_id"]+" is trying to send a message")
        client = clients[parsed["user_id"]]
        client.sendToDiscord(parsed["message"], parsed["to"])


    if (intents == "openDM"):
        recents = clients[parsed["user_id"]].getRecents(parsed["to"])
        returned = list()
        loaded = json.loads(recents)
        
        for message in loaded:
            newMsg = {
                "author":message["author"]["username"],
                "content":message["content"],
                "id":message["id"],
                "timestamp":message["timestamp"]
            }
            if message["content"] == "":   
                newMsg["images"] = message["attachments"]
            returned.append(newMsg)
        socketio.emit("openDM", returned, room=request.sid)

def assignID(parsed, req):
    user_id = uuid.uuid3(uuid. NAMESPACE_DNS, parsed["discordtoken"]); #yippee personal identification ( key to the dict)
    print("user's nwvbug id is ", user_id)
    parsed["user_id"] = str(user_id)
    parsed["sid"] = req
    if parsed["discordtoken"] == "NWVBUG OVERRIDE VIA USER_ID":
        return
    thread = threading.Thread(target=startDiscordClient, args=(parsed,))
    thread.start()  

@socketio.on("starting_up")
def completeHandshake(data):
    print("Handshake request made.")
    socketio.emit("starting_up", "read_successfully", room=request.sid)

def startDiscordClient(parsed):
    new_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(new_loop)
    print("Starting discord client for user ", parsed["user_id"])
    client = MyClient()
    client.setVars(parsed["sid"], socketio, parsed["discordtoken"])
    
    clients[parsed["user_id"]] = client
    try:
        client.run(parsed["discordtoken"])
    except:
        print("Improper token.")

@socketio.on("logging_off")
def removeClient(data):
    print("User "+data["user_id"]+" has logged off. Removing from list of active clients...")
    del clients[data["user_id"]]




if (__name__ == '__main__'):
    socketio.run(app, host='0.0.0.0', debug=True)
    
    
socketio.emit("Starting", {'data':'test'})





