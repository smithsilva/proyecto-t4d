import { useState } from "react";
import SidebarAdmin from "../components/AdminDasboard/SidebarAdmin";
import TopbarAdmin from "../components/AdminDasboard/TopbarAdmin";
import Movimientos from "../components/AdminDasboard/Movimientos";
import Inventario from "../components/AdminDasboard/Inventario";
import Reportes from "../components/AdminDasboard/Reportes";
import GestionUsuarios from "../components/AdminDasboard/GestionUsuarios";
import Notificaciones from "../components/AdminDasboard/Notificaciones";
import RegistroUsuarios from "../components/AdminDasboard/RegistroUsuarios";
import PerfilAdmin from "../components/AdminDasboard/PerfilUsuario";
import HistorialPrecios from "../components/AdminDasboard/HistorialPrecios";

function AdminDashboard() {
  const [vistaAdmin, setVistaAdmin] = useState("inventario");

  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    try {
      const u = guardado ? JSON.parse(guardado) : null;
      return {
        id_usuario: u?.id_usuario || null,          // ← FIX: preservar id_usuario
        nombre:     u?.nombre     || u?.username || "Usuario",
        correo:     u?.correo     || u?.email    || "correo@email.com",
        rol:        u?.rol        || "Administrador",
        foto:       u?.foto       || null,
      };
    } catch (error) {
      localStorage.removeItem("usuario");
      return {
        id_usuario: null,
        nombre:     "Usuario",
        correo:     "",
        rol:        "Administrador",
        foto:       null,
      };
    }
  });

  const [notificaciones, setNotificaciones] = useState([
    { id: 1, titulo: "Solicitud de Piezas de Repuesto", descripcion: "Stock crítico de blindaje frontal", tiempo: "Hace 5 min",   leido: false },
    { id: 2, titulo: "Bajo stock detectado",            descripcion: "Placas Balísticas en mínimo",      tiempo: "Hace 1 hora",  leido: false },
    { id: 3, titulo: "Reporte generado",                descripcion: "Reporte mensual disponible",       tiempo: "Hace 2 horas", leido: true  },
  ]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>

      {/* SIDEBAR */}
      <SidebarAdmin setVistaAdmin={setVistaAdmin} vistaAdmin={vistaAdmin} />

      {/* CONTENIDO */}
      <div className="flex-grow-1">

        {/* TOPBAR */}
        <TopbarAdmin
          setVistaAdmin={setVistaAdmin}
          notificaciones={notificaciones}
          usuario={usuario}
        />

        {/* MAIN */}
        <main className="p-4">
          {vistaAdmin === "inventario"      && <Inventario usuario={usuario} />}
          {vistaAdmin === "movimientos"     && <Movimientos />}
          {vistaAdmin === "historialprecios"&& <HistorialPrecios usuario={usuario} />}
          {vistaAdmin === "notificaciones"  && <Notificaciones notificaciones={notificaciones} setNotificaciones={setNotificaciones} />}
          {vistaAdmin === "reportes"        && <Reportes />}
          {vistaAdmin === "GestionUsuarios" && <GestionUsuarios />}
          {vistaAdmin === "RegistroUsuarios"&& <RegistroUsuarios />}
          {vistaAdmin === "perfil"          && <PerfilAdmin usuario={usuario} setUsuario={setUsuario} />}
        </main>

      </div>
    </div>
  );
}

export default AdminDashboard;