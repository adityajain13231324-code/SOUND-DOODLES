import test from "node:test";
import assert from "node:assert/strict";
import { Room, routing, rankingScores } from "../server/game.js";
import { prompts, matchPrompt } from "../server/prompts.js";

function fixture(mode = "classic", n = 4) {
  let clock = 100000;
  const room = new Room("ABCDEF", { now: () => clock });
  const players = Array.from({ length: n }, (_, i) =>
    room.add({ name: `Player ${i}` }),
  );
  room.settings = { ...room.settings, mode, rounds: 1 };
  players.forEach((p) => {
    p.ready = true;
    p.mic = true;
  });
  const send = (id, event, data = {}) =>
    room.dispatch(id, event, { phaseId: room.phaseId, ...data });
  const expire = () => {
    clock = room.deadline + 1;
    room.tick();
  };
  return { room, players, send, expire, later: (ms) => (clock += ms) };
}
function submitRecordings(f) {
  for (const id of f.room.ids) {
    const audioId = f.room.storeAudio(
      id,
      Buffer.alloc(200, 1),
      "audio/webm",
      1,
      f.room.phaseId,
    );
    f.send(id, "submit", { audioId });
  }
  if (f.room.phase === "handoff") f.expire();
}
test("curated library has 150+ unique prompts and complete metadata", () => {
  assert.ok(prompts.length >= 150);
  assert.equal(new Set(prompts.map((p) => p.id)).size, prompts.length);
  assert.equal(new Set(prompts.map((p) => p.phrase)).size, prompts.length);
  for (const p of prompts) {
    assert.ok(p.aliases.length && p.hints.length === 2 && p.modes.length);
    assert.ok(["easy", "hard"].includes(p.difficulty));
  }
});
test("matching normalizes, conservatively tolerates typos and accumulates components", () => {
  const kettle = prompts.find((p) => p.phrase === "Kettle");
  assert.ok(matchPrompt(kettle, "THE kettle!!").correct);
  assert.ok(matchPrompt(kettle, "ketle").correct);
  assert.equal(matchPrompt(kettle, "cat").correct, false);
  const robot = prompts.find((p) => p.phrase === "Robot with hiccups");
  const first = matchPrompt(robot, "robot");
  assert.equal(first.correct, false);
  assert.deepEqual(first.components, [0]);
  assert.ok(matchPrompt(robot, "hiccups", first.components).correct);
});
for (let n = 3; n <= 8; n++)
  test(`Gartic routing: ${n} players, balanced, no self-handoff, stable ancestry`, () => {
    const ids = Array.from({ length: n }, (_, i) => `p${i}`),
      schedule = routing(ids, n);
    assert.deepEqual(new Set(Object.keys(schedule[0])), new Set(ids));
    for (const id of ids) {
      assert.equal(schedule[0][id], id);
      assert.equal(new Set(schedule.map((s) => s[id])).size, n);
    }
    for (let round = 0; round < n; round++) {
      assert.equal(new Set(Object.values(schedule[round])).size, n);
      if (round)
        for (const id of ids)
          assert.notEqual(schedule[round][id], schedule[round - 1][id]);
    }
  });
test("minimum players, readiness, mic requirements and role permissions", () => {
  const f = fixture("duo", 3);
  assert.throws(() => f.room.start(), /4 players/);
  f.room.add({ name: "fourth" });
  assert.throws(() => f.room.start(), /ready/);
  const g = fixture();
  assert.throws(() => g.send(g.players[1].id, "start"), /host/);
  g.players[0].mic = false;
  g.room.start();
  assert.ok(!g.room.performerIds.includes(g.players[0].id));
});
test("classic completes, hides choices, keeps matching private and prevents duplicate points", () => {
  const f = fixture();
  f.room.start();
  let rounds = 0;
  while (f.room.phase !== "results") {
    const performer = f.room.performerIds[0];
    assert.equal(f.room.view(f.room.eligible[0]).choices, undefined);
    f.send(performer, "pick", { promptId: f.room.choices[0].id });
    assert.equal(f.room.view(f.room.eligible[0]).prompt, undefined);
    f.expire();
    for (const id of f.room.eligible) {
      f.send(id, "guess", { text: f.room.prompt.phrase });
      const score = f.room.player(id).score;
      if (f.room.phase === "perform") {
        f.later(1000);
        f.send(id, "guess", { text: f.room.prompt.phrase });
        assert.equal(f.room.player(id).score, score);
      }
    }
    assert.equal(f.room.phase, "roundReveal");
    assert.equal(f.room.player(performer).score >= 200, true);
    f.send(f.room.host, "next");
    rounds++;
  }
  assert.equal(rounds, 4);
});
test("unauthorized, stale, oversized and out-of-phase events are rejected", () => {
  const f = fixture();
  f.room.start();
  assert.throws(
    () =>
      f.send(f.room.eligible[0], "pick", { promptId: f.room.choices[0].id }),
    /performer/,
  );
  assert.throws(() => f.send(f.room.host, "vote", { ranking: [] }), /closed/);
  assert.throws(
    () => f.room.dispatch(f.room.host, "pick", { phaseId: -1 }),
    /moved/,
  );
  assert.throws(
    () =>
      f.room.storeAudio(
        f.room.host,
        Buffer.alloc(200),
        "audio/webm",
        1,
        f.room.phaseId,
      ),
    /ended/,
  );
});
test("Duo reveals complementary private roles and scores a complete scene", () => {
  const f = fixture("duo");
  f.room.start();
  assert.notEqual(
    f.room.view(f.room.performerIds[0]).prompt,
    f.room.view(f.room.performerIds[1]).prompt,
  );
  assert.equal(f.room.view(f.room.eligible[0]).prompt, undefined);
  f.expire();
  for (const id of f.room.eligible)
    f.send(id, "guess", { text: f.room.prompt.phrase });
  assert.equal(f.room.phase, "roundReveal");
  for (const id of f.room.performerIds)
    assert.equal(f.room.player(id).score, 200);
  f.send(f.room.host, "next");
  assert.equal(f.room.phase, "results");
});
test("Gartic alternating authentic entries, privacy, passes, reveal and cleanup", () => {
  const f = fixture("gartic", 4);
  f.room.start();
  const originals = Object.fromEntries(
    Object.entries(f.room.chains).map(([id, c]) => [id, c.id]),
  );
  for (let round = 0; round < 4; round++) {
    assert.equal(f.room.phase, round % 2 ? "interpret" : "record");
    for (const id of f.room.ids) {
      const view = f.room.view(id);
      assert.equal(view.chain, undefined);
      assert.equal(view.chains, undefined);
      if (round === 0) {
        const key = f.room.storeAudio(
          id,
          Buffer.alloc(200, 1),
          "audio/webm",
          1,
          f.room.phaseId,
        );
        assert.ok(f.room.canHear(id, key));
        const other = f.room.ids.find((x) => x !== id);
        assert.equal(f.room.canHear(other, key), false);
        f.send(id, "submit", { audioId: key });
      } else if (round % 2)
        f.send(id, "submit", {
          text: `Interpretation ${id.slice(0, 4)} round ${round}`,
        });
      else f.send(id, "pass");
    }
    f.expire();
  }
  assert.equal(f.room.phase, "chainReveal");
  for (const [owner, chain] of Object.entries(f.room.chains)) {
    assert.equal(chain.id, originals[owner]);
    assert.equal(chain.entries.length, 5);
    assert.equal(chain.entries[3].type, "missing");
    assert.equal(chain.entries.at(-1).type, "text");
    assert.equal(new Set(chain.entries.slice(1).map((e) => e.author)).size, 4);
  }
  while (f.room.phase === "chainReveal") {
    const v = f.room.view(f.room.host);
    assert.equal(v.chain.entries.length, f.room.revealStep + 1);
    f.send(f.room.host, "next");
  }
  assert.equal(f.room.phase, "results");
  f.send(f.room.host, "again");
  assert.equal(f.room.audio.size, 0);
  assert.equal(f.room.phase, "lobby");
});
test("three-player Gartic ends with genuine audio, no fabricated text", () => {
  const f = fixture("gartic", 3);
  f.room.start();
  submitRecordings(f);
  for (const id of f.room.ids)
    f.send(id, "submit", { text: "An actual guess" });
  f.expire();
  submitRecordings(f);
  assert.equal(f.room.phase, "chainReveal");
  for (const c of Object.values(f.room.chains))
    assert.equal(c.entries.at(-1).type, "audio");
});
test("custom starting phrases remain private and pass preserves suggested prompt", () => {
  const f = fixture("gartic", 3);
  f.room.settings.customPrompts = true;
  f.room.start();
  assert.equal(f.room.phase, "seed");
  const id = f.room.ids[0];
  f.send(id, "submit", { text: "Custom kettle" });
  for (const other of f.room.ids.slice(1)) f.send(other, "pass");
  f.expire();
  assert.equal(f.room.chains[id].entries[0].text, "Custom kettle");
  assert.equal(f.room.view(f.room.ids[1]).task.text.includes("Custom"), false);
});
test("Sound Detective outsider secrecy, private votes, tie and final guess", () => {
  const f = fixture("detective");
  f.room.start();
  assert.equal(f.room.view(f.room.outsider).prompt, null);
  const innocent = f.room.ids.find((id) => id !== f.room.outsider);
  assert.ok(f.room.view(innocent).prompt);
  f.expire();
  for (let i = 0; i < 4; i++) f.expire();
  assert.equal(f.room.phase, "vote");
  for (const id of f.room.ids) f.send(id, "vote", { target: null });
  assert.equal(f.room.phase, "outsider");
  f.send(f.room.outsider, "outsiderGuess", { text: f.room.prompt.phrase });
  assert.equal(f.room.phase, "roundReveal");
  assert.equal(f.room.voteResult.caught, false);
  assert.equal(f.room.voteResult.escaped, true);
  assert.equal(f.room.player(f.room.outsider).score, 200);
  f.send(f.room.host, "next");
  assert.equal(f.room.phase, "results");
});
for (const mode of ["foley", "ranking"])
  test(`${mode}: recording, anonymous playback, no self-voting, ballots and results`, () => {
    const f = fixture(mode);
    f.room.start();
    submitRecordings(f);
    assert.equal(f.room.phase, "listening");
    let first = f.room.view(f.room.host).entries[0];
    assert.equal(first.author, undefined);
    while (f.room.phase === "listening") f.send(f.room.host, "next");
    for (const id of f.room.ids) {
      const own = f.room.entries.find((e) => e.author === id);
      assert.throws(() => f.send(id, "vote", { ranking: [own.id] }), /own/);
      const ids = f.room.entries
        .filter((e) => e.author !== id)
        .map((e) => e.id);
      f.send(id, "vote", { ranking: mode === "foley" ? ids.slice(0, 1) : ids });
    }
    assert.equal(f.room.phase, "roundReveal");
    assert.ok(f.room.voteResult.every((e) => e.author));
    f.send(f.room.host, "next");
    assert.equal(f.room.phase, "results");
  });
test("ranking scores use normalized descending Borda points and missing ballots contribute zero", () => {
  const entries = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(rankingScores(entries, { p: ["b", "a"] }), {
    a: 0.5,
    b: 1,
    c: 0,
  });
});
test("host migration, late spectator and frozen eligible set", () => {
  const f = fixture();
  f.room.start();
  const eligible = [...f.room.eligible];
  f.room.disconnect(f.room.host);
  assert.notEqual(f.room.host, f.players[0].id);
  assert.deepEqual(f.room.eligible, eligible);
  const late = f.room.add({ name: "Late friend" });
  assert.equal(late.spectator, true);
  assert.equal(f.room.view(late.id).choices, undefined);
  assert.throws(() => f.send(late.id, "submit", { text: "no" }), /watching/);
});
test("no-submission timeouts advance every recording mode without fabricated audio", () => {
  for (const mode of ["gartic", "foley", "ranking"]) {
    const f = fixture(mode);
    f.room.start();
    for (
      let i = 0;
      i < 8 && !["chainReveal", "roundReveal"].includes(f.room.phase);
      i++
    )
      f.expire();
    assert.ok(["chainReveal", "roundReveal"].includes(f.room.phase));
    assert.equal(f.room.audio.size, 0);
  }
});
test("Gartic awards: optional, no self-votes, ties share a title, results carry winners", () => {
  const f = fixture("gartic", 3);
  f.room.settings = { ...f.room.settings, awards: true };
  f.room.start();
  submitRecordings(f);
  for (const id of f.room.ids)
    f.send(id, "submit", { text: "An actual guess" });
  f.expire();
  submitRecordings(f);
  while (f.room.phase === "chainReveal") f.send(f.room.host, "next");
  assert.equal(f.room.phase, "awards");
  const [a, b, c] = f.room.ids;
  const view = f.room.view(a);
  assert.equal(view.awardChains.length, 3);
  assert.equal(view.awards, undefined);
  const ownChain = view.awardChains.find((x) => x.own);
  const otherChain = view.awardChains.find((x) => !x.own);
  assert.throws(
    () => f.send(a, "award", { picks: { funniest: ownChain.id } }),
    /own chain/,
  );
  const ownSound = view.awardChains
    .flatMap((x) => x.entries)
    .find((e) => e.own && e.audioId);
  assert.throws(
    () => f.send(a, "award", { picks: { bestSound: ownSound.ref } }),
    /own sound/,
  );
  f.send(a, "award", { picks: { funniest: otherChain.id } });
  f.send(a, "award", { picks: { funniest: ownChain.id } }); // repeat is ignored, not an error
  f.send(b, "award", { picks: {} }); // abstaining is allowed
  assert.equal(f.room.phase, "awards");
  f.send(c, "award", {
    picks: { funniest: f.room.view(c).awardChains.find((x) => !x.own).id },
  });
  assert.equal(f.room.phase, "results");
  const funniest = f.room.view(a).awards.find((x) => x.key === "funniest");
  assert.ok(funniest.winners.length >= 1 && funniest.votes >= 1);
});
test("Gartic without awards goes straight to results", () => {
  const f = fixture("gartic", 3);
  f.room.start();
  submitRecordings(f);
  for (const id of f.room.ids)
    f.send(id, "submit", { text: "An actual guess" });
  f.expire();
  submitRecordings(f);
  while (f.room.phase === "chainReveal") f.send(f.room.host, "next");
  assert.equal(f.room.phase, "results");
});
