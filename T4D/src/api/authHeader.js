// Helper centralizado para armar los headers de cada request.
// Así, si mañana cambia el nombre del header o la lógica del token,
// solo se edita en un solo lugar.

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