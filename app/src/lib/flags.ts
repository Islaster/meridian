// The record of what has happened is a list of strings — "act:license", "sworn:ira-vell",
// "cleared:tide-cave" — because a flag that can be named in data can be set, tested and
// greyed on without new code. These are the only ways anyone should touch that list.
export const add = (done: string[], ...flags: string[]) => [
  ...new Set([...done, ...flags]),
];
export const drop = (done: string[], ...flags: string[]) =>
  done.filter((f) => !flags.includes(f));
// the flags under a prefix — "sworn:" → ["sworn:ira-vell"]
export const under = (done: string[], prefix: string) =>
  done.filter((f) => f.startsWith(prefix));
// the first value under a prefix — "sworn:" → "ira-vell"
export const valueOf = (done: string[], prefix: string) =>
  under(done, prefix)[0]?.slice(prefix.length);
