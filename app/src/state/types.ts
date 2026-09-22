type Week =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface GameState {
  time: { day: Week; hour: number; block: "day" | "night"; dayId: number };
  player: {
    name: string;
    level: number;
    xp: number;
    stats: Record<string, number>;
    equipment?: {
      head?: string;
      armor?: string;
      boots?: string;
      ringOne?: string;
      ringTwo?: string;
      back?: string;
      mainWeapon?: string;
      altWeapon?: string;
      hands?: string;
    };
    class?: string;
    statPoints: number;
    skillPoints: number;
    skills: Record<string, number>; // skill id → level
  };
  bag: {
    gold: number;
    equipment: { name: string; qty: number }[];
    materials: { name: string; qty: number }[];
    consumables: { name: string; qty: number }[];
    questItems: { name: string; qty: number }[];
  };
  world: {
    area: string;
    region: string;
    town?: string;
    dungeon?: string;
    camp?: string;
  };
  quests: Record<string, number>;
  done: string[];
}
