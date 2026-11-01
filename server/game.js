import { randomInt, randomUUID } from "node:crypto";
import { prompts, matchPrompt } from "./prompts.js";
import { MODES, AVATARS } from "../shared/modes.js";

export class GameError extends Error {}
const requireThat = (condition, message) => {
  if (!condition) throw new GameError(message);
};
export function shuffle(values) {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function routing(ids, rounds) {
  const order = shuffle(ids);
  return Array.from({ length: rounds }, (_, round) =>
    Object.fromEntries(order.map((owner, i) => [order[(i + round) % order.length], owner])),
  );
}
export function rankingScores(entries, ballots) {
  const scores = Object.fromEntries(entries.map((e) => [e.id, 0]));
  for (const ranking of Object.values(ballots))
    ranking.forEach((id, i) => {
      scores[id] += (ranking.length - i) / ranking.length;
    });
  return scores;
}
export class Room {
  constructor(code, { now = () => Date.now(), scale = 1 } = {}) {
    this.code = code;
    this.now = now;
    this.scale = scale;
    this.created = now();
    this.touched = now();
    this.players = [];
    this.host = null;
    this.phase = "lobby";
    this.phaseId = 0;
    this.deadline = null;
    this.audio = new Map();
    this.recent = [];
    this.settings = {
      mode: "classic",
      rounds: 2,
      chainLength: 0,
      difficulty: "mixed",
      performanceSeconds: 40,
      customPrompts: false,
    };
    this.reactions = [];
    this.replay = 0;
    this.autoplay = false;
  }
  add({ name, avatar = "blob", spectator = false }) {
    requireThat(this.players.length < 12, "This room is full.");
    requireThat(
      typeof name === "string" && name.trim().length >= 1 && name.trim().length <= 20,
      "Use a nickname from 1 to 20 characters.",
    );
    const p = {
      id: randomUUID(),
      token: randomUUID() + randomUUID(),
      name: name.trim(),
      avatar: AVATARS.includes(avatar) ? avatar : "blob",
      spectator: this.phase !== "lobby" || spectator,
      connected: true,
      ready: false,
      mic: false,
      score: 0,
    };
    if (!p.spectator)
      requireThat(
        this.players.filter((p) => !p.spectator).length < 8,
        "Eight players are already here. Join as a spectator.",
      );
    this.players.push(p);
    this.host ??= p.id;
    return p;
  }
  player(id) {
    return this.players.find((p) => p.id === id);
  }
  active() {
    return this.players.filter((p) => !p.spectator && p.connected);
  }
  setPhase(phase, seconds = null) {
    this.phase = phase;
    this.phaseId++;
    this.started = this.now();
    this.deadline = seconds ? this.now() + seconds * 1000 * this.scale : null;
    this.reactions = [];
    this.touched = this.now();
  }
  draw(mode = this.settings.mode) {
    let pool = prompts.filter(
      (p) =>
        p.modes.includes(mode) &&
        (mode !== "duo" || p.components.length === 2) &&
        (this.settings.difficulty === "mixed" ||
          p.difficulty === this.settings.difficulty ||
          mode === "duo"),
    );
    if (!pool.length) pool = prompts.filter((p) => p.modes.includes(mode));
    let available = pool.filter((p) => !this.recent.includes(p.id));
    if (!available.length) {
      this.recent = [];
      available = pool;
    }
    const prompt = available[randomInt(available.length)];
    this.recent.push(prompt.id);
    this.recent = this.recent.slice(-80);
    return prompt;
  }
  performers() {
    if (this.phase !== "perform") return [];
    return this.settings.mode === "detective"
      ? [this.order[this.speakerIndex]]
      : this.performerIds || [];
  }
  start() {
    const active = this.active();
    const mode = this.settings.mode;
    requireThat(
      active.length >= MODES[mode].min,
      `${MODES[mode].name} needs at least ${MODES[mode].min} players.`,
    );
    requireThat(
      active.every((p) => p.ready),
      "Everyone needs to be ready.",
    );
    requireThat(
      mode === "classic" ? active.filter((p) => p.mic).length >= 1 : active.every((p) => p.mic),
      "Check your microphones first, or choose spectator. Classic also allows guessers without a microphone.",
    );
    this.ids = shuffle(active.map((p) => p.id));
    this.players.forEach((p) => (p.score = 0));
    this.round = 0;
    this.audio.clear();
    this.autoplay = false;
    if (mode === "gartic") {
      this.chainRounds = this.settings.chainLength
        ? Math.min(this.ids.length, this.settings.chainLength)
        : this.ids.length;
      this.schedule = routing(this.ids, this.chainRounds);
      this.chains = Object.fromEntries(
        this.ids.map((id) => [
          id,
          {
            id: randomUUID(),
            owner: id,
            entries: [{ type: "text", text: this.draw().phrase, author: id, round: -1 }],
          },
        ]),
      );
      this.contributionRound = 0;
      this.submissions = {};
      if (this.settings.customPrompts) this.setPhase("seed", 30);
      else this.beginTask();
    } else {
      this.totalRounds =
        mode === "classic"
          ? this.ids.filter((id) => this.player(id).mic).length * this.settings.rounds
          : this.settings.rounds;
      this.beginRound();
    }
  }
  beginRound() {
    if (this.round >= this.totalRounds) {
      this.setPhase("results");
      return;
    }
    this.submissions = {};
    this.ballots = {};
    this.progress = {};
    this.solved = {};
    this.skips = 0;
    this.prompt = null;
    this.answer = null;
    this.outsiderGuess = null;
    this.voteResult = null;
    this.entries = [];
    const mode = this.settings.mode;
    if (mode === "classic") {
      const performers = this.ids.filter((id) => this.player(id)?.mic);
      this.performerIds = [performers[this.round % performers.length]];
      this.eligible = this.ids.filter((id) => !this.performerIds.includes(id));
      this.choices = Array.from({ length: 3 }, () => this.draw());
      this.setPhase("choose", 20);
    } else if (mode === "duo") {
      this.performerIds = [
        this.ids[this.round % this.ids.length],
        this.ids[(this.round + 1) % this.ids.length],
      ];
      this.eligible = this.ids.filter((id) => !this.performerIds.includes(id));
      this.prompt = this.draw("duo");
      this.setPhase("prepare", 5);
    } else if (mode === "detective") {
      this.prompt = this.draw("detective");
      this.outsider = this.ids[this.round % this.ids.length];
      this.order = [
        ...this.ids.slice(this.round % this.ids.length),
        ...this.ids.slice(0, this.round % this.ids.length),
      ];
      this.speakerIndex = 0;
      this.setPhase("prepare", 5);
    } else {
      this.prompt = this.draw();
      this.animation = ["bounce", "slip", "door"][this.round % 3];
      this.setPhase("record", 35);
    }
  }
  beginTask() {
    this.submissions = {};
    this.setPhase(
      this.contributionRound % 2 === 0 ? "record" : "interpret",
      this.contributionRound % 2 === 0 ? 35 : 30,
    );
  }
  task(id) {
    if (this.settings.mode !== "gartic" || !this.ids?.includes(id)) return null;
    const owner = this.schedule[this.contributionRound]?.[id];
    const chain = this.chains[owner];
    if (!chain) return null;
    const last = chain.entries.at(-1);
    if (last.type === "missing") return { type: "text", text: "A squeaky door", replacement: true };
    return { type: last.type, text: last.text, audioId: last.audioId };
  }
  checkPhase(data) {
    requireThat(data.phaseId === this.phaseId, "That round has moved on. Try the current action.");
  }
  dispatch(id, event, data = {}) {
    requireThat(data && typeof data === "object", "Invalid action.");
    const p = this.player(id);
    requireThat(p?.connected, "Reconnect to the room first.");
    this.touched = this.now();
    const host = () => requireThat(this.host === id, "Only the host can do that.");
    const participant = () =>
      requireThat(
        this.ids?.includes(id),
        "You are watching this match. Join in from the next lobby.",
      );
    if (event === "ready") {
      requireThat(this.phase === "lobby", "The match has started.");
      p.ready = !!data.ready;
      return;
    }
    if (event === "mic") {
      p.mic = !!data.mic;
      return;
    }
    if (event === "seat") {
      requireThat(this.phase === "lobby", "Switch roles in the lobby.");
      if (!data.spectator)
        requireThat(
          this.players.filter((x) => !x.spectator && x.id !== id).length < 8,
          "All eight player seats are taken.",
        );
      p.spectator = !!data.spectator;
      p.ready = false;
      return;
    }
    if (event === "settings") {
      host();
      requireThat(this.phase === "lobby", "Change settings in the lobby.");
      const s = data.settings;
      requireThat(
        s && MODES[s.mode] && ["mixed", "easy", "hard"].includes(s.difficulty),
        "Choose valid room settings.",
      );
      requireThat(
        [1, 2, 3].includes(s.rounds) &&
          [0, 3, 4].includes(s.chainLength) &&
          [30, 40, 60].includes(s.performanceSeconds),
        "Unsupported timing or round count.",
      );
      this.settings = {
        mode: s.mode,
        difficulty: s.difficulty,
        rounds: s.rounds,
        chainLength: s.chainLength,
        performanceSeconds: s.performanceSeconds,
        customPrompts: !!s.customPrompts,
      };
      this.players.forEach((p) => (p.ready = false));
      return;
    }
    if (event === "start") {
      host();
      requireThat(this.phase === "lobby", "Already playing.");
      this.start();
      return;
    }
    if (event === "again") {
      host();
      requireThat(this.phase === "results", "Finish this match first.");
      this.audio.clear();
      this.chains = null;
      this.entries = [];
      this.ids = [];
      this.players.forEach((p) => (p.ready = false));
      this.setPhase("lobby");
      return;
    }
    if (event === "reaction") {
      requireThat(["👏", "😂", "✨", "🤯"].includes(data.emoji), "Choose a reaction.");
      requireThat(this.now() - (p.lastReaction || 0) >= 2000, "Give that reaction a moment.");
      p.lastReaction = this.now();
      this.reactions.push({ id: randomUUID(), emoji: data.emoji, name: p.name, at: this.now() });
      this.reactions = this.reactions.slice(-5);
      return;
    }
    this.checkPhase(data);
    if (event === "pick") {
      requireThat(
        this.phase === "choose" && this.performerIds.includes(id),
        "Only the performer can choose now.",
      );
      this.prompt = this.choices.find((p) => p.id === data.promptId);
      requireThat(this.prompt, "Choose one of your three prompts.");
      this.setPhase("prepare", 5);
      return;
    }
    if (event === "skipPrompt") {
      requireThat(
        this.phase === "choose" && this.performerIds.includes(id) && this.skips < 1,
        "One shuffle is allowed per turn.",
      );
      this.skips++;
      this.choices = Array.from({ length: 3 }, () => this.draw());
      return;
    }
    if (event === "guess") {
      participant();
      requireThat(
        this.phase === "perform" &&
          ["classic", "duo"].includes(this.settings.mode) &&
          this.eligible.includes(id),
        "You cannot guess right now.",
      );
      requireThat(
        typeof data.text === "string" && data.text.trim().length > 0 && data.text.length <= 120,
        "Keep guesses between 1 and 120 characters.",
      );
      requireThat(
        this.now() - (p.lastGuess || 0) >= 650,
        "A little slower. Give each guess a moment.",
      );
      p.lastGuess = this.now();
      if (this.solved[id]) return;
      const result = matchPrompt(this.prompt, data.text, this.progress[id]?.components);
      this.progress[id] = result;
      if (result.correct) {
        const remaining = Math.max(
          0,
          (this.deadline - this.now()) / (this.settings.performanceSeconds * 1000 * this.scale),
        );
        const points = 100 + Math.round(100 * remaining);
        this.solved[id] = points;
        p.score += points;
      }
      if (this.eligible.every((id) => this.solved[id])) this.finishPerformance();
      return;
    }
    if (event === "pass") {
      participant();
      if (
        ["choose", "prepare", "perform"].includes(this.phase) &&
        ((this.settings.mode === "detective" && this.performers().includes(id)) ||
          (["classic", "duo"].includes(this.settings.mode) && this.performerIds.includes(id)))
      ) {
        if (this.settings.mode === "detective") this.advance();
        else {
          this.prompt ??= this.choices?.[0];
          this.finishPerformance();
        }
        return;
      }
      requireThat(
        ["record", "interpret", "seed"].includes(this.phase),
        "You cannot pass at this step.",
      );
      if (!this.submissions[id])
        this.submissions[id] = { type: "missing", reason: "Passed", author: id };
      this.maybeSubmitted();
      return;
    }
    if (event === "submit") {
      participant();
      requireThat(["seed", "record", "interpret"].includes(this.phase), "Submissions are closed.");
      if (this.submissions[id]) return;
      if (this.phase === "record") {
        const a = this.audio.get(data.audioId);
        requireThat(
          a && a.owner === id && a.phaseId === this.phaseId,
          "Record and upload your sound first.",
        );
        this.submissions[id] = { type: "audio", audioId: data.audioId, author: id };
      } else {
        requireThat(
          typeof data.text === "string" && data.text.trim().length > 0 && data.text.length <= 100,
          "Use 1 to 100 characters.",
        );
        this.submissions[id] = { type: "text", text: data.text.trim(), author: id };
      }
      this.maybeSubmitted();
      return;
    }
    if (event === "vote") {
      participant();
      requireThat(this.phase === "vote", "Voting is closed.");
      if (this.ballots[id]) return;
      if (this.settings.mode === "detective") {
        requireThat(
          data.target === null || (this.ids.includes(data.target) && data.target !== id),
          "Choose someone else, or abstain.",
        );
        this.ballots[id] = { target: data.target };
      } else {
        requireThat(
          Array.isArray(data.ranking) && new Set(data.ranking).size === data.ranking.length,
          "Choose distinct recordings.",
        );
        const allowed = this.entries.filter((e) => e.author !== id).map((e) => e.id);
        requireThat(
          data.ranking.every((x) => allowed.includes(x)),
          "You cannot vote for your own sound.",
        );
        requireThat(
          this.settings.mode === "ranking"
            ? data.ranking.length === allowed.length
            : data.ranking.length <= 1,
          "Rank all other recordings, or pick one favorite in Foley.",
        );
        this.ballots[id] = data.ranking;
      }
      if (this.ids.every((id) => this.ballots[id])) this.advance();
      return;
    }
    if (event === "outsiderGuess") {
      requireThat(
        this.phase === "outsider" && id === this.outsider,
        "Only the outsider can make the final guess.",
      );
      requireThat(
        typeof data.text === "string" && data.text.length <= 120,
        "Keep the guess short.",
      );
      this.outsiderGuess = data.text;
      this.advance();
      return;
    }
    if (event === "next" || event === "nextChain" || event === "replay" || event === "autoplay") {
      host();
      requireThat(
        ["roundReveal", "chainReveal", "listening"].includes(this.phase),
        "Wait for the reveal.",
      );
      if (event === "replay") {
        this.replay++;
        return;
      }
      if (event === "autoplay") {
        this.autoplay = !!data.enabled;
        this.deadline = this.autoplay ? this.now() + 12000 * this.scale : null;
        return;
      }
      if (event === "nextChain") {
        requireThat(
          this.phase === "chainReveal" &&
            this.revealStep >= this.chains[this.ids[this.revealChain]].entries.length - 1,
          "Reveal every step first.",
        );
        this.advanceChain();
        return;
      }
      this.advance();
      return;
    }
    throw new GameError("That action is not available.");
  }
  maybeSubmitted() {
    if (this.ids.every((id) => this.submissions[id])) {
      this.pendingPhase = this.phase;
      this.setPhase("handoff", 2);
    }
  }
  finishPerformance() {
    const solved = Object.keys(this.solved).length;
    const bonus = Math.round((200 * solved) / Math.max(1, this.eligible.length));
    this.performerIds.forEach((id) => (this.player(id).score += bonus));
    this.answer = this.prompt.phrase;
    this.setPhase("roundReveal");
  }
  finishTask(phase = this.phase) {
    for (const id of this.ids)
      this.submissions[id] ??= { type: "missing", reason: "No submission", author: id };
    if (phase === "seed") {
      for (const id of this.ids)
        if (this.submissions[id].type === "text")
          this.chains[id].entries[0].text = this.submissions[id].text;
      this.beginTask();
      return;
    }
    if (this.settings.mode === "gartic") {
      for (const id of this.ids) {
        const chain = this.chains[this.schedule[this.contributionRound][id]];
        chain.entries.push({ ...this.submissions[id], round: this.contributionRound });
      }
      this.contributionRound++;
      if (this.contributionRound >= this.chainRounds) {
        this.revealChain = 0;
        this.revealStep = 0;
        this.setPhase("chainReveal");
      } else this.beginTask();
    } else {
      this.entries = shuffle(Object.values(this.submissions).filter((e) => e.type === "audio")).map(
        (e, i) => ({ ...e, id: randomUUID(), label: `Sound ${String.fromCharCode(65 + i)}` }),
      );
      this.listenIndex = 0;
      if (this.entries.length) this.setPhase("listening");
      else {
        this.voteResult = [];
        this.setPhase("roundReveal");
      }
    }
  }
  advanceChain() {
    this.revealChain++;
    this.revealStep = 0;
    if (this.revealChain >= this.ids.length) this.setPhase("results");
    else {
      this.setPhase("chainReveal");
      if (this.autoplay) this.deadline = this.now() + 12000 * this.scale;
    }
  }
  advance() {
    const mode = this.settings.mode;
    if (this.phase === "handoff") {
      this.finishTask(this.pendingPhase);
      return;
    }
    if (this.phase === "choose") {
      this.prompt = this.choices[0];
      this.setPhase("prepare", 5);
      return;
    }
    if (this.phase === "prepare") {
      this.setPhase("perform", mode === "detective" ? 10 : this.settings.performanceSeconds);
      return;
    }
    if (this.phase === "perform") {
      if (mode === "detective") {
        this.speakerIndex++;
        if (this.speakerIndex >= this.order.length) this.setPhase("vote", 30);
        else this.setPhase("perform", 10);
      } else this.finishPerformance();
      return;
    }
    if (["record", "interpret", "seed"].includes(this.phase)) {
      this.finishTask();
      return;
    }
    if (this.phase === "listening") {
      this.listenIndex++;
      if (this.listenIndex >= this.entries.length) this.setPhase("vote", 45);
      else {
        this.replay++;
        if (this.autoplay) this.deadline = this.now() + 12000 * this.scale;
      }
      return;
    }
    if (this.phase === "vote") {
      if (mode === "detective") {
        const counts = Object.fromEntries(this.ids.map((id) => [id, 0]));
        for (const b of Object.values(this.ballots)) if (b.target) counts[b.target]++;
        const max = Math.max(...Object.values(counts));
        const leaders = this.ids.filter((id) => counts[id] === max);
        this.caught = max > 0 && leaders.length === 1 && leaders[0] === this.outsider;
        this.voteResult = { counts, caught: this.caught, tie: leaders.length > 1 };
        this.setPhase("outsider", 20);
      } else {
        const totals = rankingScores(this.entries, this.ballots);
        this.voteResult = this.entries
          .map((e) => ({ ...e, points: Math.round(totals[e.id] * 100) }))
          .sort((a, b) => b.points - a.points);
        this.voteResult.forEach((e) => (this.player(e.author).score += e.points));
        this.setPhase("roundReveal");
      }
      return;
    }
    if (this.phase === "outsider") {
      const escaped = matchPrompt(this.prompt, this.outsiderGuess || "").correct;
      this.ids.forEach((id) => {
        if (id === this.outsider) {
          if (!this.caught || escaped) this.player(id).score += 200;
        } else if (this.ballots[id]?.target === this.outsider) this.player(id).score += 100;
      });
      this.voteResult = {
        ...this.voteResult,
        escaped,
        outsider: this.outsider,
        ballots: this.ballots,
      };
      this.answer = this.prompt.phrase;
      this.setPhase("roundReveal");
      return;
    }
    if (this.phase === "roundReveal") {
      this.round++;
      this.beginRound();
      return;
    }
    if (this.phase === "chainReveal") {
      const entries = this.chains[this.ids[this.revealChain]].entries;
      if (this.revealStep < entries.length - 1) {
        this.revealStep++;
        this.replay++;
        if (this.autoplay) this.deadline = this.now() + 12000 * this.scale;
      } else this.advanceChain();
      return;
    }
  }
  tick() {
    if (this.deadline && this.now() >= this.deadline) {
      this.advance();
      return true;
    }
    return false;
  }
  disconnect(id) {
    const p = this.player(id);
    if (!p) return;
    p.connected = false;
    p.ready = false;
    p.disconnectedAt = this.now();
    this.migrateHost();
  }
  migrateHost() {
    if (!this.player(this.host)?.connected)
      this.host = this.players.find((p) => p.connected)?.id || this.host;
  }
  storeAudio(id, buffer, mime, duration, phaseId) {
    requireThat(
      this.phase === "record" &&
        phaseId === this.phaseId &&
        this.ids.includes(id) &&
        !this.submissions[id],
      "This recording task has ended.",
    );
    requireThat(
      Buffer.isBuffer(buffer) && buffer.length > 100 && buffer.length <= 512000,
      "Record a clip smaller than 500 KB.",
    );
    requireThat(
      ["audio/webm", "audio/ogg", "audio/mp4"].includes(mime.split(";")[0]),
      "Unsupported recording format.",
    );
    requireThat(
      Number.isFinite(duration) &&
        duration > 0 &&
        duration <= (this.settings.mode === "foley" ? 5.5 : 10.5),
      "That recording is too long.",
    );
    for (const [key, a] of this.audio)
      if (a.owner === id && a.phaseId === phaseId) this.audio.delete(key);
    const key = randomUUID();
    this.audio.set(key, { owner: id, phaseId, buffer, mime, created: this.now(), duration });
    return key;
  }
  canHear(id, audioId) {
    if (!this.player(id)) return false;
    const a = this.audio.get(audioId);
    if (!a) return false;
    if (a.owner === id) return true;
    if (this.phase === "interpret" && this.task(id)?.audioId === audioId) return true;
    if (this.phase === "chainReveal")
      return this.chains[this.ids[this.revealChain]].entries
        .slice(0, this.revealStep + 1)
        .some((e) => e.audioId === audioId);
    if (
      ["listening", "vote", "roundReveal", "results"].includes(this.phase) &&
      this.settings.mode !== "gartic"
    )
      return this.entries?.some(
        (e) =>
          e.audioId === audioId &&
          (this.phase !== "listening" || this.entries.indexOf(e) <= this.listenIndex),
      );
    return false;
  }
  view(id) {
    const me = this.player(id),
      mode = this.settings.mode;
    const v = {
      code: this.code,
      you: id,
      host: this.host,
      phase: this.phase,
      phaseId: this.phaseId,
      serverNow: this.now(),
      deadline: this.deadline,
      settings: this.settings,
      players: this.players.map(
        ({ id, name, avatar, connected, ready, mic, spectator, score }) => ({
          id,
          name,
          avatar,
          connected,
          ready,
          mic,
          spectator,
          score,
        }),
      ),
      round: this.round || 0,
      totalRounds: this.totalRounds || 0,
      performers: this.performers(),
      reactions: this.reactions,
      replay: this.replay,
      autoplay: this.autoplay,
      participant: this.ids?.includes(id) || false,
      submitted: !!this.submissions?.[id],
      voted: !!this.ballots?.[id],
    };
    if (this.phase === "lobby") return v;
    v.completed = Object.keys(this.submissions || {});
    v.solved = Object.keys(this.solved || {});
    if (mode === "classic" || mode === "duo") {
      v.performerIds = this.performerIds;
      v.progress = this.progress?.[id];
      if (this.performerIds?.includes(id) && this.phase === "choose") {
        v.choices = this.choices.map(({ id, phrase, difficulty }) => ({ id, phrase, difficulty }));
        v.skips = this.skips;
      }
      if (this.performerIds?.includes(id) && ["prepare", "perform"].includes(this.phase))
        v.prompt =
          mode === "duo"
            ? this.prompt.components[this.performerIds.indexOf(id)].join(" / ")
            : this.prompt.phrase;
      if (this.phase === "perform")
        v.hint =
          this.prompt.hints[
            Math.min(1, Math.floor((this.now() - this.started) / (20000 * this.scale)))
          ];
      if (this.phase === "roundReveal") {
        v.answer = this.answer;
        v.awarded = this.solved;
      }
    }
    if (mode === "gartic") {
      v.contributionRound = this.contributionRound;
      v.chainRounds = this.chainRounds;
      if (["record", "interpret"].includes(this.phase)) v.task = this.task(id);
      if (this.phase === "seed" && this.ids.includes(id)) v.seed = this.chains[id].entries[0].text;
      if (this.phase === "chainReveal") {
        const chain = this.chains[this.ids[this.revealChain]];
        v.chain = {
          ...chain,
          entries: chain.entries.slice(0, this.revealStep + 1),
          total: chain.entries.length,
        };
        v.revealChain = this.revealChain;
        v.chainCount = this.ids.length;
        v.revealStep = this.revealStep;
      }
    }
    if (mode === "detective") {
      if (this.ids.includes(id) && ["prepare", "perform", "vote"].includes(this.phase)) {
        v.outsider = id === this.outsider;
        v.prompt = v.outsider ? null : this.prompt.phrase;
      }
      if (this.phase === "perform") v.speakerIndex = this.speakerIndex;
      if (this.phase === "outsider") {
        v.outsider = id === this.outsider;
        v.voteCounts = this.voteResult.counts;
      }
      if (this.phase === "roundReveal") {
        v.answer = this.answer;
        v.voteResult = this.voteResult;
        v.outsiderGuess = this.outsiderGuess;
      }
    }
    if (["foley", "ranking"].includes(mode)) {
      if (mode === "foley") v.animation = this.animation;
      if (mode === "ranking" && this.ids.includes(id) && this.phase === "record")
        v.prompt = this.prompt.phrase;
      if (["listening", "vote"].includes(this.phase))
        v.entries = this.entries
          .slice(0, this.phase === "listening" ? this.listenIndex + 1 : undefined)
          .map(({ id: entryId, audioId, label, author }) => ({
            id: entryId,
            audioId,
            label,
            own: author === id,
          }));
      if (this.phase === "listening") v.listenIndex = this.listenIndex;
      if (this.phase === "roundReveal") {
        v.voteResult = this.voteResult;
        v.answer = mode === "ranking" ? this.prompt.phrase : null;
      }
    }
    return v;
  }
}
