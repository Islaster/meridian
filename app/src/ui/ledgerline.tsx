import { SERIF } from "./cards";
export default function LedgerLine({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        font: `15px ${SERIF}`,
        letterSpacing: "0.1em",
        color: "rgba(233,236,242,0.9)",
        borderLeft: "1px solid rgba(233,236,242,0.5)",
        padding: "2px 0 2px 12px",
      }}
    >
      {children}
    </div>
  );
}
