// node scripts/move.mjs <1-5|all>   — run from app/, commit first
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const Q = "src/data/quests/meridian-coast/caldermouth";
const BATCHES = {
  1: [
    ["src/game/world", "src/screens/world"],
    ["src/game/battle", "src/screens/battle"],
    ["src/game/dungeon", "src/screens/dungeon"],
    ["src/game/shop", "src/screens/shop"],
    ["src/game/menu", "src/screens/menu"],
    ["src/game/guild/board.tsx", "src/screens/board/index.tsx"],
    ["src/game/forge.tsx", "src/screens/forge/index.tsx"],
    ["src/game/death.tsx", "src/screens/death.tsx"],
    ["src/game/entrance.tsx", "src/screens/entrance.tsx"],
    ["src/landing/cards.tsx", "src/ui/cards.tsx"],
    ["src/landing", "src/screens/opening"],
    ["src/main-menu/mainmenu.tsx", "src/screens/main-menu/index.tsx"],
    ["src/character-creation", "src/screens/character-creation"],
  ],
  2: [
    ["src/shared", "src/ui"],
    ["src/state/toasts.tsx", "src/ui/toasts.tsx"],
    ["src/state/trackprompt.tsx", "src/ui/trackprompt.tsx"],
  ],
  3: [["src/data/models", "src/models"]],
  4: [
    ["src/data/cities", "src/data/world/cities"],
    ["src/data/locations", "src/data/world/locations"],
    [
      "src/data/dungeons/cold-kilns.ts",
      "src/data/world/dungeons/kilns-cold.ts",
    ],
    ["src/data/dungeons/index.ts", "src/data/world/dungeons/index.ts"],
    ["src/data/land", "src/data/world/land"],
    ["src/data/portals.ts", "src/data/world/portals.ts"],
    ["src/data/time/calendar.ts", "src/data/world/calendar.ts"],
  ],
  5: [
    [`${Q}/gull-and-lamp.ts`, `${Q}/main/01-gull-and-lamp.ts`],
    [`${Q}/guild-hall.ts`, `${Q}/main/02-guild-hall.ts`],
    [`${Q}/harbor-caves.ts`, `${Q}/main/03-harbor-caves.ts`],
    [`${Q}/masters.ts`, `${Q}/masters/a-masters-word.ts`],
    [`${Q}/sword-yard.ts`, `${Q}/masters/ira-vell.ts`],
    [`${Q}/sword-yard-trial.ts`, `${Q}/masters/ira-vell-trial.ts`],
    ...[
      "maud-kestrel",
      "tobin-ashe",
      "hesper-quill",
      "orrin-vey",
      "dessa-marl",
    ].map((n) => [`${Q}/${n}.ts`, `${Q}/masters/${n}.ts`]),
    [`${Q}/board.ts`, `${Q}/postings/board.ts`],
    ...[
      "breakwater",
      "hall-cellar",
      "halls-door",
      "halls-yard",
      "harbor-row",
      "town-gate",
    ].map((n) => [`${Q}/${n}.ts`, `${Q}/side/${n}.ts`]),
  ],
};

const arg = process.argv[2];
const moves = arg === "all" ? Object.values(BATCHES).flat() : BATCHES[arg];
if (!moves) {
  console.error("usage: node scripts/move.mjs <1-5|all>");
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const before = new Set([...walk("src"), ...walk("scripts")]); // every file at its old path

// expand folder moves into file moves; an earlier move's claim on a file wins
const map = new Map(); // old path -> new path
for (const [from, to] of moves) {
  if (existsSync(from) && statSync(from).isDirectory()) {
    for (const f of walk(from))
      if (!map.has(f)) map.set(f, join(to, relative(from, f)));
  } else if (before.has(from)) map.set(from, to);
  else console.warn(`skip (not found): ${from}`);
}

for (const [from, to] of map) {
  mkdirSync(dirname(to), { recursive: true });
  try {
    execFileSync("git", ["mv", from, to], { stdio: "ignore" });
  } catch {
    renameSync(from, to);
  }
}
const prune = (dir) => {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) prune(p);
  }
  if (readdirSync(dir).length === 0) rmdirSync(dir);
};
prune("src");

// rewrite relative imports: resolve each specifier from the importer's OLD folder, re-point it from the NEW one
const newOf = (old) => map.get(old) ?? old;
const SPEC = /((?:\bfrom|\bimport)\s*\(?\s*)(["'])(\.\.?\/[^"']+)\2/g;
for (const old of before) {
  if (!/\.(ts|tsx|mjs)$/.test(old)) continue;
  const now = newOf(old);
  const src = readFileSync(now, "utf8");
  const out = src.replace(SPEC, (m, head, q, spec) => {
    const base = resolve(dirname(old), spec);
    const hit = [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      `${base}/index.ts`,
      `${base}/index.tsx`,
    ]
      .map((c) => relative(process.cwd(), c))
      .find((c) => before.has(c));
    if (!hit) return m; // not one of our files; leave it
    let target = newOf(hit);
    if (!/\.tsx?$/.test(spec))
      target = target.replace(/\/index\.tsx?$/, "").replace(/\.tsx?$/, "");
    let rel = relative(dirname(now), target);
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `${head}${q}${rel}${q}`;
  });
  if (out !== src) writeFileSync(now, out);
}
console.log(`moved ${map.size} files — now: npm run check`);
