import { seedIfEmpty } from "../data/seed.js";
import { Network } from "./network/Network.js";
import { Router } from "./app/Router.js";
import { App } from "./app/App.js";
import { State } from "./app/State.js";

seedIfEmpty();

// configure network (delay + drop)
Network.configure({
  minDelayMs: 1000,
  maxDelayMs: 3000,
  dropProbability: 0.2, // 20% drop
});

const state = new State();
const app = new App(state);
const router = new Router(app);

router.start();
