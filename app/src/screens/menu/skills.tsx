import { useGame } from "@/state/game";
import { Skill } from "@/data/skills";
import { row, small, label } from "@/ui/styles";

// What you can do in a fight, and the points to raise it.
export default function Skills() {
  const { state, update } = useGame();
  const p = state.player;
  const raise = (k: string) =>
    update({
      ...state,
      player: {
        ...p,
        skillPoints: p.skillPoints - 1,
        skills: { ...p.skills, [k]: p.skills[k] + 1 },
      },
    });
  return (
    <>
      <div style={label}>
        <span data-tut="skills">
          Skills{p.skillPoints > 0 && ` · ${p.skillPoints} to spend`}
        </span>
      </div>
      {Object.keys(p.skills).length === 0 && (
        <div style={{ opacity: 0.5 }}>
          No skills yet. A master opens the first path.
        </div>
      )}
      {Object.entries(p.skills).map(([k, v]) => (
        <div key={k} style={row}>
          <span>
            {Skill.get(k).name}
            <span style={{ opacity: 0.5, fontSize: "0.85em" }}>
              {" "}
              · {Skill.get(k).describe}
            </span>
          </span>
          <span>
            {v}
            {p.skillPoints > 0 && (
              <button
                style={{ ...small, marginLeft: 12 }}
                onClick={() => raise(k)}
              >
                +
              </button>
            )}
          </span>
        </div>
      ))}
    </>
  );
}
