import discord
import json
import threading
import requests
import random
class MyClient(discord.Client):

    def setVars(self, socketID, token, uname, socketio):
        self.socketID = socketID
        self.token = token
        self.username = uname
        self.socketio = socketio
        print("Registering user "+uname)

    async def on_ready(self):
        print("Logged on as "+self.user.name)
        self.updateClient()

    async def on_message(self, message):
        print("\n\n-------NEW MESSAGE BREAK: DISCORD SERVER MESSAGE ------ \n\n")
        print("Message recieved for user "+self.username)
        if message.author == self.user:
            return
        if message.author.dm_channel.id != message.channel.id:
            return
        
        name = str(message.author)
        new_contents = message.content
        dataToSend = {
            "intents":"message",
            "content":new_contents,
            "channel":message.channel.id,
            "author":name
        }
        self.socketio.send(dataToSend, json=True)

    def getDmList(self):
        dmsList = {}
        self.channelList = {}
        count = 0
        for user in self.user.friends:
            if (user.dm_channel != None):
                dmsList[count] = user.name
                self.channelList[user.name] = user.dm_channel
            count =  count+1

        return [dmsList, count]


    def updateClient(self):
        dmsList = self.getDmList()
        dataToSend = {
            "intents":"init_client",
            "message":None,
            "channel":None,
            "author":None,
            "dmsList":dmsList[0],
            "dmsListLength":dmsList[1]
        }
        self.socketio.send(dataToSend, json=True)

    def sendToDiscord(self, message, to):
        print("forwarding message to Discord...")
        url = "https://discord.com/api/v9/channels/"+str(self.channelList[to].id)+"/messages"
        rand_nonce = random.randint(1000000000000000000, 2000000000000000000)
        msg = {
        "content": message,
        "tts": False,
        "nonce":rand_nonce
        }
        req = requests.post(url, headers={
            "Authorization":self.token, 
            "Content-Type":"application/json",
            "Origin":"https://discord.com",
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Connection":"keep-alive"
            }, json=msg)
        #print("Request Sending: "+req.text)

    def getRecents(self, to):
        url = "https://discord.com/api/v9/channels/"+str(self.channelList[to].id)+"/messages?limit=15"
        req = requests.get(url=url, headers={
            "Authorization":self.token, 
            "Content-Type":"application/json",
            "Origin":"https://discord.com",
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Connection":"keep-alive"
            })
        print("status code "+str(req.status_code))
        return req.text

        
        