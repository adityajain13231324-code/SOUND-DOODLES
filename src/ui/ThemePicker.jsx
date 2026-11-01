import React from "react";
import { Check, Palette } from "lucide-react";
import { Popover } from "./overlays.jsx";
import { IconButton } from "./kit.jsx";
import { THEME_LIST } from "../theme.js";

/** Four LIVE mini-previews: each swatch is scoped with its own data-theme, so it renders the real tokens. */
export function ThemePicker({ theme, onChange }) {
  return (
    <Popover
      label="Choose a theme"
      trigger={({ toggle, props }) => (
        <IconButton label="Change theme" onClick={toggle} {...props}>
          <Palette size={20} />
        </IconButton>
      )}
    >
      {(close) => (
        <div className="theme-picker">
          <h3>Pick a place</h3>
          <div className="theme-picker-grid">
            {THEME_LIST.map(({ key, name, blurb }) => (
              <button
                key={key}
                type="button"
                data-theme={key}
                className={`theme-swatch ${theme === key ? "selected" : ""}`}
                aria-pressed={theme === key}
                onClick={() => {
                  onChange(key);
                  close();
                }}
              >
                <span className="swatch-stage">
                  <span className="swatch-card">
                    <i className="swatch-line" />
                    <i className="swatch-line short" />
                  </span>
                  <span className="swatch-btn">Aa</span>
                </span>
                <span className="swatch-name">
                  {name}
                  {theme === key && <Check size={14} aria-hidden="true" />}
                </span>
                <small>{blurb}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </Popover>
  );
}
