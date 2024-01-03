a way to use discord when your connection is bad. as such, only supports text
client -> intermediary server -> discord
connection between client and intermediary intends to have less overhead than the connection between a discord client and the discord servers.


server deps: pip packages: "websockets" "discord.py-self"
client deps: pip packages: ~~"websockets"~~ "Flask"
built on python 3.11