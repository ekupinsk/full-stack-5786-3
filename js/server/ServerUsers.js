import { UsersRepo } from "../db/UsersRepo.js";
import { AuthService } from "./AuthService.js";

export const ServerUsers = (() => {
  function jsonResponse(status, obj) {
    return { status, bodyText: JSON.stringify(obj) };
  }

  function handleRequest(message, reply) {
    const { method, url, body } = message;

    if (method === "POST" && url === "/users/register") {
      const data = safeParse(body);
      const username = String(data?.username || "").trim();
      const password = String(data?.password || "");

      if (username.length < 3) return reply(jsonResponse(400, { error: "Username is too short" }));
      if (password.length < 4) return reply(jsonResponse(400, { error: "Password is too short" }));

      const created = UsersRepo.createUser({ username, password });
      if (!created.ok) return reply(jsonResponse(409, { error: created.error }));

      return reply(jsonResponse(201, { ok: true }));
    }

    if (method === "POST" && url === "/users/login") {
      const data = safeParse(body);
      const username = String(data?.username || "").trim();
      const password = String(data?.password || "");

      const user = UsersRepo.findByUsername(username);
      if (!user) return reply(jsonResponse(401, { error: "Incorrect username or password" }));

      const ok = UsersRepo.validatePassword(user.id, password);
      if (!ok) return reply(jsonResponse(401, { error: "Incorrect username or password" }));

      const token = AuthService.issueToken(user.id);
      return reply(jsonResponse(200, { user: { id: user.id, username: user.username }, token }));
    }

    return reply(jsonResponse(404, { error: "Not Found (users)" }));
  }

  function safeParse(txt) {
    if (!txt) return null;
    try { return JSON.parse(txt); } catch { return null; }
  }

  return { handleRequest };
})();
