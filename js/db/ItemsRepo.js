import { DB } from "./DB.js";

export const ItemsRepo = (() => {
  const KEY = "fajax_items_by_user"; // { [userId]: [ {id,title,done} ] }
  const NEXT_ID = "fajax_items_nextId";

  function loadAll() {
    return DB.get(KEY, {});
  }

  function saveAll(map) {
    DB.set(KEY, map);
  }

  function nextId() {
    const n = DB.get(NEXT_ID, 1);
    DB.set(NEXT_ID, n + 1);
    return n;
  }

  function listByUser(userId) {
    const map = loadAll();
    return map[userId] ? [...map[userId]] : [];
  }

  function add(userId, { title, done }) {
    const map = loadAll();
    const arr = map[userId] || [];
    const item = { id: nextId(), title, done: !!done };
    arr.push(item);
    map[userId] = arr;
    saveAll(map);
    return item;
  }

  function getById(userId, id) {
    return listByUser(userId).find(i => i.id === id) || null;
  }

  function update(userId, id, { title, done }) {
    const map = loadAll();
    const arr = map[userId] || [];
    const idx = arr.findIndex(i => i.id === id);
    if (idx < 0) return null;
    arr[idx] = { id, title, done: !!done };
    map[userId] = arr;
    saveAll(map);
    return arr[idx];
  }

  function remove(userId, id) {
    const map = loadAll();
    const arr = map[userId] || [];
    const idx = arr.findIndex(i => i.id === id);
    if (idx < 0) return false;
    arr.splice(idx, 1);
    map[userId] = arr;
    saveAll(map);
    return true;
  }

  return { listByUser, add, getById, update, remove };
})();
