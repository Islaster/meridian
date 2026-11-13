// Intertitle card and title — DOM typography over the canvas, so text stays crisp.
import { forwardRef } from "react";
import { PALETTE, TITLE } from "./config";
import { SERIF } from "@/ui/theme";

export const IntertitleCard = forwardRef<HTMLDivElement, object>(
  function IntertitleCard(_props, ref) {
    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          pointerEvents: "none",
          background: "#000",
        }}
      >
        <div
          style={{
            maxWidth: "62%",
            padding: "clamp(16px, 3vw, 32px) clamp(24px, 4vw, 48px)",
            border: "1px solid rgba(233,236,242,0.32)",
            font: `400 clamp(15px, 2.1vw, 26px) ${SERIF}`,
            letterSpacing: "0.07em",
            lineHeight: 1.55,
            textAlign: "center",
            color: PALETTE.cardText,
          }}
        >
          <span data-text />
        </div>
      </div>
    );
  }
);

export const TitleOverlay = forwardRef<HTMLDivElement, object>(
  function TitleOverlay(_props, ref) {
    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "18%",
          textAlign: "center",
          opacity: 0,
          pointerEvents: "none",
          font: `400 clamp(36px, 6.5vw, 92px) ${SERIF}`,
          letterSpacing: "0.3em",
          textIndent: "0.3em",
          color: PALETTE.titleText,
        }}
      >
        {TITLE}
      </div>
    );
  }
);
