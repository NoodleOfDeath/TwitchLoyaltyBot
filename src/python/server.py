import inspect
import json
import os
from twitchio.ext import commands

irc_token = os.environ.get('OAUTH_TOKEN')
client_id = os.environ.get('CLIENT_ID')
bot_username = os.environ.get('BOT_USERNAME')
command_prefix = os.environ.get('COMMAND_PREFIX')
channel = os.environ.get('CHANNEL')
user_id = os.environ.get('USER_ID')

def get_raffle_data():
    f = open("raffle-data.json", "r")
    data = json.loads(f.read())
    f.close()
    return data

def save_raffle_data(data = "{}"):
    f = open("raffle-data.json", "w")
    f.write(json.dumbs(data))
    f.close()

# set up the bot
bot = commands.Bot(
    irc_token = irc_token,
    client_id = client_id,
    nick = bot_username,
    prefix = command_prefix,
    initial_channels = [channel],
)

@bot.event
async def event_ready():
    'Called once when the bot goes online.'
    print(f"{bot_username} is online!")
    ws = bot._ws  # this is only needed to send messages within event_ready
    await ws.send_privmsg(channel, f"/me has landed!")

@bot.event
async def event_message(ctx):
    'Runs every time a message is sent in chat.'
    # make sure the bot ignores itself and the streamer
    if ctx.author.name.lower() == bot_username.lower():
        return
    await bot.handle_commands(ctx)

# General Commands

@bot.command(name='commands')
async def commands(ctx):
    print(str(ctx))
    await ctx.send(ctx.author.name + " -> Here is a list of the commands you can use with " + bot_username + " on this channel: https://example.com/commands")

# Broadcaster Commands

@bot.command(name='throw')
async def throw(ctx):
    if not ctx.author.is_mod:
        ctx.send(ctx.author.name + "you are not authorized to run that command.")
        return
    await ctx.send(inspect.stack()[0][3])

@bot.command(name='openraffle')
async def open_raffle(ctx):
    if not ctx.author.is_mod:
        ctx.send(ctx.author.name + "you are not authorized to run that command.")
        return
    await ctx.send(inspect.stack()[0][3])

@bot.command(name='closeraffle')
async def close_raffle(ctx):
    if not ctx.author.is_mod:
        ctx.send(ctx.author.name + "you are not authorized to run that command.")
        return
    await ctx.send(inspect.stack()[0][3])

@bot.command(name='pickwinner')
async def pick_winner(ctx):
    if not ctx.author.is_mod:
        ctx.send(ctx.author.name + "you are not authorized to run that command.")
        return
    await ctx.send(inspect.stack()[0][3])

@bot.command(name='removewinner')
async def remove_winner(ctx):
    if not ctx.author.is_mod:
        ctx.send(ctx.author.name + "you are not authorized to run that command.")
        return
    await ctx.send(inspect.stack()[0][3])

@bot.command(name='winners')
async def winners(ctx):
    if not ctx.author.is_mod:
        ctx.send(ctx.author.name + "you are not authorized to run that command.")
        return
    await ctx.send(inspect.stack()[0][3])

# User commands

@bot.command(name='catch')
async def catch(ctx):
    await ctx.send(inspect.stack()[0][3])

@bot.command(name='tix')
async def tix(ctx):
    await ctx.send(inspect.stack()[0][3])

@bot.command(name='raffle')
async def raffle(ctx):
    await ctx.send(inspect.stack()[0][3])

@bot.command(name='join')
async def join(ctx):
    await ctx.send(inspect.stack()[0][3])

@bot.command(name='leave')
async def leave(ctx):
    await ctx.send(inspect.stack()[0][3])

if __name__ == "__main__":
    bot.run()