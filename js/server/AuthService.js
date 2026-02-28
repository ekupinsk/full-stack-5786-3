import { DB } from "../db/DB.js";
import { UsersRepo } from "../db/UsersRepo.js";

export const AuthService = (() => {
  const TOKENS_KEY = "fajax_tokens"; // { token: userId }

  function loadMap() {
    return DB.get(TOKENS_KEY, {});
  }

  function saveMap(map) {
    DB.set(TOKENS_KEY, map);
  }


  function issueToken(userId) {
    const token = `t_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    const map = loadMap();
    map[token] = userId;
    saveMap(map);
    return token;
  }

  function getUserFromAuthHeader(headers) {
    const auth = headers?.authorization || headers?.Authorization || "";
    const str = String(auth);
    if (!str.startsWith("Bearer ")) return null;
    const token = str.slice("Bearer ".length).trim();
    const map = loadMap();
    const userId = map[token];
    if (!userId) return null;
    const user = UsersRepo.getById(userId);
    if (!user) return null;
    return { token, user };
  }

  return { issueToken, getUserFromAuthHeader };
})();
