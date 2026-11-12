// URL y clave del backend. Vienen del archivo .env del frontend (en la raíz de T4D):
//   VITE_API_URL=http://52.70.223.173:5000
//   VITE_X_API_KEY=<mismo valor de X_API_KEY del backend>
export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://52.70.223.173:5000";
export const BACKEND_KEY =
  import.meta.env.VITE_X_API_KEY || import.meta.env.VITE_API_KEY || "";
