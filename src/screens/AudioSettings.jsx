import React, { useState, useEffect } from "react";
import { audioPrefs, cue, saveAudio } from "../audio.js";
import { announcerAvailable, syncMusic } from "../ambience.js";
import { Volume2 } from "lucide-react";

export function AudioSettings() {
  const [prefs, setPrefs] = useState({ ...audioPrefs });
  const [hasAnnouncer, setHasAnnouncer] = useState(true);
  useEffect(() => {
    announcerAvailable().then(setHasAnnouncer);
  }, []);
  return (
    <>
      <p className="muted">
        Player voices always come first. Effects pause during live audio,
        recording, and reveal playback.
      </p>
      {[
        ["voice", "Player voices"],
        ["effects", "Game sound effects"],
        ["announcements", "Announcer lines"],
        ["music", "Background music"],
      ].map(([key, label]) => (
        <label className="volume-control" key={key}>
          <span>
            {label}
            <b>{Math.round(prefs[key] * 100)}%</b>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={prefs[key]}
            onChange={(e) => {
              audioPrefs[key] = Number(e.target.value);
              setPrefs({ ...audioPrefs });
              saveAudio();
              if (key === "music") syncMusic();
            }}
          />
        </label>
      ))}
      <button className="button outline" onClick={() => cue("confirm")}>
        <Volume2 size={17} />
        Preview effects
      </button>
      <p className="small muted">
        Music is a quiet synthesized loop and pauses while anyone performs or
        records.
        {!hasAnnouncer &&
          " Announcer voice files are not installed on this server, so that slider has no effect yet."}{" "}
        Live audio uses peer connections. Some networks require a TURN relay
        configured by the host operator.
      </p>
    </>
  );
}
