import { Registry, Entity } from "@/lib/registry";
import { Plans, type Plan } from "./plan";

export class City extends Entity {
  static registry = new Registry<City>("city");
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
    centrality: City["centrality"],
    opts: { plan?: Plan } = {} // plan: the town drawn — its streets as boxes, or its districts once it's big enough (size 3+) to have them
  ) {
    super();
    this.id = id;
    this.name = name;
    this.region = region;
    this.owner = owner;
    this.size = size;
    this.centrality = centrality;
    if (opts.plan) Plans.add(this, opts.plan);
    City.registry.add(this);
  }
}
