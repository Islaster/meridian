import { useSyncExternalStore } from "react";

// Is this a phone-width screen? Subscribes to the media query, so a rotate re-renders.
const QUERY = "(max-width: 640px)";
const subscribe = (fn: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", fn);
  return () => m.removeEventListener("change", fn);
};
export const useNarrow = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
