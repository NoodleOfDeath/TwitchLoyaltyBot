
require('dotenv').config()
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const tmi = require('tmi.js');

// Import custom node modules
const Array = require('./Array.js')
const String = require('./String.js')

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN,
  },
  channels: [
    process.env.CHANNEL,
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

/* --------------------------------------------------
 * Command Class Definition
 * -------------------------------------------------- */

// Defines the Command class
var Command = function(name, config) {
  self = this
  this.name = pfx(name)
  this.requirements = config.requirements || {}
  this.validate = function(channel, tags, args) {
    if (this.requirements) {
      const reqs = this.requirements
      if (reqs['user-id']) {
        if (tags['user-id'] != reqs['user-id']) {
          client.say(channel, 'You are not authorized to run that command')
          return false
        }
      }
      if (reqs.args) {
        if (args.length < reqs.args.length) {
          client.say(channel, 'This command requires at least ' + reqs.args.length + ' argument(s). ')
          return false
        }
        for (var i in reqs.args) {
          const type = reqs.args[i]
          const arg = args[i]
          switch (type) {
            case 'number':
              if (parseInt(arg) + '' == 'NaN') {
                client.say(channel, 'A "' + type + '"  is expected for argument ' + eval(i+1) + ' of this command. ')
                return false
              }
              break
            default:
              break
            }
        }
      }
    }
    return true
  }
  this.onRun = config.onRun
  this.run = (channel, tags, args) => {
    if (this.validate(channel, tags, args))
      this.onRun(channel, tags, args)
  }
}

Command.prototype.pp = function(str) {
  return str.replace(/\$this/g, this.name)
}

var pfx = function(str) {
  return process.env.COMMAND_PREFIX + str
}

var mention = function(tags) {
  return '@' + tags['display-name']
}

var commands = {}

// Adds a commmand to the global command dictionary
function addCommand(command) {
  commands[command.name] = command
}

// Runs a command
function runCommand(channel, tags, commandName, args) {
  
  var command = commands[commandName]
  var response = null
  
  if (command !== undefined && command !== null) {
    try {
      command.run(channel, tags, args)
    } catch(e) {
      console.log(e)
      client.say(channel, e)
    }
  } else {
    const response = [
      'I don\'t know that command. Dafuq am I supposed to do with ' + commandName.qquote() + '?', 
      'Try running ' + pfx('commands').qquote() + ' to get a list of all possible commands.'
    ].joinLines()
    client.say(channel, response)
  }
  
}

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Called every time a message comes in
function onMessageHandler (channel, tags, msg, self) {
  
  if (self) { return } // Ignore messages from the bot
  
  const args = msg.parseArgs()
  const commandName = args.shift()
  const prefix = commandName.substring(0, 1)
  
  switch (prefix) {
    case process.env.COMMAND_PREFIX:
      break
    default:
      return
  }
  
  runCommand(channel, tags, commandName, args)
  
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  
}

/* --------------------------------------------------
 * Commands
 * -------------------------------------------------- */

// /commands command
addCommand(
  new Command('commands', {
    onRun: (channel, tags, args) => {
      client.say(channel, mention(tags) + ' -> Here is a list of the commands you can use with ' + client.getUsername() + ' on this channel: https://example.com/commands')
    },
  }))
  
function getRaffleData() {
  const raffleData = JSON.parse(fs.readFileSync('raffle-data.json', 'utf-8'))
  return raffleData
}

function saveRaffleData(raffleData) {
  fs.writeFileSync('raffle-data.json', JSON.stringify(raffleData, null, 2))
}

addCommand(
  new Command('throw', {
    requirements: { 
      'user-id': process.env.USER_ID,
      args: ['number'],
    },
    onRun: (channel, tags, args) => {
      var raffleData = getRaffleData()
      var claimable = raffleData.claimable || 0
      const count = parseInt(args.shift())
      claimable += count
      raffleData.claimable = claimable
      saveRaffleData(raffleData)
      client.say(channel, tags['display-name'] + ' just threw ' + count + ' raffle ticket(s) in the air! The next ' + claimable + ' viewers to chat the command ' + pfx('catch').qquote() + ' will catch a raffle ticket for a chance to win a gift card!')
    }
  }))
  
addCommand(
  new Command('openraffle', {
    requirements: {
      'user-id': process.env.USER_ID,
    },
    onRun: (channel, tags, args) => {
      var raffleData = getRaffleData()
      if (raffleData.raffle) {
        client.say(channel, tags['display-name'] + ', please close the current ongoing raffle before starting a new one.')
        return
      }
      raffleData.raffle = true
      raffleData.participants = {}
      raffleData.winners = {}
      saveRaffleData(raffleData)
      client.say(channel, tags['display-name'] + ' just opened a raffle! If you wish to join the raffle, chat the ' + pfx('join') + ' command now!')
    }
  }))

addCommand(
  new Command('closeraffle', {
    requirements: {
      'user-id': process.env.USER_ID,
    },
    onRun: (channel, tags, args) => {
      var raffleData = getRaffleData()
      raffleData.raffle = false
      raffleData.participants = {}
      raffleData.winners = {}
      saveRaffleData(raffleData)
      client.say(channel, tags['display-name'] + ' has closed the raffle!')
    }
  }))
  
addCommand(
  new Command('pickwinner', {
    requirements: {
      'user-id': process.env.USER_ID,
    },
    onRun: (channel, tags, args) => {
      var raffleData = getRaffleData()
      if (!raffleData.raffle) {
        client.say(channel, tags['display-name'] + ', there is currently no ongoing raffle!')
        return
      }
      var winners = raffleData.winners || {}
      var odds = []
      var participants = raffleData.participants
      Object.keys(participants).forEach((k) => {
        const p = raffleData.users[k]
        if (!p) return
        for (var i = 0; i < (p.tickets || 0); ++i)
          odds.push(p['user-id'])
      })
      console.log(odds)
      const i = Math.floor(Math.random() * odds.length)
      const winner_id = odds[i]
      const winner = raffleData.users[winner_id]
      winners[winner_id] = {}
      raffleData.winners = winners
      saveRaffleData(raffleData)
      client.say(channel, '@' + winner['display-name'] + ' has won the raffle!')
    }
  }))

addCommand(
  new Command('removewinner', {
    requirements: {
      'user-id': process.env.USER_ID,
    },
    onRun: (channel, tags, args) => {
      client.say(channel, 'Command does nothing yet')
      return
      var raffleData = getRaffleData()
      var winners = raffleData.winners || {}
      const username = args.shift()
      const id = raffleData.users.first((user) => {
        return user.username == username.substring(1)
      })
      delete winners[id]
      raffleData.winners = winners
      saveRaffleData(raffleData)
    }
  }))
  
addCommand(
  new Command('removeparticipant', {
    requirements: {
      'user-id': process.env.USER_ID,
    },
    onRun: (channel, tags, args) => {
      client.say(channel, 'Command does nothing yet')
    }
  }))
  
addCommand(
  new Command('winners', {
    requirements: {
      'user-id': process.env.USER_ID,
    },
    onRun: (channel, tags, args) => {
      const raffleData = getRaffleData()
      if (!raffleData.raffle) {
        client.say(channel, 'There is currently no ongoing raffle.')
        return
      }
      const winners = Object.keys(raffleData.winners || {})
      if (winners.length == 0) {
        client.say(channel, 'There are no winners selected for this raffle yet.')
        return
      }
      var names = []
      winners.forEach((winner) => {
        const user = raffleData.users[winner]
        if (!user) return
        names.push('@' + user['display-name'])
      })
      client.say(channel, names.join(', '))
    }
  }))
  
addCommand(
  new Command('catch', {
    onRun: (channel, tags, args) => {
      
      var raffleData = getRaffleData()
      
      var claimable = raffleData.claimable || 0
      if (claimable < 1) {
         client.say(channel, mention(tags) + ', unfortunately, there are no more raffle tickets that can be users.')
         return
       }
      
      var users = raffleData.users || {}
      var user = users[tags['user-id']] || {}
      const catch_timeout =  process.env.CATCH_TIMEOUT || 10
      if (user.last_claimed) {
        const last_claimed = moment(user.last_claimed)
        const diff = moment.duration(moment().diff(last_claimed)).asMinutes()
        if (diff < catch_timeout) {
          client.say(channel, 'Looks like you last claimed a raffle ticket ' + diff.toFixed(0) + ' minutes ago! You may only catch a raffle ticket once every ' + catch_timeout + ' minutes! Try again in ' + eval(catch_timeout - diff).toFixed(0) + ' minutes!')
          return
        }
      }      
      
      claimable--
      raffleData.claimable = claimable
      
      user.tickets = (user.tickets || 0) + 1
      user.last_claimed = moment().format()
      user['user-id'] = tags['user-id']
      user['display-name'] = tags['display-name']
      user.username = tags['username']
      
      users[tags['user-id']] = user
      raffleData.users = users
      
      saveRaffleData(raffleData)
      
      client.say(channel, mention(tags) + ', you just claimed a ticket! You currently have ' + user.tickets + ' ticket(s). You can always check how many raffle tickets you have by using the ' + pfx('tix').qquote() + ' command')

    }
  }))

addCommand(
  new Command('tix', {
    onRun: (channel, tags, args) => {
      const raffleData = getRaffleData()
      const user = raffleData.users[tags['user-id']] || {}
      client.say(channel, 'You currently have ' + (user.tickets || 0) + ' raffle ticket(s). There are currently ' + raffleData.claimable + ' claimable tickets remaining. You can claim a ticket using the ' + pfx('catch').qquote() + ' command.')
    }
  }))
  
addCommand(
  new Command('raffle', {
    onRun: (channel, tags, args) => {
      const raffleData = getRaffleData()
      if (!raffleData.raffle) {
        client.say(channel, mention(tags) + ', there is currently no ongoing raffle!')
        return
      }
      var totalTickets = 0
      Object.keys(raffleData.participants).forEach((k) => {
        const p = raffleData.users[k]
        if (!p) return
        totalTickets += p.tickets
      })
      const user = raffleData.users[tags['user-id']]
      var participating = false
      if (raffleData.participants[tags['user-id']]) {
        participating = true
      }
      const odds = (((participating ? user.tickets : 0)/totalTickets) * 100).toFixed(0)
      client.say(channel, mention(tags) + ' -> ' +
        'Participants: ' + Object.keys(raffleData.participants).length + ', ' + 
        'Total Tickets: ' + totalTickets + ', ' +
        'Your Odds: ' + odds + '%' + (participating ? '' : ' because you are not participating. You can participate by chatting the ' + pfx('join').qquote() + ' command.')
      )
    }
  }))
  
addCommand(
  new Command('join', {
    onRun: (channel, tags, args) => {
      var raffleData = getRaffleData()
      if (!raffleData.raffle) {
        client.say(channel, mention(tags) + ', there is currently no raffle ongoing for you to join')
        return
      }
      var participants = raffleData.participants
      if (participants[tags['user-id']]) {
        client.say(channel, mention(tags) + ', you have already joined the raffle! If you wish to not participate in this raffle, use the ' + pfx('leave').qquote() + ' command.')
        return
      }
      var user = raffleData.users[tags['user-id']] || {}
      participants[tags['user-id']] = {}
      raffleData.participants = participants
      saveRaffleData(raffleData)
      client.say(channel, mention(tags) + ', you have joined the raffle!')
    }
  }))

addCommand(
  new Command('leave', {
    onRun: (channel, tags, args) => {
      var raffleData = getRaffleData()
      if (!raffleData.raffle) {
        client.say(channel, mention(tags) + ', there is currently no raffle ongoing for you to leave')
        return
      }
      var participants = raffleData.participants
      if (!participants[tags['user-id']]) {
        client.say(channel, mention(tags) + ', you are not currently participating in this raffle.')
        return
      }
      delete participants[tags['user-id']]
      raffleData.participants = participants
      saveRaffleData(raffleData)
      client.say(channel, mention(tags) + ', you have left the raffle!')
    }
  }))
  
addCommand(
  new Command('claim', {
    onRun: (channel, tags, args) => {
      
    }
  }))
  
addCommand(
  new Command('decline', {
    onRun: (channel, tags, args) => {
      
    }
  }))
  
// Connect to Twitch
client.connect()
