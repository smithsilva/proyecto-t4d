import { useEffect } from "react";
import Swal from "sweetalert2";
import { supabase } from "../supabase/supabaseClient";

function SessionTimeout({ setVista, setUsuario }) {
  useEffect(() => {
    let timeout;

    const cerrarSesion = async () => {
          console.log("Sesión cerrada por inactividad");
      await Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Tu sesión ha finalizado por inactividad",
        confirmButtonText: "Aceptar",
      });

      localStorage.removeItem("usuario");
      localStorage.removeItem("token");

      await supabase.auth.signOut();

      if (setUsuario) {
        setUsuario(null);
      }

      setVista("login");
    };

    const reiniciarTemporizador = () => {
      clearTimeout(timeout);

       console.log("Temporizador reiniciado:", new Date().toLocaleTimeString());

      timeout = setTimeout(() => {
        cerrarSesion();
      }, 15 * 60 * 1000); // 15 minutos
    };

    window.addEventListener("mousemove", reiniciarTemporizador);
    window.addEventListener("keydown", reiniciarTemporizador);
    window.addEventListener("click", reiniciarTemporizador);
    window.addEventListener("scroll", reiniciarTemporizador);

    reiniciarTemporizador();

    return () => {
      clearTimeout(timeout);

      window.removeEventListener("mousemove", reiniciarTemporizador);
      window.removeEventListener("keydown", reiniciarTemporizador);
      window.removeEventListener("click", reiniciarTemporizador);
      window.removeEventListener("scroll", reiniciarTemporizador);
    };
  }, [setVista, setUsuario]);

  return null;
}

export default SessionTimeout;