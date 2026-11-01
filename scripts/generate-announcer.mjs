// Generates the optional announcer lines with the official ElevenLabs text-to-speech API.
// Run once during development, listen to the results, then commit the mp3 files.
//   ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... node scripts/generate-announcer.mjs
// Use a stock or designed voice. Never clone a player's voice. This costs credits, so it is never
// called during gameplay.
import { mkdir, writeFile } from "node:fs/promises";

const key = process.env.ELEVENLABS_API_KEY;
const voice = process.env.ELEVENLABS_VOICE_ID;
if (!key || !voice) {
  console.error("Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID first.");
  process.exit(1);
}
const lines = {
  "your-turn": "Your turn.",
  "time-to-guess": "Time to guess.",
  "lets-hear": "Let's hear what happened.",
};
const out = new URL("../public/audio/announce/", import.meta.url);
await mkdir(out, { recursive: true });
for (const [name, text] of Object.entries(lines)) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
    },
  );
  if (!res.ok) {
    console.error(`${name}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  await writeFile(
    new URL(`${name}.mp3`, out),
    Buffer.from(await res.arrayBuffer()),
  );
  console.log(`wrote ${name}.mp3`);
}
