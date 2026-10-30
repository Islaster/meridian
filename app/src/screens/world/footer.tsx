import type { Town } from "./usetown";
import { ptr } from "../../shared/styles";
import { allowed } from "../../systems/tutorial";

export default function Footer({ t }: { t: Town }) {
  const { state } = t;
  const link = { cursor: "pointer", marginLeft: 16 };
  const restOk = allowed(state, { kind: "rest" });
  const waitOk = allowed(state, { kind: "wait" });
  return (
    <>
      <button
        style={{ ...ptr, opacity: waitOk ? 1 : 0.4 }}
        disabled={!waitOk}
        onClick={t.wait}
      >
        Wait an hour
      </button>
      {t.loc.canRest && (
        <button
          style={{ ...ptr, opacity: restOk ? 1 : 0.4 }}
          disabled={!restOk}
          onClick={t.rest}
        >
          Sleep until morning
        </button>
      )}
      <div style={{ opacity: 0.45 }}>
        ✦ main · ◇ side · ⚔ bounty · ⚑ mission
      </div>
      <span style={link} onClick={() => t.setMenu("inventory")}>
        [ menu ]
      </span>
    </>
  );
}
