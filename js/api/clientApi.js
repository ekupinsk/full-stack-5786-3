import { API } from "./endpoints.js";
import { FXMLHttpRequest } from "../fajax/FXMLHttpRequest.js";

function request({ method, url, token = null, body = null }) {
  return new Promise((resolve, reject) => {
    const req = new FXMLHttpRequest();

    req.onload = function () {
      try {
        const payload = req.responseText ? JSON.parse(req.responseText) : null;
        if (req.status >= 200 && req.status < 300) resolve(payload);
        else reject(new Error(payload?.error || `HTTP ${req.status}`));
      } catch (e) {
        reject(new Error("Invalid response from server"));
      }
    };

    req.onerror = function () {
      reject(new Error("NETWORK_DROP"));
    };

    req.open(method, url);
    if (token) req.setRequestHeader("Authorization", `Bearer ${token}`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(body ? JSON.stringify(body) : null);
  });
}

export function register({ username, password }) {
  return request({ method: "POST", url: API.USERS_REGISTER, body: { username, password } });
}

export function login({ username, password }) {
  return request({ method: "POST", url: API.USERS_LOGIN, body: { username, password } });
}

export function getItems(token) {
  return request({ method: "GET", url: API.ITEMS, token });
}

export function getItemById(token, id) {
  return request({ method: "GET", url: API.ITEM_BY_ID(id), token });
}

export function addItem(token, item) {
  return request({ method: "POST", url: API.ITEMS, token, body: item });
}

export function updateItem(token, id, item) {
  return request({ method: "PUT", url: API.ITEM_BY_ID(id), token, body: item });
}

export function deleteItem(token, id) {
  return request({ method: "DELETE", url: API.ITEM_BY_ID(id), token });
}
