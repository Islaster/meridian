// A plan is the outline of a place with the places inside it drawn as boxes —
// what the map shows. Levels nest the way places do: a city's plan holds its
// districts (or, in a town too small for districts, its streets), a district's
// plan holds its streets, a hall's plan holds its rooms. Being "in" a box means
// the plan it belongs to is the level you're standing on.

export type Box = [x: number, y: number, w: number, h: number]; // in plan units
export interface Plan {
  size: [w: number, h: number];
  boxes: Record<string, Box>; // id → where it sits
  door?: Box; // a dungeon's way out, drawn here
}
export interface Level {
  id: string; // the thing that owns the plan: a city, a district, a building
  name: string;
  plan: Plan;
}

const levels = new Map<string, Level>(); // owner id → level
const within = new Map<string, string>(); // box id → the level it's drawn on

export const Plans = {
  add(owner: { id: string; name: string }, plan: Plan) {
    levels.set(owner.id, { id: owner.id, name: owner.name, plan });
    for (const id of Object.keys(plan.boxes)) within.set(id, owner.id);
  },
  of: (ownerId: string) => levels.get(ownerId),
  // the level a place is drawn on: its own plan if it has one, else the plan it's a box in
  levelOf: (placeId: string) =>
    levels.get(placeId) ?? levels.get(within.get(placeId) ?? ""),
  // the level a level is drawn on — a district's city, a hall's street
  up: (levelId: string) => levels.get(within.get(levelId) ?? ""),
  // from the top down to this level: city › district › hall
  path(levelId: string): Level[] {
    const out: Level[] = [];
    for (let lv = levels.get(levelId); lv; lv = Plans.up(lv.id))
      out.unshift(lv);
    return out;
  },
  all: () => [...levels.values()],
};
