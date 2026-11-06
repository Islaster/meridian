// data is declared once; a second declaration of an id is a bug, not an update
export const register = <T>(
  reg: Map<string, T>,
  kind: string,
  id: string,
  v: T
) => {
  if (reg.has(id) && !import.meta.hot)
    throw new Error(`duplicate ${kind}: ${id}`);
  reg.set(id, v);
};
