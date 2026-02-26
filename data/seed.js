import { UsersRepo } from "../js/db/UsersRepo.js";
import { ItemsRepo } from "../js/db/ItemsRepo.js";

export function seedIfEmpty() {
  // If users already exist - don't touch
  const users = UsersRepo.list();
  if (users.length > 0) return;

  // Demo user
  const created = UsersRepo.createUser({ username: "eli", password: "1234" });
  if (!created.ok) return;

  const userId = created.user.id;
  ItemsRepo.add(userId, { title: "Read project instructions", done: false });
  ItemsRepo.add(userId, { title: "Run with Live Server", done: true });
}
