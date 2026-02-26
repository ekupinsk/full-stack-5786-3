import { DB } from "./DB.js";

export const UsersRepo = (() => {
  const KEY = "fajax_users"; // array of {id, username, passwordHash}
  const NEXT_ID = "fajax_users_nextId";

  function list() {
    return DB.get(KEY, []);
  }

  function save(users) {
    DB.set(KEY, users);
  }

  function nextId() {
    const n = DB.get(NEXT_ID, 1);
    DB.set(NEXT_ID, n + 1);
    return n;
  }

  function hashPassword(pw) {
    // Not real security.
    return `h_${btoa(unescape(encodeURIComponent(pw)))}`;
  }

  function findByUsername(username) {
    return list().find(u => u.username.toLowerCase() === String(username).toLowerCase()) || null;
  }

  function getById(id) {
    return list().find(u => u.id === id) || null;
  }

  function createUser({ username, password }) {
    const users = list();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: "Username already exists" };
    }
    const user = {
      id: nextId(),
      username,
      passwordHash: hashPassword(password),
    };
    users.push(user);
    save(users);
    return { ok: true, user: { id: user.id, username: user.username } };
  }

  function validatePassword(userId, password) {
    const u = getById(userId);
    if (!u) return false;
    return u.passwordHash === hashPassword(password);
  }

  return { list, findByUsername, getById, createUser, validatePassword };
})();
