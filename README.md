# Flageolet

An early Node.js MUD engine with a TCP terminal interface, ANSI maps, and in-game world editing.

Flageolet is my early **multi-user dungeon (MUD)** project: a shared text world explored through typed commands. It combines networking, command interpretation, world modelling, and terminal rendering.

It is a working prototype, **not currently under active development**.

![An English terminal session showing the Temple Courtyard, its description, exits, and a coloured map](docs/images/terminal-demo.png)

*Live `nc` session. `@` marks your position; the map shows nearby rooms.*

## What it implements

- **Shared world over TCP:** multiple terminal clients explore the same rooms and chat.
- **Command interpretation:** aliases, abbreviations, and argument patterns for directions, items, and characters.
- **Terminal presentation:** ANSI colours, box drawing, and a local map generated from room connections.
- **Bilingual content:** English and Russian room text and messages, switchable during a session.
- **NPC dialogue:** numbered replies, nested menus, and a separate conversation state for each player.
- **World editing:** plugins extend commands and messages; the editor creates, connects, edits, and deletes rooms, saving areas as JSON.

The code uses JavaScript/CommonJS and Node's built-in TCP and filesystem APIs, with separate command, presentation, entity, and plugin modules. Earlier trading and guard-quest experiments remain in the source; their world initializer is disabled.

## Run locally

Tested with **Node.js 24.15.0** and macOS `nc` (netcat). Use a UTF-8 terminal at least **80 columns** wide with ANSI colour support. The default demo needs no dependency installation.

```sh
git clone https://github.com/yernende/flageolet.git
cd flageolet
PORT=7070 npm start
```

In another terminal:

```sh
nc localhost 7070
```

Sessions start in Russian. Enter these commands **one line at a time**:

```text
language en
look
north
west
east
east
recall
```

The five-room demo contains an altar, courtyard, two gardens, and a gate. At the altar, try `talk acolyte`, then `2` to ask for directions, `2` to return, and `3` to say farewell. During conversations, enter reply numbers; an empty line repeats the menu.

![Acolyte dialogue with numbered replies and directions around the temple](docs/images/dialogue-demo.png)

*A live `nc` conversation with the temple guide.*

Open a second connection to try `who` and `say hello` with another player.

| Command | Action |
| --- | --- |
| `look` | Show the current room and map |
| `north`, `south`, `east`, `west` | Move; `n`, `s`, `e`, `w` also work |
| `recall` | Return to the altar |
| `talk` / `talk acolyte` | Speak with the guide at the altar |
| `language en` / `language ru` | Switch language |
| `commands` | List all command patterns, including editor commands |
| `quit` | Disconnect |

Stop with `Ctrl+C`. The default port is `7000`; this example uses `7070` to avoid a macOS port conflict.

## Prototype boundaries

This is a local demonstration: there are no accounts or access controls, and every player can use the world editor. `save world` overwrites the area files. Player sessions are temporary. The guide is recreated on startup; trading and quests are outside this demo.
