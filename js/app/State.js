export class State {
  constructor() {
    this.currentUser = null;   // { id, username }
    this.token = null;         // string
  }

  isLoggedIn() {
    return !!this.token && !!this.currentUser;
  }

  setSession({ user, token }) {
    this.currentUser = user;
    this.token = token;
  }

  clearSession() {
    this.currentUser = null;
    this.token = null;
  }
}
