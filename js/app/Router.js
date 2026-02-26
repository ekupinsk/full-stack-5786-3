export class Router {
  constructor(app) {
    this.app = app;
    this.root = document.getElementById("appRoot");
  }

  start() {
    window.addEventListener("hashchange", () => this.render());
    if (!location.hash) location.hash = "#/login";
    this.render();
  }

  render() {
    const route = (location.hash || "#/login").replace("#", "");
    // guard
    if (route === "/dashboard" && !this.app.state.isLoggedIn()) {
      location.hash = "#/login";
      return;
    }
    this.root.innerHTML = "";
    if (route === "/login") this.app.mountLogin(this.root);
    else if (route === "/register") this.app.mountRegister(this.root);
    else if (route === "/dashboard") this.app.mountDashboard(this.root);
    else location.hash = "#/login";
  }
}
