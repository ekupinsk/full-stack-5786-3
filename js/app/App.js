import { login, register, getItems, addItem, updateItem, deleteItem } from "../api/clientApi.js";

export class App {
  constructor(state) {
    this.state = state;
    this.topbarUser = document.getElementById("topbarUser");
    this.updateTopbar();
  }

  updateTopbar() {
    if (this.state.isLoggedIn()) {
      this.topbarUser.textContent = `Logged in: ${this.state.currentUser.username}`;
    } else {
      this.topbarUser.textContent = "";
    }
  }

  mountLogin(root) {
    const tpl = document.getElementById("tpl-login");
    const node = tpl.content.cloneNode(true);
    root.appendChild(node);

    const form = document.getElementById("loginForm");
    const status = document.getElementById("loginStatus");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "Sending request to server...";
      const fd = new FormData(form);
      const username = String(fd.get("username") || "").trim();
      const password = String(fd.get("password") || "");

      try {
        const res = await runWithRetry(
          () => login({ username, password }),
          status,
          "Login",
          { retries: 2, waitSec: 3 }
        );
        this.state.setSession(res);
        this.updateTopbar();
        location.hash = "#/dashboard";
      } catch (err) {
        status.textContent = friendlyError(err);
      }
    });
  }

  mountRegister(root) {
    const tpl = document.getElementById("tpl-register");
    const node = tpl.content.cloneNode(true);
    root.appendChild(node);

    const form = document.getElementById("registerForm");
    const status = document.getElementById("registerStatus");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "Sending request to server...";
      const fd = new FormData(form);
      const username = String(fd.get("username") || "").trim();
      const password = String(fd.get("password") || "");

      try {
        await runWithRetry(
          () => register({ username, password }),
          status,
          "Register",
          { retries: 2, waitSec: 3 }
        );
        status.textContent = "User created! You can now log in.";
        setTimeout(() => (location.hash = "#/login"), 300);
      } catch (err) {
        status.textContent = friendlyError(err);
      }
    });
  }

  mountDashboard(root) {
    const tpl = document.getElementById("tpl-dashboard");
    const node = tpl.content.cloneNode(true);
    root.appendChild(node);

    const list = document.getElementById("itemsList");
    const status = document.getElementById("dashStatus");
    const addForm = document.getElementById("addItemForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    const searchInput = document.getElementById("searchInput");

    const renderItems = (items) => {
      list.innerHTML = "";
      for (const it of items) {
        const li = document.createElement("li");
        li.className = "item";

        const left = document.createElement("div");
        left.className = "left";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!it.done;

        const title = document.createElement("div");
        title.className = "title" + (it.done ? " done" : "");
        title.textContent = it.title;

        left.appendChild(cb);
        left.appendChild(title);

        const actions = document.createElement("div");
        actions.className = "actions";

        const editBtn = document.createElement("button");
        editBtn.className = "btn secondary";
        editBtn.type = "button";
        editBtn.textContent = "Edit";

        const delBtn = document.createElement("button");
        delBtn.className = "btn secondary";
        delBtn.type = "button";
        delBtn.textContent = "Delete";

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        li.appendChild(left);
        li.appendChild(actions);

        list.appendChild(li);

        cb.addEventListener("change", async () => {
          status.textContent = "Updating...";
          try {
            await runWithRetry(
              () => updateItem(this.state.token, it.id, { ...it, done: cb.checked }),
              status,
              "Status update",
              { retries: 2, waitSec: 3 }
            );
            await load();
          } catch (err) {
            status.textContent = friendlyError(err);
          }
        });

        editBtn.addEventListener("click", async () => {
          const newTitle = prompt("New title:", it.title);
          if (newTitle === null) return;
          status.textContent = "Updating...";
          try {
            await runWithRetry(
              () => updateItem(this.state.token, it.id, { ...it, title: String(newTitle).trim() }),
              status,
              "Edit title",
              { retries: 2, waitSec: 3 }
            ); await load();
          } catch (err) {
            status.textContent = friendlyError(err);
          }
        });

        delBtn.addEventListener("click", async () => {
          if (!confirm("Delete item?")) return;
          status.textContent = "Deleting...";
          try {
            await runWithRetry(
              () => deleteItem(this.state.token, it.id),
              status,
              "Delete task",
              { retries: 2, waitSec: 3 }
            ); await load();
          } catch (err) {
            status.textContent = friendlyError(err);
          }
        });

      }
    };

    const load = async () => {
      status.textContent = "Loading data...";
      try {
        const items = await runWithRetry(
          () => getItems(this.state.token),
          status,
          "Load tasks",
          { retries: 2, waitSec: 3 }
        );
        const q = String(searchInput.value || "").trim().toLowerCase();
        const filtered = q ? items.filter(i => i.title.toLowerCase().includes(q)) : items;
        renderItems(filtered);
        if (q) status.textContent = `Showing ${filtered.length} out of ${items.length} items.`;
        else status.textContent = `Loaded ${items.length} items.`;
      } catch (err) {
        status.textContent = friendlyError(err);
      }
    };

    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(addForm);
      const title = String(fd.get("title") || "").trim();
      if (!title) return;

      status.textContent = "Adding...";
      try {
        await runWithRetry(
          () => addItem(this.state.token, { title, done: false }),
          status,
          "Add task",
          { retries: 2, waitSec: 3 }
        );
        addForm.reset();
        await load();
      } catch (err) {
        status.textContent = friendlyError(err);
      }
    });

    refreshBtn.addEventListener("click", load);
    searchInput.addEventListener("input", load);

    logoutBtn.addEventListener("click", () => {
      this.state.clearSession();
      this.updateTopbar();
      location.hash = "#/login";
    });

    load();
  }
}

function friendlyError(err) {
  // err can be Error or string
  const msg = (err && err.message) ? err.message : String(err || "");
  if (msg.includes("NETWORK_DROP")) return "Network dropped the message. Try again.";
  return msg || "Unknown error";
}

async function runWithRetry(doRequest, statusEl, actionLabel, options = {}) {
  const retries = options.retries ?? 2;      // how many times to retry
  const waitSec = options.waitSec ?? 3;      // countdown seconds
  const isDrop = (err) => {
    const msg = (err && err.message) ? err.message : String(err || "");
    return msg.includes("DROPPED") || msg.includes("NETWORK_DROP");
  };

  let attempt = 0;
  while (true) {
    try {
      return await doRequest();
    } catch (err) {
      if (!isDrop(err) || attempt >= retries) {
        throw err;
      }

      attempt++;

      // countdown
      for (let s = waitSec; s >= 1; s--) {
        statusEl.textContent = `Network drop (${actionLabel}) retry ${attempt}/${retries} in ${s}...`;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
}
