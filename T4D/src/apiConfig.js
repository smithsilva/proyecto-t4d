// URL y clave del backend. En Vercel vienen de las variables VITE_API_URL y VITE_API_KEY.
export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const BACKEND_KEY = import.meta.env.VITE_API_KEY || "";
