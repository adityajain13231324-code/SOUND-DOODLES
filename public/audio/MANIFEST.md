# Audio asset manifest

| File        | Used for                         | Bytes  |
| ----------- | -------------------------------- | ------ |
| confirm.mp3 | button confirmation, ready state | 7,880  |
| submit.mp3  | submission confirmation          | 7,880  |
| start.mp3   | round start                      | 9,134  |
| warning.mp3 | time running out                 | 9,134  |
| correct.mp3 | correct guess                    | 12,896 |
| results.mp3 | final results sting              | 12,896 |
| prepare.mp3 | preparation cue                  | 14,777 |
| reveal.mp3  | reveal transition                | 14,777 |

**Provenance:** these eight files were produced during the first build (outside this session). Their generation tool and settings were not
recorded, so they are **not confirmed to be ElevenLabs output**. Treat licensing as unverified until they are regenerated or replaced with
files whose source is recorded here. Player performances are never AI-generated.

## Announcer lines (not generated yet)

`public/audio/announce/your-turn.mp3`, `time-to-guess.mp3`, `lets-hear.mp3` are produced by `scripts/generate-announcer.mjs` through the
official ElevenLabs text-to-speech API. They have not been generated: this needs an API key and voice id from the owner. The game works without them.

## Music

Background music is synthesized in the browser by `src/ambience.js` (original chord loop, no external assets or licenses).
