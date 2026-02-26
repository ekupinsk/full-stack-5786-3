import { ServerUsers } from "../server/ServerUsers.js";
import { ServerData } from "../server/ServerData.js";

export const Network = (() => {
  let config = {
    minDelayMs: 1000,
    maxDelayMs: 3000,
    dropProbability: 0.2,
  };

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shouldDrop() {
    return Math.random() < config.dropProbability;
  }

  function routeToServer(url) {
    if (url.startsWith("/users")) return ServerUsers;
    return ServerData;
  }

  function sendRequest(message, clientCallback) {
    // Simulate outbound network behavior
    const delay1 = randInt(config.minDelayMs, config.maxDelayMs);

    setTimeout(() => {
      if (shouldDrop()) {
        clientCallback(new Error("DROPPED_OUTBOUND"), null);
        return;
      }

      const server = routeToServer(message.url);

      server.handleRequest(message, (serverResponse) => {
        // Simulate inbound network behavior
        const delay2 = randInt(config.minDelayMs, config.maxDelayMs);

        setTimeout(() => {
          if (shouldDrop()) {
            clientCallback(new Error("DROPPED_INBOUND"), null);
            return;
          }
          clientCallback(null, serverResponse);
        }, delay2);
      });
    }, delay1);
  }

  function configure(newCfg) {
    config = { ...config, ...newCfg };
  }

  return { sendRequest, configure };
})();
