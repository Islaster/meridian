import { chip } from "./styles";

// A row of choices, one lit.
export default function Tabs<T extends string>({
  tabs,
  value,
  onPick,
  names,
  gap = 24,
  tut,
}: {
  tabs: readonly T[];
  value: T;
  onPick: (t: NoInfer<T>) => void; // T comes from tabs and value, never from the handler
  names?: Partial<Record<T, string>>;
  gap?: number;
  tut?: string; // a data-tut key for the tutorial's spotlight
}) {
  return (
    <div style={{ display: "flex", gap }} data-tut={tut}>
      {tabs.map((t) => (
        <span key={t} style={chip(value === t)} onClick={() => onPick(t)}>
          {names?.[t] ?? t}
        </span>
      ))}
    </div>
  );
}
