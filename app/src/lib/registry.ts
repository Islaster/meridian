// Every noun in the game — an item, a quest, a place — declares itself once at load
// and is found by id afterwards. A registry is that list, plus the two rules every
// list shares: an id is declared once (twice is a bug, not an update — except under
// Vite's hot reload, which re-runs a file on purpose), and asking for an id that
// isn't there is an error with the id in it, never a silent undefined.
export class Registry<T extends { id: string }> extends Map<string, T> {
  kind: string;
  constructor(kind: string) {
    super();
    this.kind = kind;
  }
  add(v: T): T {
    if (this.has(v.id) && !import.meta.hot)
      throw new Error(`duplicate ${this.kind}: ${v.id}`);
    this.set(v.id, v);
    return v;
  }
  get(id: string): T {
    const v = super.get(id);
    if (!v) throw new Error(`unknown ${this.kind}: ${id}`);
    return v;
  }
  all(): T[] {
    return [...this.values()];
  }
  find(test: (v: T) => boolean): T | undefined {
    for (const v of this.values()) if (test(v)) return v;
  }
}

// What every model extends, so `Item.get(id)`, `Item.all()` and `Item.find(…)` exist
// without each model writing them. A model declares its own registry:
//   static registry = new Registry<Item>("item");
type Keeps<T> = { registry: Registry<T & { id: string }> };
export class Entity {
  static get<T>(this: Keeps<T>, id: string): T {
    return this.registry.get(id);
  }
  static all<T>(this: Keeps<T>): T[] {
    return this.registry.all();
  }
  static find<T>(this: Keeps<T>, test: (v: T) => boolean): T | undefined {
    return this.registry.find(test as (v: T & { id: string }) => boolean);
  }
}
