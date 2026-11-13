// The rewrite's mechanical half: moves, deletions and text surgery that would be
// tedious and error-prone by hand. Run from the project root, one batch at a time:
//
//   node scripts/rewrite.mjs 1
//
// Every step prints what it did. Re-running a batch is safe: a file already moved
// or deleted is skipped, a replacement already made changes nothing.
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("src");
const batch = process.argv[2];

// ── helpers ───────────────────────────────────────────────────────────────
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : /\.tsx?$/.test(e.name) ? [p] : [];
  });
const rm = (rel) => {
  const p = path.resolve(rel);
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true });
  console.log("deleted ", rel);
};
const mv = (from, to) => {
  const a = path.resolve(from),
    b = path.resolve(to);
  if (!fs.existsSync(a)) return;
  fs.mkdirSync(path.dirname(b), { recursive: true });
  fs.renameSync(a, b);
  console.log("moved   ", from, "→", to);
};
// replace in one file; `from` may be a string or a RegExp with the g flag
const sub = (rel, from, to) => {
  const p = path.resolve(rel);
  if (!fs.existsSync(p)) return;
  const was = fs.readFileSync(p, "utf8");
  const now = was.replace(from, to);
  if (now !== was) {
    fs.writeFileSync(p, now);
    console.log("edited  ", rel);
  }
};
// the same replacement over every source file
const subAll = (from, to, label) => {
  let n = 0;
  for (const p of walk(SRC)) {
    const was = fs.readFileSync(p, "utf8");
    const now = was.replace(from, to);
    if (now !== was) {
      fs.writeFileSync(p, now);
      n++;
    }
  }
  if (n) console.log(`edited   ${n} files · ${label}`);
};

// ── batch 1 · cleanup and foundations ─────────────────────────────────────
const batch1 = () => {
  // dead code and the half-applied master pipeline
  for (const f of [
    "src/App.css",
    "src/systems/security.ts",
    "src/systems/property.ts",
    "src/models/registry.ts",
    "src/data/monsters/masters.ts",
    "src/data/monsters/sword-yard.ts",
    "src/data/quests/meridian-coast/caldermouth/masters/line.ts",
    "src/data/quests/meridian-coast/caldermouth/masters/ira-vell-trial.ts",
    "src/data/quests/meridian-coast/caldermouth/masters/tobin-ashe.ts",
    "src/data/quests/meridian-coast/caldermouth/masters/hesper-quill.ts",
    // replaced under new names by the files in batches 2–4
    "src/ui/cards.tsx",
    "src/systems/types.ts",
    "src/state/context.ts",
    "src/state/gamecontext.tsx",
    "src/screens/world/usetown.ts",
    "src/screens/world/questcomplete.tsx",
    "src/screens/menu/playerMenu.tsx",
    "src/screens/menu/levelUp.tsx",
  ])
    rm(f);

  // lowercase names, and three files that were living in the wrong place
  mv("src/App.tsx", "src/app.tsx");
  mv("src/state/newGameState.ts", "src/state/newgame.ts");
  mv("src/systems/seed.ts", "src/lib/seed.ts");
  mv("src/models/metal.ts", "src/data/items/metals.ts");
  mv(
    "src/data/classes/phantasm/Somnomancer.ts",
    "src/data/classes/phantasm/somnomancer.ts"
  );
  mv("src/screens/opening/pixelCycle.ts", "src/screens/opening/pixelcycle.ts");

  // the imports those moves broke
  sub("src/main.tsx", './App.tsx"', './app.tsx"');
  sub("src/state/gamecontext.tsx", '"./newGameState"', '"./newgame"');
  sub(
    "src/screens/character-creation/creation.tsx",
    "state/newGameState",
    "state/newgame"
  );
  sub("src/systems/presence.ts", '"./seed"', '"@/lib/seed"');
  sub("src/systems/gather.ts", '"./seed"', '"@/lib/seed"');
  sub("src/data/items/forge.ts", /["'][./]*models\/metal["']/, '"./metals"');
  sub("src/data/classes/phantasm/index.ts", "./Somnomancer", "./somnomancer");
  subAll(
    /["']\.\/pixelCycle["']/g,
    '"./pixelcycle"',
    "pixelCycle → pixelcycle"
  );

  // every relative import into a top-level folder becomes an alias import
  subAll(
    /from "(?:\.\.\/)+(models|systems|data|state|ui|lib|screens|assets)(\/[^"]*)?"/g,
    'from "@/$1$2"',
    "relative imports → @/"
  );
  subAll(
    /^import "(?:\.\.\/)+(data|models|systems)(\/[^"]*)?";/gm,
    'import "@/$1$2";',
    "side-effect imports → @/"
  );
  // inside data/, a sibling folder reached by ../ is still data
  subAll(
    /from "(?:\.\.\/)+(money|items|world|quests|classes|skills|monsters)(\/[^"]*)?"/g,
    'from "@/data/$1$2"',
    "data-internal imports → @/data/"
  );

  // self-registering data doesn't need a name: the registry is the handle
  subAll(
    /^export const \w+ = (new (?:Item|Weapon|Armor|Consumable|Throwable|Material|Tool|QuestItem|PlayerClass|Skill|Monster|Dungeon|Location|Npc|City|Quest)\()/gm,
    "$1",
    "export const x = new … → new …"
  );
  // HMR accept lines: the registry tolerates a re-register under HMR, so they did nothing; data edits are a reload anyway
  subAll(
    /\n*^\s*if \(import\.meta\.hot\) import\.meta\.hot\.accept\(\);\s*$\n?/gm,
    "\n",
    "HMR accept lines"
  );

  // fields nothing reads
  sub("src/state/newgame.ts", /^\s*town: "caldermouth",\n/m, "");
  sub("src/state/newgame.ts", /^\s*region: "meridian-coast",\n/m, "");
  sub("src/data/world/locations/caldermouth.ts", /^\s*upgrades: \[\],\n/m, "");
  sub("src/data/items/materials.ts", /^new Material\("ash-glass".*\n/m, "");
  // the kiln road's roam named a monster that doesn't exist (the night fight would have crashed)
  sub(
    "src/data/world/locations/caldermouth.ts",
    '"grey-alpha"',
    '"wolf-alpha"'
  );
  // the typeface moves to ui/theme; the opening's cards move home
  sub("src/ui/skipbutton.tsx", 'from "./cards"', 'from "./theme"');
  sub("src/ui/ledgerline.tsx", 'from "./cards"', 'from "./theme"');
  sub(
    "src/screens/opening/opening.tsx",
    'import { IntertitleCard, TitleOverlay, SERIF } from "@/ui/cards";',
    'import { IntertitleCard, TitleOverlay } from "./cards";\nimport { SERIF } from "@/ui/theme";'
  );
  // Weapon.scaling was never read by combat; the same rule as a perk is
  sub(
    "src/data/items/weapons.ts",
    /scaling: \{ (stat: "\w+", per: [\d.]+, from: \d+) \}/g,
    'perks: [{ kind: "scaling", $1 }]'
  );
  // the ash wisp belonged to a trial nothing runs
  sub(
    "src/data/monsters/kiln-road.ts",
    /\n*new Monster\(\n  "ash-wisp"[\s\S]*?\n\);\n/,
    "\n"
  );
  // the tutorial reads the bag and the hands the new way
  if (
    !fs
      .readFileSync(path.resolve("src/data/tutorial.ts"), "utf8")
      .includes("@/systems/inventory")
  )
    sub(
      "src/data/tutorial.ts",
      'import { firstOath } from "@/systems/classes";',
      'import { firstOath } from "@/systems/classes";\nimport { carried } from "@/systems/inventory";\nimport { isGear } from "@/models/item";'
    );
  sub(
    "src/data/tutorial.ts",
    "when: (s) => (s.bag.equipment ?? []).length > 0,",
    "when: (s) => carried(s.bag).some(({ item }) => isGear(item)),"
  );
  sub(
    "src/data/tutorial.ts",
    "done: (s) => !!s.player.equipment?.mainWeapon,",
    "done: (s) => !!s.player.equipment.weapon,"
  );
  // practice no longer counts sessions toward a master's notice; it's proficiency only
  sub(
    "src/data/world/locations/caldermouth.ts",
    /practice\("([a-z-]+)", \d+\)/g,
    'practice("$1")'
  );
  sub(
    "src/data/world/locations/caldermouth.ts",
    "Days are 0–6 from the first day of the week. Oaths open at OATH_LEVEL for these grades.",
    "Days are 0–6 from the first day of the week. Each name they teach opens at its own level — the class says which."
  );
};

const BATCHES = { 1: batch1 };
const run = BATCHES[batch];
if (!run) {
  console.error(
    `usage: node scripts/rewrite.mjs <${Object.keys(BATCHES).join("|")}>`
  );
  process.exit(1);
}
run();
console.log(`batch ${batch} done`);
