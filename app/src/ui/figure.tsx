// The mark that says "a person": a head and shoulders, drawn in the current color.
export default function Figure({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      style={{ verticalAlign: "-1px", marginRight: 5, flex: "none" }}
    >
      <circle cx="6" cy="3.6" r="2.4" />
      <path d="M1.5 11.5a4.5 4.5 0 0 1 9 0" />
    </svg>
  );
}
