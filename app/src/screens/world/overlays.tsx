import type { World } from "./useworld";
import Coachmark from "@/ui/coachmark";
import { para, ptr, dialog } from "@/ui/styles";

// What floats over the scene: a confirm, and the tutorial's spotlight.
export default function Overlays({ w }: { w: World }) {
  const { confirm, setConfirm, tutorial } = w;
  return (
    <>
      {confirm && (
        <div style={{ ...dialog, background: "rgba(0,0,0,0.92)" }}>
          <div
            style={{
              maxWidth: 520,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <p style={para}>{confirm.text}</p>
            <button style={ptr} onClick={confirm.go}>
              Swear anyway
            </button>
            <button style={ptr} onClick={() => setConfirm(null)}>
              Not now
            </button>
          </div>
        </div>
      )}
      {tutorial && (
        <Coachmark
          title={tutorial.tutorial.title}
          text={tutorial.step.text}
          target={tutorial.step.target}
          onDone={w.dismissTutorial}
        />
      )}
    </>
  );
}
