import { Monster } from "../../../data/monsters";
export default function Battle({
  monsters,
  onWin,
  onFlee,
}: {
  monsters: string[];
  onWin: () => void;
  onFlee: () => void;
}) {
  return (
    <div
      style={{
        padding: 48,
        color: "#eee",
        background: "#000",
        minHeight: "100vh",
      }}
    >
      <p>{monsters.map((m) => Monster.get(m).name).join(", ")}</p>
      <button onClick={onWin}>win (stub)</button>{" "}
      <button onClick={onFlee}>flee (stub)</button>
    </div>
  );
}
