# Word library and own-word mode (Gartic Sounds)

## What it is

- **1,399 starting words** in 15 packs, every entry one or two words (never a sentence): Animals, Famous people, Characters & legends, Food & drink,
  Places & landmarks, Things around the house, Jobs, Sports & games, Nature & weather, Vehicles & machines, Fantasy & monsters, Movies & shows,
  Music & instruments, Everyday actions, Science & space. The original list of sound ideas is still available as the "Sound ideas" pack.
- **Starting words** choice in the lobby (Gartic Sounds only):
  - _From the library_: everyone is dealt a surprise word from the chosen pack ("Everything" by default).
  - _We write our own_: each player types a word of **one or two words**. A live counter and message refuse sentences; the server enforces the same rule.
    The player can shuffle the suggested word up to three times or keep it. Anyone who passes or runs out of time keeps their suggestion.
- **Word library browser**: a card per pack with its size and a few random sample words (**Peek again** reshuffles the samples). The full list is never sent to the
  browser, so the words stay a surprise. The host can pick a pack from the browser.

## Where things live

- `server/words.js`: the packs, `cleanStartingWord()` (the one-or-two-word rule), `wordsFor()`, `libraryOverview()`.
- `server/game.js`: `wordPack` room setting, `drawWord()` (no repeats until a pack is used up), `shuffleSeed` event, seed-phase validation.
- `GET /api/words/library`: pack names, sizes and random samples only.
- `src/ui/StartingWords.jsx`, `src/ui/WordLibrary.jsx`, `src/screens/SeedScreen.jsx`, `src/styles/words.css`.

## Rules

- A word is 1 or 2 tokens, each starting with a letter or digit and containing only letters, digits, apostrophes, periods or hyphens, at most 20 characters per word and
  30 overall. Hyphenated names count as one word (`Spider-Man`).
- Every library word appears in exactly one pack, so "Everything" never repeats an entry.
- Famous people are well-known public figures (historical, scientific, sporting, musical, film and a few Indian icons), chosen to be friendly. There is no profanity filter
  on words players type themselves; this is a game for private rooms among friends.

## Adding words

Edit the comma-separated lists in `server/words.js`. `npm test` checks that the library has 1,000+ unique entries and that every entry passes the one-or-two-word rule.

## Tests

Unit: library integrity, the word rule, own-word seed phase, pack draws, shuffle limit, no repeats. Browser: own-word flow with two sessions and the library browser.

## Classic word choices (Skribbl style)

- The performer is dealt **3, 4 or 5 words** (host setting, default 4), **easiest first**, each tagged EASY, MEDIUM or HARD with its category.
- Classic only deals **one- or two-word** prompts. Scenes and sentences ("Dog chasing a bouncing ball") are never dealt in Classic.
- Words come from the room's pack: "Everything" blends the sound ideas (about 40%) with the family-friendly library, "Sound ideas" uses only the curated list,
  and any other pack deals only from that pack. Library words are guessed by their name; famous people and characters also accept the surname or character name alone.
- Hints for library words are the category, then the letter count.

## Spicy pack (18+)

- A 117-word pack of flirty, cheeky and mildly naughty words for adult groups. It is suggestive and never explicit.
- **Opt-in only.** It is never part of "Everything". The host must pick it in the word library and confirm "We're all adults"; the server refuses the pack without
  that confirmation. Every player sees a "Spicy words are on" banner in the lobby, and switching to another pack turns it off.
- The library never previews its words, so opening the browser cannot surprise anyone.
- Works for both Classic and Gartic Sounds.

## Microphone list

The mic check lists microphones as soon as it opens and refreshes when hardware is plugged in or removed. Browsers hide device names until microphone permission is
granted, so unnamed devices appear as "Microphone 1, 2…" with a **Find my microphones** button. The chosen microphone is remembered, and if it is unplugged the
game falls back to the system default.
