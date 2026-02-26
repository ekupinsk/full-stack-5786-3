import { Network } from "../network/Network.js";

export class FXMLHttpRequest {
  constructor() {
    this.method = null;
    this.url = null;

    this.requestHeaders = {};
    this.status = 0;
    this.responseText = "";

    this.onload = null;
    this.onerror = null;
  }

  open(method, url) {
    this.method = String(method).toUpperCase();
    this.url = String(url);
  }

  setRequestHeader(key, value) {
    this.requestHeaders[String(key).toLowerCase()] = String(value);
  }

  send(bodyTextOrNull) {
    const message = {
      method: this.method,
      url: this.url,
      headers: { ...this.requestHeaders },
      body: bodyTextOrNull,
    };

    Network.sendRequest(message, (err, response) => {
      if (err) {
        if (typeof this.onerror === "function") this.onerror(err);
        return;
      }

      this.status = response.status;
      this.responseText = response.bodyText || "";

      if (typeof this.onload === "function") this.onload();
    });
  }
}
