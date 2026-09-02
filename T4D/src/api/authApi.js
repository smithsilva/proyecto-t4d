import { getHeaders } from "./authHeader";

const BASE_URL = "http://localhost:5000/auth";

// ── SOLICITAR RECUPERACIÓN (envía el enlace por correo) ──
export const solicitarRecuperacion = async (email) => {
  const response = await fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "No se pudo solicitar la recuperación");
  }

  return data;
};

// ── RESTABLECER CONTRASEÑA (con el token del enlace) ──
export const restablecerContrasena = async (token, nuevaPassword) => {
  const response = await fetch(`${BASE_URL}/reset-password`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ token, nuevaPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "No se pudo restablecer la contraseña");
  }

  return data;
};