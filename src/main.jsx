import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/bricolage-grotesque";
import "./styles.css";
import "./motion.css";
import "./awards.css";
import "./guess.css";
import "./reveal.css";
import { syncMusic } from "./ambience.js";
import { App } from "./App.jsx";

syncMusic();
createRoot(document.getElementById("root")).render(<App />);
