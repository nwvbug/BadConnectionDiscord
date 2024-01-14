import discord
import json
import threading
import requests
import random
class MyClient(discord.Client):

    def setVars(self, socketID, socketio, token=None):
        self.socketID = socketID
        if (token != None):
            self.token = token
        
        self.socketio = socketio
        print("Registering user "+self.token+" with a socket connection of "+socketID)

    async def on_ready(self):
        print("Logged on as "+self.user.name) #this goofy shit doesnt work like half the time
        if self.is_ready():
            self.updateClient()

    async def on_message(self, message):    
        if not self.is_ready(): #when not readyt DONT RUN THE CODE 
            return
        #print("\n\n-------NEW MESSAGE BREAK: DISCORD SERVER MESSAGE ------ \n\n")
        #print("Message recieved for user "+self.username)
        if message.author == self.user: #dont reply to yourself bruh
            return
        try:
            if message.author.dm_channel.id != message.channel.id:
                return
        except:
            return
        
        name = str(message.author)
        new_contents = message.content
        dataToSend = {
            "author":name,
            "content":new_contents,
            "id":message.id,
            "timestamp":str(message.created_at),
            "intents":"message"
        }
            
        if len(message.attachments) > 0:   
            lst = list()
            for item in message.attachments:
                lst.append({"url":item.url})

            dataToSend["images"] = lst
        self.socketio.send(dataToSend, json=True, room=self.socketID)

    def getDmList(self):
        dmsList = {}
        self.channelList = {}
        count = 0
        for user in self.friends:
            if (user.user.dm_channel != None):
                dmsList[count] = user.user.name
                self.channelList[user.user.name] = user.user.dm_channel
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
            "dmsListLength":dmsList[1],
            "username":self.user.name
        }
        self.socketio.send(dataToSend, json=True, room=self.socketID)

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

        
        