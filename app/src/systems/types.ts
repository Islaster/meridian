export interface Note {
  text: string;
  kind: "story" | "reward" | "complete" | "levelup";
  id?: string;
  level?: number;
}
