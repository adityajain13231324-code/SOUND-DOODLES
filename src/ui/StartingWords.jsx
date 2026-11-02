import React, { useState } from "react";
import { BookOpen, Flame, Library, PenLine } from "lucide-react";
import { WordLibrary, useLibrary } from "./WordLibrary.jsx";
import { sfx } from "./sfx.js";

/** Gartic's "Starting words" choice: draw from the library, or let everyone type their own one or two words. */
export function StartingWords({ settings, host, change }) {
  const [open, setOpen] = useState(false);
  const { data } = useLibrary();
  const own = !!settings.customPrompts;
  const packName =
    settings.wordPack === "mixed"
      ? "Everything"
      : settings.wordPack === "sounds"
        ? "Sound ideas"
        : data?.packs.find((p) => p.id === settings.wordPack)?.name ||
          "Library";
  const pick = (value) => {
    if (!host || value === own) return;
    sfx("pop");
    change({ customPrompts: value });
  };
  return (
    <section className="starting-words" aria-label="Starting words">
      <div className="sw-head">
        <h3>Starting words</h3>
        {!host && <small>The host chooses.</small>}
      </div>
      <div
        className="segmented"
        role="radiogroup"
        aria-label="Where do starting words come from?"
      >
        <button
          type="button"
          role="radio"
          aria-checked={!own}
          className={!own ? "on" : ""}
          disabled={!host}
          onClick={() => pick(false)}
        >
          <BookOpen size={18} />
          <span>
            <strong>From the library</strong>
            <small>We deal everyone a surprise word</small>
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={own}
          className={own ? "on" : ""}
          disabled={!host}
          onClick={() => pick(true)}
        >
          <PenLine size={18} />
          <span>
            <strong>We write our own</strong>
            <small>One or two words each, not a sentence</small>
          </span>
        </button>
      </div>
      <div className="sw-pack">
        <span>
          {own
            ? `Each player types a word. The suggestion comes from: ${packName}.`
            : `Words come from: ${packName}.`}
        </span>
        <button
          type="button"
          className="chip-button"
          onClick={() => setOpen(true)}
        >
          <Library size={15} />
          Browse the word library
        </button>
      </div>
      {open && (
        <WordLibrary
          selected={settings.wordPack}
          canChoose={host}
          onChoose={(id, adults) => {
            change({ wordPack: id, adultsOnly: !!adults });
            sfx("pop");
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}

/** Classic's word setup: how many words the performer picks from, and which pack they come from. */
export function ClassicWords({ settings, host, change }) {
  const [open, setOpen] = useState(false);
  const { data } = useLibrary();
  const count = settings.choices || 4;
  const packName =
    settings.wordPack === "mixed"
      ? "Everything"
      : settings.wordPack === "sounds"
        ? "Sound ideas"
        : data?.packs.find((p) => p.id === settings.wordPack)?.name ||
          "Library";
  return (
    <section className="starting-words" aria-label="Words to pick from">
      <div className="sw-head">
        <h3>Words to pick from</h3>
        {!host && <small>The host chooses.</small>}
      </div>
      <p className="sw-sub">
        The performer sees these words, easiest first, and picks whichever they
        fancy.
      </p>
      <div
        className="segmented count"
        role="radiogroup"
        aria-label="How many words to pick from"
      >
        {[3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={count === n}
            className={count === n ? "on" : ""}
            disabled={!host}
            onClick={() => {
              sfx("pop");
              change({ choices: n });
            }}
          >
            <strong>{n}</strong>
            <small>words</small>
          </button>
        ))}
      </div>
      <div className="sw-pack">
        <span>
          {settings.adultsOnly && <Flame size={15} className="sw-flame" />}
          Words come from: {packName}.
        </span>
        <button
          type="button"
          className="chip-button"
          onClick={() => setOpen(true)}
        >
          <Library size={15} />
          Browse the word library
        </button>
      </div>
      {open && (
        <WordLibrary
          selected={settings.wordPack}
          canChoose={host}
          onChoose={(id, adults) => {
            change({ wordPack: id, adultsOnly: !!adults });
            sfx("pop");
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}
