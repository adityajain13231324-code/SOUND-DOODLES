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
