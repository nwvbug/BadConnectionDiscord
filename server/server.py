import json
from MyClient import MyClient
from flask import Flask, render_template, request
from flask_socketio import SocketIO
from flask_cors import CORS
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
    print("\n\n-------NEW MESSAGE BREAK ------ \n\n")
    parsed = json.loads(data)
    intents = parsed["intents"]
    print("INTENTS: "+intents)
    if(intents == "startup"):
        #print("Data recieved: "+data);
        print("New user connected, adding to dicts. Name: "+parsed["username"])
        print("User's ID is "+request.sid)
        client = MyClient()
        client.setVars(request.sid, parsed["discordtoken"], parsed["username"], socketio)
        clients[parsed["username"]] = client
        client.run(parsed["discordtoken"])
        onstart = {
            "intents":"startup",
            "message":"User setup complete. NWVBUG Session Active."
        }
        socketio.send(onstart, json=True)
    if (intents == "msg"):
        pass

@socketio.on("connecting")
def completeHandshake(data):
    print("Handshake request made.")
    socketio.emit("read")



if (__name__ == '__main__'):
    socketio.run(app, host='0.0.0.0', debug=True)
    
    
socketio.emit("Starting", {'data':'test'})





