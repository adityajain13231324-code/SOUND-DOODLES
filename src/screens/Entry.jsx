import React, { useState } from "react";
import { AVATARS } from "../../shared/modes.js";
import { Avatar, Modal } from "../components.jsx";
import { ArrowRight } from "lucide-react";

export function Entry({ type, onClose, enter, busy, connected, code = "" }) {
  const [name, setName] = useState(localStorage.getItem("sd-name") || ""),
    [avatar, setAvatar] = useState(localStorage.getItem("sd-avatar") || ""),
    [roomCode, setCode] = useState(code),
    [spectator, setSpectator] = useState(false);
  return (
    <Modal
      title={
        type === "create"
          ? "Your room. Your kind of weird."
          : "The gang’s waiting."
      }
      onClose={onClose}
    >
      <p className="muted">
        Pick a little face and a name your friends will recognize. Skip the face
        and we’ll give you one nobody else has.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          localStorage.setItem("sd-name", name);
          if (avatar) localStorage.setItem("sd-avatar", avatar);
          await enter({
            create: type === "create",
            code: roomCode.toUpperCase().trim(),
            name,
            avatar: avatar || undefined,
            spectator,
          });
        }}
      >
        <div className="avatar-picker">
          {AVATARS.map((a) => (
            <button
              type="button"
              key={a}
              className={a === avatar ? "selected" : ""}
              aria-label={`Choose ${a} avatar`}
              aria-pressed={a === avatar}
              onClick={() => setAvatar(a)}
            >
              <Avatar kind={a} size={49} />
            </button>
          ))}
        </div>
        <label className="field">
          Your nickname
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Something your friends call you"
            required
            maxLength={20}
            autoComplete="nickname"
          />
        </label>
        {type === "join" && (
          <label className="field">
            Room code
            <input
              value={roomCode}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              required
              maxLength={6}
              minLength={6}
              className="code-input"
              autoCapitalize="characters"
            />
          </label>
        )}
        <label className="check-row">
          <input
            type="checkbox"
            checked={spectator}
            onChange={(e) => setSpectator(e.target.checked)}
          />
          Just watching? Join as a spectator.
        </label>
        <button className="button primary wide" disabled={busy || !connected}>
          {busy
            ? "Getting the studio ready…"
            : !connected
              ? "Connecting to the studio…"
              : type === "create"
                ? "Create room"
                : "Join room"}
          <ArrowRight size={18} />
        </button>
        <p className="small muted center">
          No accounts. No downloads. Only excellent company.
        </p>
      </form>
    </Modal>
  );
}
