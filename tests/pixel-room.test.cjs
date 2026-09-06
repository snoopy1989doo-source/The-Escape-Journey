const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

function createRoom(stage = 1) {
  const context = new Proxy({}, { get: (target, key) => target[key] ?? (() => {}) });
  const reduced = { matches: false };
  const status = { textContent: '' };
  const sandbox = {
    window: { matchMedia: () => reduced },
    document: {
      createElement: () => ({ getContext: () => context }),
      getElementById: () => status
    }
  };
  vm.runInNewContext(readFileSync(join(__dirname, '../assets/pixel-room.js'), 'utf8'), sandbox);
  const app = {
    currentStage: stage, ctx: context,
    npc: Object.fromEntries(['melo', 'kungfu', 'oleang'].map(name => [name, { manualAction: null, manualTimer: 0 }])),
    sound: { playBlip() {} }, showSpeechBubble() {},
    interactMelo() { this.npc.melo.manualAction = 'cheer'; this.npc.melo.manualTimer = 160; },
    petKungfu() { this.npc.kungfu.manualAction = 'happy'; this.npc.kungfu.manualTimer = 190; },
    petOleang() { this.npc.oleang.manualAction = 'happy'; this.npc.oleang.manualTimer = 190; }
  };
  return { room: new sandbox.window.PixelRoom(app), app, reduced, status };
}

// Input can precede the first animation frame or immediately follow a stage switch.
{
  const { room, app } = createRoom();
  room.interact(364, 234);
  assert.equal(app.npc.melo.manualAction, 'cheer');
  assert.equal(app.npc.melo.x, 364);
  room.render(0);
  assert.equal(room.actors[0].action, 'happy');
  app.currentStage = 4;
  room.interact(500, 444);
  assert.equal(room.stage, 4);
  assert.equal(app.npc.oleang.manualAction, 'happy');
  assert.equal(app.npc.oleang.x, 500);
  assert.equal(app.npc.melo.manualAction, null);
}

// Pet buttons used before the first frame must retain their feedback.
{
  const { room, app } = createRoom();
  app.petKungfu();
  room.render(0);
  assert.equal(room.actors[1].action, 'happy');
}

for (let stage = 1; stage <= 4; stage++) {
  // Compare elapsed-time simulation on low and high refresh-rate devices.
  const slow = createRoom(stage).room;
  const fast = createRoom(stage).room;
  slow.render(0); fast.render(0);
  for (let frame = 0; frame < 1800; frame++) slow.update(1 / 30);
  for (let frame = 0; frame < 7200; frame++) fast.update(1 / 120);
  slow.actors.forEach((actor, index) => {
    assert.ok(Math.hypot(actor.x - fast.actors[index].x, actor.y - fast.actors[index].y) < 0.01, `stage ${stage}: refresh-rate independent ${actor.name}`);
  });

  // Foot positions must stay on the walkable floor and outside furniture/plots.
  const room = createRoom(stage).room;
  room.render(0);
  const obstacles = stage === 4
    ? [[37, 62, 186, 168], [249, 126, 322, 166], [39, 209, 124, 246], [239, 183, 343, 203]]
    : [[32, 122, 89, 186], [144, 143, 218, 172], [285, 101, 326, 120], [280, 181, 300, 195]];
  for (let frame = 0; frame < 7200; frame++) {
    const previous = room.actors.map(a => ({ x: a.x, y: a.y }));
    room.update(1 / 60);
    room.actors.forEach((actor, index) => {
      assert.ok(Math.hypot(actor.x - previous[index].x, actor.y - previous[index].y) <= 19 / 60 + 1e-8, `stage ${stage}: no teleport`);
      assert.ok(actor.x >= 18 && actor.x <= 342 && actor.y >= 115 && actor.y <= 249);
      for (const [left, top, right, bottom] of obstacles) {
        assert.ok(!(actor.x > left && actor.x < right && actor.y > top && actor.y < bottom), `stage ${stage}: ${actor.name} intersects obstacle`);
      }
    });
  }
}

// Toggling reduced motion mid-walk freezes the scene without a false work pose.
{
  const { room, reduced } = createRoom();
  room.render(0);
  for (let frame = 0; frame < 630; frame++) room.update(1 / 60);
  assert.equal(room.actors[0].action, 'walk');
  reduced.matches = true;
  const positions = room.actors.map(a => [a.x, a.y]);
  const time = room.time;
  for (let frame = 0; frame < 120; frame++) room.render(1 / 60);
  room.actors.forEach((a, index) => assert.deepEqual([a.x, a.y], positions[index]));
  assert.equal(room.time, time);
  assert.equal(room.actors[0].action, 'idle');
  reduced.matches = false;
  room.render(1 / 60);
  assert.equal(room.actors[0].action, 'walk');
}

// A resumed or malformed frame cannot teleport actors or poison coordinates.
{
  const { room } = createRoom();
  room.render(0);
  room.actors[0].wait = 0;
  const x = room.actors[0].x;
  room.render(60);
  assert.ok(room.actors[0].x - x <= 0.95 + 1e-8);
  for (const dt of [undefined, NaN, -1]) room.render(dt);
  assert.ok(Number.isFinite(room.actors[0].x));
}

// The workstation covers an actor behind it; an actor in front covers furniture.
{
  const { room } = createRoom(3);
  const order = [];
  for (const name of ['human', 'desk', 'bed']) room[name] = () => order.push(name);
  room.render(0);
  assert.ok(order.indexOf('human') < order.indexOf('desk'));
  order.length = 0;
  room.actors[0].y = 200;
  room.render(0);
  assert.ok(order.indexOf('human') > order.indexOf('desk'));
  assert.ok(order.indexOf('human') > order.indexOf('bed'));
}

console.log('PixelRoom: first-click input, 4-stage routes, frame rates, reduced motion, delta limits and depth order passed.');
