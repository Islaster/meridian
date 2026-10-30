import { useLayoutEffect, useState } from "react";
import { ptr, para, label } from "./styles";

const PAD = 6;

export default function Coachmark({
  title,
  text,
  target,
  showText,
  onDone,
}: {
  title: string;
  text: string;
  target?: string;
  showText: boolean;
  onDone: () => void;
}) {
  const [box, setBox] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    const find = () => {
      const el = target ? document.querySelector<HTMLElement>(target) : null;
      setBox(el ? el.getBoundingClientRect() : null);
    };
    find();
    window.addEventListener("resize", find);
    const id = window.setInterval(find, 250); // the page re-lays out after state changes; keep up
    return () => {
      window.removeEventListener("resize", find);
      window.clearInterval(id);
    };
  }, [target]);

  const below = box ? box.bottom + 220 < window.innerHeight : true;
  return (
    <>
      {box ? (
        <div
          style={{
            position: "fixed",
            zIndex: 60,
            pointerEvents: "none",
            left: box.left - PAD,
            top: box.top - PAD,
            width: box.width + PAD * 2,
            height: box.height + PAD * 2,
            border: "2px solid rgba(255,255,255,0.92)",
            borderRadius: 4,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)", // the darkness is the box's shadow — everything outside it
          }}
        />
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            pointerEvents: "none",
            background: "rgba(0,0,0,0.78)",
          }}
        />
      )}
      {showText && (
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
              : {
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }),
          }}
        >
          <div style={label}>{title}</div>
          <p style={{ ...para, margin: 0 }}>{text}</p>
          <button style={{ ...ptr, alignSelf: "flex-start" }} onClick={onDone}>
            Got it
          </button>
        </div>
      )}
    </>
  );
}
