

export const getHeaders = (conBody = false) => {
  const token = localStorage.getItem("token");

  const headers = {
    "x-api-key": "pollo",
  };

  if (conBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};