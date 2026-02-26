import { ItemsRepo } from "../db/ItemsRepo.js";
import { AuthService } from "./AuthService.js";

export const ServerData = (() => {
  function jsonResponse(status, obj) {
    return { status, bodyText: JSON.stringify(obj) };
  }

  function handleRequest(message, reply) {
    const { method, url, headers, body } = message;

    // auth required for all /items
    const session = AuthService.getUserFromAuthHeader(headers);
    if (!session) return reply(jsonResponse(401, { error: "Unauthorized (not logged in)" }));

    const userId = session.user.id;

    // GET /items
    if (method === "GET" && url === "/items") {
      const items = ItemsRepo.listByUser(userId);
      return reply(jsonResponse(200, items));
    }

    // POST /items
    if (method === "POST" && url === "/items") {
      const data = safeParse(body);
      const title = String(data?.title || "").trim();
      const done = !!data?.done;

      if (!title) return reply(jsonResponse(400, { error: "Missing title" }));

      const existing = ItemsRepo.listByUser(userId).find(i => i.title === title);
      if (existing) {
        return reply(jsonResponse(409, { error: "Task with this title already exists" }));
      }

      const created = ItemsRepo.add(userId, { title, done });
      return reply(jsonResponse(201, created));
    }

    // /items/:id
    const m = url.match(/^\/items\/(\d+)$/);
    if (m) {
      const id = Number(m[1]);

      if (method === "PUT") {
        const data = safeParse(body);
        const title = String(data?.title || "").trim();
        const done = !!data?.done;

        if (!title) return reply(jsonResponse(400, { error: "Missing title" }));

        // first check if item exists
        const current = ItemsRepo.getById(userId, id);
        if (!current) {
          return reply(jsonResponse(404, { error: "Item not found" }));
        }

        // check for duplicates only if title changed
        if (title !== current.title) {
          const duplicate = ItemsRepo.listByUser(userId).find(i => i.id !== id && i.title === title);

          if (duplicate) {
            return reply(jsonResponse(409, { error: "Task with this title already exists" }));
          }
        }

        const updated = ItemsRepo.update(userId, id, { title, done });
        return reply(jsonResponse(200, updated));
      }

      if (method === "DELETE") {
        const ok = ItemsRepo.remove(userId, id);
        if (!ok) return reply(jsonResponse(404, { error: "Item not found" }));
        return reply(jsonResponse(200, { ok: true }));
      }

      if (method === "GET") {
        const it = ItemsRepo.getById(userId, id);
        if (!it) return reply(jsonResponse(404, { error: "Item not found" }));
        return reply(jsonResponse(200, it));
      }
    }

    return reply(jsonResponse(404, { error: "Not Found (data)" }));
  }

  function safeParse(txt) {
    if (!txt) return null;
    try { return JSON.parse(txt); } catch { return null; }
  }

  return { handleRequest };
})();
