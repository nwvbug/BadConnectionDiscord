import discord
import json
class MyClient(discord.Client):

    def __init__(self, socket, token, uname, *args, **kwargs):
        self.socket = socket
        self.token = token
        self.username = uname
        print("Registering user "+uname)
        super().__init__(*args, **kwargs)

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
            "message":message.content,
            "channel":message.channel.id
        }
        self.socket.send(json.dumps(dataToSend))
        