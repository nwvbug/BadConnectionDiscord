import discord
import json
class MyClient(discord.Client):

    def setVars(self, socketID, token, uname, socketio):
        self.socketID = socketID
        self.token = token
        self.username = uname
        self.socketio = socketio
        print("Registering user "+uname)

    async def on_ready(self):
        print("Logged on as "+self.user)

    async def on_message(self, message):
        if message.author == self.user:
            return
        if message.author.dm_channel.id != message.channel.id:
            return
        
        name = str(message.author)
        new_contents = message.content
        dataToSend = {
            "intents":"message",
            "message":new_contents,
            "channel":message.channel.id,
            "author":name
        }
        self.socketio.emit(dataToSend, json=True)

        
        