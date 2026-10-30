import { Throwable } from "../../models/item";

export const oilFlask = new Throwable("oil-flask", "Oil flask", "oil", 10, 8);
export const bomb = new Throwable("bomb", "Bomb", "bomb", 18, 20);

if (import.meta.hot) import.meta.hot.accept();
