import type { Town } from "./usetown";
import { ptr } from "../../ui/styles";
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
          data-tut="rest"
        >
          Sleep until morning
        </button>
      )}
      <div style={{ opacity: 0.45 }} data-tut="key">
        ✦ main · ◇ side · ⚔ bounty · ⚑ mission
      </div>
      <span style={link} data-tut="menu" onClick={() => t.setMenu("inventory")}>
        [ menu ]
      </span>
    </>
  );
}
