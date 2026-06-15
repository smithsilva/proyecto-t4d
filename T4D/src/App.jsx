import { useEffect, useState } from "react";

import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ContadoraDashboard from "./pages/ContadoraDashboard";
import GerenteDashboard from "./pages/GerenteDashboard";
import MecanicoDashboard from "./pages/MecanicoDashboard";
import SessionTimeout from "./components/SessionTimeout";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {

  const [vista, setVista] = useState("login");
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // =========================================
  // NORMALIZAR ROL
  // =========================================

  const normalizarRol = (rol) => {
    return rol
      ?.toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // =========================================
  // RECUPERAR SESIÓN
  // =========================================

  useEffect(() => {

    const usuarioGuardado =
      localStorage.getItem("usuario");

    if (usuarioGuardado) {

      const usuarioParseado =
        JSON.parse(usuarioGuardado);

      setUsuario(usuarioParseado);

      const rol = normalizarRol(
        usuarioParseado.rol
      );

      switch (rol) {

        case "admin":
          setVista("admin");
          break;

        case "contador":
        case "contadora":
          setVista("contadora");
          break;

        case "gerente":
          setVista("gerente");
          break;

        case "mecanico":
          setVista("mecanico");
          break;

        default:
          setVista("home");
      }

    } else {

      setVista("login");

    }

    setCargando(false);

  }, []);

  // =========================================
  // PANTALLA CARGANDO
  // =========================================

  if (cargando) {

    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
      >
        <h4>Cargando sistema...</h4>
      </div>
    );
  }

  // =========================================
  // RENDER VISTAS
  // =========================================

  switch (vista) {

   case "admin":
  return (
    <>
      <SessionTimeout
        setVista={setVista}
        setUsuario={setUsuario}
      />

      <AdminDashboard
        usuario={usuario}
        setVista={setVista}
        setUsuario={setUsuario}
      />
    </>
  );

   case "contadora":
  return (
    <>
      <SessionTimeout
        setVista={setVista}
        setUsuario={setUsuario}
      />

      <ContadoraDashboard
        usuario={usuario}
        setVista={setVista}
        setUsuario={setUsuario}
      />
    </>
  );
case "gerente":
  return (
    <>
      <SessionTimeout
        setVista={setVista}
        setUsuario={setUsuario}
      />

      <GerenteDashboard
        usuario={usuario}
        setVista={setVista}
        setUsuario={setUsuario}
      />
    </>
  );
case "mecanico":

  if (!usuario) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h4>Cargando usuario...</h4>
      </div>
    );
  }

  return (
    <>
      <SessionTimeout
        setVista={setVista}
        setUsuario={setUsuario}
      />

      <MecanicoDashboard
        usuario={usuario}
        setVista={setVista}
        setUsuario={setUsuario}
      />
    </>
  );

    case "home":
      return (
        <Home
          setVista={setVista}
          setUsuario={setUsuario}
        />
      );

    default:
      return (
        <Home
          setVista={setVista}
          setUsuario={setUsuario}
        />
      );
  }
}

export default App;