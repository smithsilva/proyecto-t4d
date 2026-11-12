import { BACKEND_KEY } from "../apiConfig";

export const getHeaders = (conBody = false) => {
  const token = localStorage.getItem("token");

  const headers = {
    "x-api-key": BACKEND_KEY,
  };

  if (conBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};
