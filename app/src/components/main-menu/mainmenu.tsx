import { MenuButton } from "../landing/cards";

export interface MainMenuProps {
  onNewGame: () => void;
  onContinue?: () => void;
  onSettings?: () => void;
  onLoadGame?: () => void;
}

export default function MainMenu({
  onNewGame,
  onContinue,
  onSettings,
  onLoadGame,
}: MainMenuProps) {
  return (
    <>
      {onNewGame && <MenuButton label="New game" onClick={() => onNewGame()} />}
      {onLoadGame && (
        <MenuButton label="load game" onClick={() => onLoadGame()} />
      )}
      {onContinue && (
        <MenuButton label="Continue" onClick={() => onContinue()} />
      )}
      {onSettings && (
        <MenuButton label="Settings" onClick={() => onSettings()} />
      )}
    </>
  );
}
