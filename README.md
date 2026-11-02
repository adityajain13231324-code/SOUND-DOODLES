# Sound Doodles

A browser party game for 2–8 friends: you get a prompt, you make the sound, your friends try to work it out.
Six modes (Classic, Gartic Sounds, Foley and Ranking start from 2 players; Duo Orchestra and Sound Detective need 4): **Classic** and **Gartic Sounds** (flagship), plus Duo Orchestra, Sound Detective, Five-Second Foley and Blind Ranking.
Four themes: Paper Playground (default), Midnight Studio, Neon Arcade, Sunset Lounge. No accounts needed.

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
npm test                 # 34 unit and socket tests
npx playwright install chromium   # first time only (tests use the Chrome channel)
npm run test:browser     # 11 browser tests: four sessions per mode, simulated microphones
node scripts/shots.mjs   # screenshots of every theme at 390, 768 and 1440 px into shots/
npm run dev              # then open /styleguide (or #/styleguide) to see every component in all four themes
```

## Audio extras

- **Music:** an optional, quiet synthesized loop (Audio settings, off by default). It fades out while anyone performs, records or replays a sound.
- **Announcer lines:** optional and sparse ("Your turn", "Time to guess", "Let's hear what happened"). The three mp3 files are included (generated with ElevenLabs, stock voice).
  To generate them with ElevenLabs (costs credits, run once, then listen and commit the files):
  `ELEVENLABS_API_KEY=... node scripts/generate-announcer.mjs` (a stock voice is picked for you)``. Use a stock or designed voice, never a cloned player voice.
- **Word library:** 1,399 one-or-two-word starting words in 15 packs, plus an own-word mode where players type their own. See [docs/WORD-LIBRARY.md](docs/WORD-LIBRARY.md).
- **Gartic awards:** the host can enable a friendly awards vote after the reveal (funniest transformation, best sound, most unexpected, most accurate).

## Configuration

| Variable                                       | Purpose                                                                                                                                                                                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                                         | Server port (default 3000).                                                                                                                                                                                                   |
| `PUBLIC_ORIGIN`                                | Optional. Leave unset on normal hosting: the server accepts requests from its own site and refuses other sites. Set it only behind a proxy that changes the Host header, to your exact public URL (https, no trailing slash). |
| `ROOM_TTL_MINUTES`                             | Maximum room lifetime, 10–120 (default 120).                                                                                                                                                                                  |
| `TURN_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL` | Optional TURN relay for live audio on restrictive networks.                                                                                                                                                                   |

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

More detail: [UI overhaul, tokens and changelog](docs/UI-OVERHAUL.md), [architecture](docs/ARCHITECTURE.md), [test report](docs/TEST-REPORT.md), [audio assets](public/audio/MANIFEST.md).
