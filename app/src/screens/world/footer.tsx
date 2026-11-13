import type { World } from "./useworld";
import { link } from "@/ui/styles";
import { allowed } from "@/systems/tutorial";

// The clock's two verbs and the menu, as words under the scene.
export default function Footer({ w }: { w: World }) {
  const { state, loc } = w;
  const verb = (ok: boolean, tut: string, text: string, go: () => void) => (
    <span
      data-tut={tut}
      style={{ ...link, opacity: ok ? 0.7 : 0.3 }}
      onClick={() => ok && go()}
    >
      [ {text} ]
    </span>
  );
  return (
    <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
      {verb(allowed(state, { kind: "wait" }), "wait", "wait an hour", w.wait)}
      {loc.canRest &&
        verb(
          allowed(state, { kind: "rest" }),
          "rest",
          "sleep until morning",
          w.rest
        )}
      {verb(true, "menu", "menu", () => w.play.setMenu("inventory"))}
      <span style={{ opacity: 0.4, marginLeft: "auto" }} data-tut="key">
        ✦ main · ◇ side · ⚔ bounty · ⚑ mission
      </span>
    </div>
  );
}
