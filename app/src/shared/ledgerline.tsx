import { SERIF } from "../landing/cards";
export default function LedgerLine({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        font: `13px ${SERIF}`,
        letterSpacing: "0.1em",
        color: "rgba(200,212,255,0.85)",
        borderLeft: "1px solid rgba(200,212,255,0.5)",
        padding: "2px 0 2px 12px",
      }}
    >
      {children}
    </div>
  );
}
