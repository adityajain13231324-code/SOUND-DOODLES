import React from "react";

/** Fixed theme backdrop. Each theme shows only its own props (see styles/stage.css). */
export function StageBackground() {
  return (
    <div className="stage-bg" aria-hidden="true">
      <span className="spot" />
      <span className="grain" />
      <span className="sky" />
      <span className="sun" />
      <span className="cloud-a" />
      <span className="cloud-b" />
      <span className="horizon" />
      <span className="floor" />
      <span className="scan" />
      <span className="dots" />
      <span className="tape-a" />
      <span className="tape-b" />
    </div>
  );
}
