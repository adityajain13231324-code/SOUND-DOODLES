import React, { useState } from "react";
import { MODES } from "../../shared/modes.js";
import { Foley } from "../components.jsx";
import { mic } from "../audio.js";
import { icons } from "../support.js";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Mic,
  Plus,
  Settings,
} from "lucide-react";

export function Lobby({ state, me, host, act, onMic }) {
  const [more, setMore] = useState(false),
    [settings, setSettings] = useState(false);
  const mode = MODES[state.settings.mode];
  const active = state.players.filter((p) => !p.spectator && p.connected);
  const canStart =
    active.length >= mode.min &&
    active.every((p) => p.ready) &&
    (state.settings.mode === "classic"
      ? active.some((p) => p.mic)
      : active.every((p) => p.mic));
  const change = (patch) =>
    act("settings", { settings: { ...state.settings, ...patch } });
  return (
    <>
      <div className="lobby-heading">
        <span className="eyebrow">WELCOME TO YOUR LITTLE STUDIO</span>
        <h1>
          Good company.
          <br />
          <em>Questionable acoustics.</em>
        </h1>
        <p>Get comfy, check your mic, and pick your kind of chaos.</p>
      </div>
      <div className="lobby-mode-head">
        <h2>Tonight’s game</h2>
        {!host && <small>The host picks the mode.</small>}
        <button className="text-button" onClick={() => setSettings(!settings)}>
          <Settings size={16} />
          Room settings
          <ChevronDown size={14} />
        </button>
      </div>
      <div className="lobby-flagships">
        {["classic", "gartic"].map((key) => {
          const m = MODES[key],
            Icon = icons[m.icon];
          return (
            <button
              key={key}
              disabled={!host}
              className={`lobby-mode ${state.settings.mode === key ? "selected" : ""}`}
              onClick={() => change({ mode: key })}
            >
              <Icon size={27} />
              <h3>{m.name}</h3>
              <p>{m.description}</p>
              <span>
                {m.min}–8 players
                {state.settings.mode === key && <Check size={17} />}
              </span>
            </button>
          );
        })}
      </div>
      <button
        className="text-button more-toggle"
        onClick={() => setMore(!more)}
      >
        Four more ways to make a scene
        <ChevronDown size={16} />
      </button>
      {(more || !["classic", "gartic"].includes(state.settings.mode)) && (
        <div className="extra-mode-grid">
          {Object.entries(MODES)
            .slice(2)
            .map(([key, m]) => {
              const Icon = icons[m.icon];
              return (
                <button
                  key={key}
                  disabled={!host}
                  className={state.settings.mode === key ? "selected" : ""}
                  onClick={() => change({ mode: key })}
                >
                  <Icon size={22} />
                  <strong>{m.name}</strong>
                  <small>{m.min}–8 players</small>
                  <p>{m.description}</p>
                </button>
              );
            })}
        </div>
      )}
      {settings && (
        <div className="room-settings">
          <label className="field">
            {state.settings.mode === "classic"
              ? "Turns per performer"
              : "Rounds"}
            <select
              aria-label={
                state.settings.mode === "classic"
                  ? "Turns per performer"
                  : "Rounds"
              }
              disabled={!host}
              value={state.settings.rounds}
              onChange={(e) => change({ rounds: Number(e.target.value) })}
            >
              {[1, 2, 3].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Difficulty
            <select
              disabled={!host}
              value={state.settings.difficulty}
              onChange={(e) => change({ difficulty: e.target.value })}
            >
              <option value="mixed">A little of everything</option>
              <option value="easy">Everyday sounds</option>
              <option value="hard">Weird little scenes</option>
            </select>
          </label>
          {state.settings.mode === "gartic" ? (
            <>
              <label className="field">
                Chain length
                <select
                  disabled={!host}
                  value={state.settings.chainLength}
                  onChange={(e) =>
                    change({ chainLength: Number(e.target.value) })
                  }
                >
                  <option value={0}>Everyone contributes once</option>
                  <option value={3}>3 contributions</option>
                  <option value={4}>4 contributions (if enough players)</option>
                </select>
              </label>
              <label className="check-row">
                <input
                  disabled={!host}
                  type="checkbox"
                  checked={state.settings.customPrompts}
                  onChange={(e) => change({ customPrompts: e.target.checked })}
                />
                Write your own starting phrases
              </label>
              <label className="check-row">
                <input
                  disabled={!host}
                  type="checkbox"
                  checked={!!state.settings.awards}
                  onChange={(e) => change({ awards: e.target.checked })}
                />
                Friendly awards vote after the reveal
              </label>
            </>
          ) : (
            <label className="field">
              Performance time
              <select
                disabled={!host}
                value={state.settings.performanceSeconds}
                onChange={(e) =>
                  change({ performanceSeconds: Number(e.target.value) })
                }
              >
                {[30, 40, 60].map((n) => (
                  <option value={n} key={n}>
                    {n} seconds
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
      <div className="lobby-bottom">
        <button className="mic-check" onClick={onMic}>
          {me.mic ? <Check size={23} /> : <Mic size={23} />}
          <span>
            <strong>
              {me.mic ? "Microphone checked" : "A quick mic check?"}
            </strong>
            <small>
              {me.mic
                ? "You’re ready to be ridiculous."
                : "Make sure we can hear your masterpiece."}
            </small>
          </span>
          <ArrowRight size={18} />
        </button>
        <div className="ready-controls">
          {me.spectator ? (
            <button
              className="button outline"
              onClick={() => act("seat", { spectator: false })}
            >
              <Plus size={17} />
              Take a player seat
            </button>
          ) : (
            <>
              <button
                className={`button ${me.ready ? "mint" : "outline"}`}
                onClick={() => act("ready", { ready: !me.ready })}
              >
                <Check size={18} />
                {me.ready ? "I’m ready!" : "Ready up"}
              </button>
              <button
                className="text-button"
                onClick={() => act("seat", { spectator: true })}
              >
                Watch instead
              </button>
            </>
          )}
          {host && (
            <button
              className="button primary"
              disabled={!canStart}
              onClick={() => act("start")}
            >
              Let’s make noise
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
      <p className="lobby-note">
        {active.length < mode.min
          ? `Invite ${mode.min - active.length} more friend${mode.min - active.length === 1 ? "" : "s"} to play ${mode.name}.`
          : !active.every((p) => p.ready)
            ? "Waiting for everyone to ready up."
            : !canStart
              ? "Check microphones or switch to spectator. Classic allows guessers without a mic."
              : host
                ? "Everyone’s here. The mic is yours."
                : "All set. Waiting for the host to start."}
      </p>
      <p className="small muted">
        {state.settings.mode === "classic"
          ? "Classic: up to 200 points for a quick correct guess. Performers earn up to 200 based on the fraction who solve it."
          : state.settings.mode === "gartic"
            ? "Gartic: no right answers and no scores. Record, interpret, pass it on, then enjoy the reveal."
            : state.settings.mode === "ranking"
              ? "Ranking: place every other sound in order. First gets 1 point, then evenly descending fractions, scaled to 100 on the scoreboard."
              : state.settings.mode === "foley"
                ? "Foley: one vote per person, no self-votes. Every vote is worth 100 points. Ties share the spotlight."
                : state.settings.mode === "detective"
                  ? "Detective: identify the outsider for 100 points. The outsider gets 200 if not caught or if their final guess is right. A tie does not catch anyone."
                  : "Duo: each performer gets one part of the scene. Guess both components; each performer earns the same solve-rate bonus."}
      </p>
    </>
  );
}
