import MenuButton from "@/ui/menubutton";

export default function MainMenu({ onNewGame }: { onNewGame: () => void }) {
  return <MenuButton label="New game" onClick={onNewGame} />;
}
