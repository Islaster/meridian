import { register } from "./registry";

export class City {
  static registry = new Map<string, City>();
  static get(id: string): City {
    const c = City.registry.get(id);
    if (!c) throw new Error(`unknown city: ${id}`);
    return c;
  }
  id: string;
  name: string;
  region: string;
  owner: string;
  size: 1 | 2 | 3 | 4 | 5; // hamlet → capital
  centrality: 1 | 2 | 3 | 4 | 5; // the boonies → the heart of the country
  constructor(
    id: string,
    name: string,
    region: string,
    owner: string,
    size: City["size"],
    centrality: City["centrality"]
  ) {
    this.id = id;
    this.name = name;
    this.region = region;
    this.owner = owner;
    this.size = size;
    this.centrality = centrality;
    register(City.registry, "city", id, this);
  }
}
