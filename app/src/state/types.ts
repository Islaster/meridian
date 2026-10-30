type Week =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
export type QuestStatus = "notTaken" | "offered" | "taken" | "complete";

export interface QuestProgress {
  status: QuestStatus;
  stage: string;
}
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
    rank: number;
    statPoints: number;
    skillPoints: number;
    skills: Record<string, number>;
    hp: number;
    maxHp: number;
    mp: number; // class pool — mana or ki; 0 until awakened
    maxMp: number;
    weary?: { stat: string; amount: number }; // last night's debt — restored at the next sleep
    proficiency: Record<string, number>; // by medium — sword, bow, tide, ember, smith, alchemy
    uses: Record<string, number>; // technique — skill id → times used; levels come from this
  };
  standing: Record<string, number>;
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
    room?: string;
    surveys: string[];
  };
  quests: Record<
    string,
    {
      status: "notTaken" | "taken" | "complete";
      tracked: boolean;
      day?: number;
    }
  >;
  done: string[];
  counters: Record<string, number>;
  notices: string[];
}
