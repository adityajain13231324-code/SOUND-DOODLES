import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/bricolage-grotesque";

import "./styles/tokens.css";
import "./styles/legacy.css";
import "./styles/motion.css";
import "./styles/awards.css";
import "./styles/guess.css";
import "./styles/reveal.css";
import "./styles/stage.css";
import "./styles/ui.css";
import "./styles/screens.css";
import { syncMusic } from "./ambience.js";
import { App } from "./App.jsx";

syncMusic();
createRoot(document.getElementById("root")).render(<App />);
