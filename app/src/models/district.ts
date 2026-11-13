import { Registry, Entity } from "@/lib/registry";
import { Plans, type Plan } from "./plan";

// A district: a part of a city big enough to have parts. Nobody stands in a
// district — they stand in one of its streets — so it isn't a Location. It's a
// level of the map: the city's plan draws its districts, a district's plan draws
// its streets. A town of size 1–2 has no districts and draws its streets itself.
export class District extends Entity {
  static registry = new Registry<District>("district");
  id: string;
  name: string;
  city: string;
  plan: Plan;
  constructor(id: string, name: string, city: string, plan: Plan) {
    super();
    this.id = id;
    this.name = name;
    this.city = city;
    this.plan = plan;
    Plans.add(this, plan);
    District.registry.add(this);
  }
}
