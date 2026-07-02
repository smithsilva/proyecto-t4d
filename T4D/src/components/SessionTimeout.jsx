import { useEffect } from "react";
import Swal from "sweetalert2";

function SessionTimeout({ setVista, setUsuario }) {
  useEffect(() => {
    let timeoutInactividad;
    let intervaloToken;

    const cerrarSesion = async (motivo) => {
      console.log("Sesión cerrada:", motivo);

      await Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text:
          motivo === "token"
            ? "Tu sesión ha expirado, inicia sesión de nuevo"
            : "Tu sesión ha finalizado por inactividad",
        confirmButtonText: "Aceptar",
      });

      localStorage.removeItem("usuario");
      localStorage.removeItem("token");

      if (setUsuario) setUsuario(null);
      setVista("login");
    };

    // ── Verificación de expiración real del JWT ──
    const tokenValido = (token) => {
      if (!token) return false;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const ahora = Math.floor(Date.now() / 1000);
        return payload.exp > ahora;
      } catch {
        return false;
      }
    };

    const revisarToken = () => {
      const token = localStorage.getItem("token");
      if (!tokenValido(token)) {
        cerrarSesion("token");
      }
    };

    // ── Temporizador de inactividad (15 min) ──
    const reiniciarTemporizador = () => {
      clearTimeout(timeoutInactividad);
      timeoutInactividad = setTimeout(() => {
        cerrarSesion("inactividad");
      }, 15 * 60 * 1000);
    };

    window.addEventListener("mousemove", reiniciarTemporizador);
    window.addEventListener("keydown", reiniciarTemporizador);
    window.addEventListener("click", reiniciarTemporizador);
    window.addEventListener("scroll", reiniciarTemporizador);

    reiniciarTemporizador();

    // Revisa cada 30s si el JWT ya expiró, aunque el usuario siga activo
    intervaloToken = setInterval(revisarToken, 30 * 1000);

    return () => {
      clearTimeout(timeoutInactividad);
      clearInterval(intervaloToken);

      window.removeEventListener("mousemove", reiniciarTemporizador);
      window.removeEventListener("keydown", reiniciarTemporizador);
      window.removeEventListener("click", reiniciarTemporizador);
      window.removeEventListener("scroll", reiniciarTemporizador);
    };
  }, [setVista, setUsuario]);

  return null;
}

export default SessionTimeout;