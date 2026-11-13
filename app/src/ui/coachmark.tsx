import { useLayoutEffect, useState } from "react";
import { ptr, para, label } from "./styles";

const PAD = 6;

// A tutorial step: the darkness is the spotlight's shadow, and the words sit beside what they're about.
export default function Coachmark({
  title,
  text,
  target,
  onDone,
}: {
  title: string;
  text: string;
  target?: string; // a selector; nothing = just the words, centered
  onDone: () => void;
}) {
  const [box, setBox] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    let shown = false;
    const find = () => {
      const el = target ? document.querySelector<HTMLElement>(target) : null;
      if (el && !shown) {
        shown = true;
        el.scrollIntoView({ block: "center", behavior: "smooth" }); // bring the step to the eye, not the eye to the step
      }
      setBox(el ? el.getBoundingClientRect() : null);
    };
    find();
    window.addEventListener("resize", find);
    window.addEventListener("scroll", find, true); // any scroller, the menu's included
    const id = window.setInterval(find, 250); // the page re-lays out after state changes; keep up
    return () => {
      window.removeEventListener("resize", find);
      window.removeEventListener("scroll", find, true);
      window.clearInterval(id);
    };
  }, [target]);

  const below = box ? box.bottom + 220 < window.innerHeight : true;
  return (
    <>
      <div
        style={
          box
            ? {
                position: "fixed",
                zIndex: 60,
                pointerEvents: "none",
                left: box.left - PAD,
                top: box.top - PAD,
                width: box.width + PAD * 2,
                height: box.height + PAD * 2,
                border: "2px solid rgba(255,255,255,0.92)",
                borderRadius: 4,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
              }
            : {
                position: "fixed",
                inset: 0,
                zIndex: 60,
                pointerEvents: "none",
                background: "rgba(0,0,0,0.78)",
              }
        }
      />
      <div
        style={{
          position: "fixed",
          zIndex: 61,
          maxWidth: 440,
          padding: 18,
          gap: 12,
          display: "flex",
          flexDirection: "column",
          background: "#000",
          border: "1px solid rgba(233,236,242,0.28)",
          ...(box
            ? below
              ? { left: box.left, top: box.bottom + PAD + 12 }
              : {
                  left: box.left,
                  bottom: window.innerHeight - box.top + PAD + 12,
                }
            : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }),
        }}
      >
        <div style={label}>{title}</div>
        <p style={para}>{text}</p>
        <button style={{ ...ptr, alignSelf: "flex-start" }} onClick={onDone}>
          Got it
        </button>
      </div>
    </>
  );
}
