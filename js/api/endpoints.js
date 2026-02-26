export const API = {
  USERS_REGISTER: "/users/register",
  USERS_LOGIN: "/users/login",

  ITEMS: "/items",         // GET(all), POST(create)
  ITEM_BY_ID: (id) => `/items/${id}`, // GET, PUT, DELETE
};
