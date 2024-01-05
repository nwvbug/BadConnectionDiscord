import discord

client = discord.Client()

@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('$hello'):
        await message.channel.send('Hello!')

client.run('ODgyNDA2MjY4MTY4NDY2NDkz.GV54kU.A3bWCqEdxe8HQxrLSzVtv1PUjbiTEXzzvzmHbY')