import json
from MyClient import MyClient
from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)
if (__name__ == '__main__'):
    socketio.run(app)

clients = { #username:clientObj

}
@socketio.on("json")
def recieve(data): #incoming messages need NAME and INTENTS: name to send to correct user and intents to decide what to do w message
    print("\n\n-------NEW MESSAGE BREAK ------ \n\n")
    #data = await websocket.recv()
    onstart = {
        "intents":"startup",
        "message":"Connected to Lye"
    }
    #await websocket.send(json.dumps(onstart))

    parsed = json.loads(data)
    intents = parsed["intents"]
    print("INTENTS: "+intents)
    if(intents == "startup"):
        #print("Data recieved: "+data);
        print("New user connected, adding to dicts. Name: "+parsed["username"])
        client = MyClient(websocket, parsed["discordtoken"], parsed["username"])
        clients[parsed["username"]] = client
        client.run(parsed["discordtoken"])
    if (intents == "msg"):
        pass

@socketio.on("connecting")
def 




    





