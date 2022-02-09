# LoyaltyBot

A very simplistic Twitch loyalty/raffle bot that allows users to interact with the broadcaster by acquiring raffle tickets thrown by the broadcaster!

## Quick Start

You will need to make a separate Twitch account that will act as the chat bot user/moderator and handle chat commands sent by the broadcaster and viewers.

You will also need to generate an `OAUTH_TOKEN` **while logged in as that bot user** from [this web portal](https://twitchapps.com/tmi/)

For the Python implementation, you will need to register a new application from the [Twitch Developer Console](https://dev.twitch.tv/console) to acquire a `CLIENT_ID`. You may log into the developer console using your main Twitch account.

```bash
$ git clone https://github.com/NoodleOfDeath/LoyaltyBot
Cloning into 'LoyaltyBot'...
remote: Enumerating objects: 43, done.
remote: Counting objects: 100% (43/43), done.
remote: Compressing objects: 100% (30/30), done.
remote: Total 43 (delta 10), reused 42 (delta 9), pack-reused 0
Receiving objects: 100% (43/43), 16.71 KiB | 1.52 MiB/s, done.
Resolving deltas: 100% (10/10), done.
$ sed -i '' 's/oauth_token/your_oauth_token/' src/*/.env
$ sed -i '' 's/client_id/your_client_id/' src/*/.env
$ sed -i '' 's/bot_username/your_bot_username/' src/*/.env
$ sed -i '' 's/channel_name/your_twitch_channel_name/' src/*/.env
$ sed -i '' 's/allowed_user_id/your_twitch_user_id/' src/*/.env
```

If you want to change the `COMMAND_PREFIX` you will need to modify that environment variable in the respective `.env` file.

### Node

```bash
$ cd src/node
$ npm install

added 8 packages, and audited 9 packages in 2s

found 0 vulnerabilitie
$ npm run start
```

### Python

```bash
$ cd src/python
$ pip install -r requirements.txt
DEPRECATION: Configuring installation scheme with distutils config files is deprecated and will no longer work in the near future. If you are using a Homebrew or Linuxbrew Python, please see discussion at https://github.com/Homebrew/homebrew-core/issues/76621
Collecting altgraph==0.10.2
  Downloading altgraph-0.10.2.tar.gz (481 kB)
     |████████████████████████████████| 481 kB 3.3 MB/s            
  Preparing metadata (setup.py) ... done
Requirement already satisfied: appdirs==1.4.4 in /usr/local/lib/python3.9/site-packages (from -r requirements.txt (line 2)) (1.4.4)
Collecting asn1crypto==0.24.0
  Downloading asn1crypto-0.24.0-py2.py3-none-any.whl (101 kB)
     |████████████████████████████████| 101 kB 17.8 MB/s           
Collecting bdist-mpkg==0.5.0
  Downloading bdist_mpkg-0.5.0.zip (26 kB)
  Preparing metadata (setup.py) ... done
ERROR: Could not find a version that satisfies the requirement bonjour-py==0.3 (from versions: none)
ERROR: No matching distribution found for bonjour-py==0.3
WARNING: You are using pip version 21.3.1; however, version 22.0.3 is available.
You should consider upgrading via the '/usr/local/opt/python@3.9/bin/python3.9 -m pip install --upgrade pip' command.
$ python3 ./server.py
```
