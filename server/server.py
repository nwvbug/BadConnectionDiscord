import asyncio
import websockets
import json
import threading
import discord
clients = { #username:clientObj

}

sockets = { #username:socket

}

async def recieve(websocket): #incoming messages need NAME and INTENTS: name to send to correct user and intents to decide what to do w message
    print("\n\n-------NEW MESSAGE BREAK ------ \n\n")
    data = await websocket.recv()
    onstart = {
        "intents":"startup",
        "message":"Connected to Lye"
    }
    await websocket.send(json.dumps(onstart));
    
    parsed = json.loads(data);
    intents = parsed["intents"];
    print("INTENTS: "+intents);
    if(intents == "startup"):
        #print("Data recieved: "+data);
        print("New user connected, adding to dicts. Name: "+parsed["username"])
        instantiateClient(parsed)
        sockets[parsed["username"]] = websocket
    if (intents == "msg"):
        forwardMessageToDiscord(parsed["messageContent"]);
    

#Discord methods
def startDiscord(tk):
    print("Starting up discord with token "+tk)
    client = discord.Client();
    loop = asyncio.get_event_loop()
    loop.create_task(client.start(tk))
    #loop.run_forever()
    return client

  
async def on_ready(self):
    print("User logged in: "+self.user)
    sendDiscordConfirm(self.user)

async def on_message(self, message):
    print("msg from/contents: "+message.author+" "+message.contents)
    if (message.author != self.user):
        forwardMessageToClient(message.contents, message.author, self.user)

async def sendMessage(channel, contents):
    await channel.send(contents);

def instantiateClient(object):
    print("Starting discord client")
    client = startDiscord(object["discordtoken"])
    clients[object["username"]] = client

async def forwardMessageToDiscord(msg):
    clients[msg["username"]].sendMessage(msg.channel, msg.contents)

async def forwardMessageToClient(contents, author, self):
    toSend = {
        "author":author,
        "contents":contents
    }
    sockets[self].send(json.dumps(toSend))





async def main():
    print("Server starting...")
    async with websockets.serve(recieve, "localhost", 8765):
        await asyncio.Future()

    


def sendDiscordConfirm(user):
    onstart = {
        "intents":"startup",
        "message":"Connected to Discord"
    }
    sockets[user].send(json.dumps(onstart));

if __name__ == "__main__":
    asyncio.run(main())



