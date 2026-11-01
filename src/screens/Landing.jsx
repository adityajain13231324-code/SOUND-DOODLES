import React from "react";
import { MODES } from "../../shared/modes.js";
import { Avatar, Wave } from "../components.jsx";
import { mic } from "../audio.js";
import { icons } from "../support.js";
import {
  ArrowRight,
  ArrowUpRight,
  Headphones,
  Mic,
  Plus,
  Users,
} from "lucide-react";

export function Landing({ onCreate, onJoin, onHelp }) {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span className="status-dot" /> A PARTY GAME FOR YOUR VOICE
          </div>
          <h1>
            Make some
            <br />
            <span className="noise-word">
              noise
              <svg viewBox="0 0 300 20" aria-hidden="true">
                <path d="M4 12Q120-2 290 10M40 18Q160 6 260 17" />
              </svg>
            </span>
            .<br />
            Make a mess.
          </h1>
          <p>
            Your friends. A mystery sound. Absolutely no dignity.
            <br className="desktop-break" /> Turn your best (or worst)
            impressions into a game night.
          </p>
          <div className="hero-actions">
            <button className="button primary large" onClick={onCreate}>
              <Plus size={20} />
              Create a room
              <ArrowUpRight size={20} />
            </button>
            <button className="button large outline" onClick={onJoin}>
              Join a room
              <ArrowRight size={19} />
            </button>
          </div>
          <div className="hero-meta">
            <span>
              <Users size={16} />
              2–8 friends
            </span>
            <span>
              <Mic size={16} />
              Bring your voice
            </span>
            <span>
              <Headphones size={16} />
              Headphones recommended
            </span>
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="An illustrated recording booth with playful sound characters"
        >
          <div className="art-grid" />
          <span className="art-label">
            <i /> THE STUDIO IS YOURS
          </span>
          <span className="scribble squeak">squeeeak!</span>
          <span className="scribble brr">brrr?</span>
          <span className="spark spark-one">✳</span>
          <span className="spark spark-two">✦</span>
          <div className="sound-ring ring-one" />
          <div className="sound-ring ring-two" />
          <div className="main-character">
            <Avatar kind="blob" size={230} />
            <div className="headphone-band" />
            <div className="headphone-ear left" />
            <div className="headphone-ear right" />
          </div>
          <div className="mini-character mint">
            <Avatar kind="ghost" size={104} />
          </div>
          <div className="mini-character coral">
            <Avatar kind="star" size={90} />
          </div>
          <div className="mic-stand">
            <Mic size={60} />
            <i />
          </div>
          <div className="sound-tape">
            <Wave decorative />
            <span>100% YOU. 0% TALENT REQUIRED.</span>
          </div>
          <span className="art-note">a little weird sounds good on you ↗</span>
        </div>
      </section>
      <section className="modes-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">PICK YOUR KIND OF CHAOS</span>
            <h2>Same friends. New noises.</h2>
          </div>
          <button className="text-button" onClick={onHelp}>
            How it works
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="flagship-grid">
          {["classic", "gartic"].map((key, i) => (
            <button key={key} className={`mode-card ${key}`} onClick={onCreate}>
              <div className="mode-card-copy">
                <span className="mode-tag">{MODES[key].tag}</span>
                <h3>{MODES[key].name}</h3>
                <p>{MODES[key].description}</p>
                <span className="mode-link">
                  {key === "classic"
                    ? "Make it. Guess it."
                    : "Pass it. Twist it."}
                  <ArrowUpRight size={18} />
                </span>
              </div>
              <div className="mode-art">
                {key === "classic" ? (
                  <>
                    <Avatar kind="cat" size={110} />
                    <span className="bubble">a duck?!</span>
                    <span className="mini-wave">ııIııIı</span>
                  </>
                ) : (
                  <>
                    <span className="chain-chip">a kettle</span>
                    <Mic size={25} />
                    <span className="chain-chip">a spaceship?</span>
                    <span className="chain-doodle">↝</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="more-modes">
          <span>MORE WAYS TO PLAY</span>
          {Object.entries(MODES)
            .slice(2)
            .map(([key, mode]) => {
              const Icon = icons[mode.icon];
              return (
                <button key={key} onClick={onCreate}>
                  <Icon size={17} />
                  {mode.name}
                  <ArrowUpRight size={13} />
                </button>
              );
            })}
        </div>
      </section>
    </div>
  );
}
