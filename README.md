# Sound Doodles

A browser party game for 3–8 friends: you get a prompt, you make the sound, your friends try to work it out.
Six modes: **Classic** and **Gartic Sounds** (flagship), plus Duo Orchestra, Sound Detective, Five-Second Foley and Blind Ranking.
Four themes: Midnight Studio (default), Paper Playground, Neon Arcade, Sunset Lounge. No accounts needed.

## Run it

Requires Node 22.12+.

```bash
npm install
cp .env.example .env   # optional; defaults work locally
npm run dev            # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## Test it

```bash
npm test                 # 22 unit and socket tests
npx playwright install chromium   # first time only (tests use the Chrome channel)
npm run test:browser     # 7 browser tests: four sessions per mode, simulated microphones
node scripts/shots.mjs   # screenshots of every theme at desktop and phone sizes into shots/
```

## Configuration

| Variable                                       | Purpose                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| `PORT`                                         | Server port (default 3000).                                                            |
| `PUBLIC_ORIGIN`                                | Public URL of the site. Used to build invite links and to reject cross-origin uploads. |
| `ROOM_TTL_MINUTES`                             | Maximum room lifetime, 10–120 (default 120).                                           |
| `TURN_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL` | Optional TURN relay for live audio on restrictive networks.                            |

## Hosting

The server holds all room state and recordings in memory, so run **one instance** (no horizontal scaling) on a host that supports WebSockets.
`Dockerfile` and `render.yaml` are included for Render; Railway and Fly.io also work with the Dockerfile.
Restarting the server clears every room.

Live audio in Classic and Duo uses WebRTC peer-to-peer. STUN alone fails on some corporate and mobile networks;
add a TURN relay (for example a free-tier TURN service) through the `TURN_*` variables for dependable play.

## Privacy

Recordings are kept in server memory only. Unsubmitted uploads are deleted after 2 minutes, submitted clips are deleted
with the room (at most 2 hours, or 10 minutes after everyone leaves). Clips are served only to players who are allowed to hear them.
Classic rounds are never recorded.

More detail: [architecture](docs/ARCHITECTURE.md), [test report](docs/TEST-REPORT.md), [audio assets](public/audio/MANIFEST.md).
