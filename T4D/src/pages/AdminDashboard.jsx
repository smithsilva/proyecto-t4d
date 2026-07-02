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

function AdminDashboard({ usuario, setVista, setUsuario }) {
  const [vistaAdmin, setVistaAdmin] = useState("inventario");

  const [notificaciones, setNotificaciones] = useState([
    { id: 1, titulo: "Solicitud de Piezas de Repuesto", descripcion: "Stock crítico de blindaje frontal", tiempo: "Hace 5 min",   leido: false },
    { id: 2, titulo: "Bajo stock detectado",            descripcion: "Placas Balísticas en mínimo",      tiempo: "Hace 1 hora",  leido: false },
    { id: 3, titulo: "Reporte generado",                descripcion: "Reporte mensual disponible",       tiempo: "Hace 2 horas", leido: true  },
  ]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>

      <SidebarAdmin setVistaAdmin={setVistaAdmin} vistaAdmin={vistaAdmin} />

      <div className="flex-grow-1">

        <TopbarAdmin
          setVistaAdmin={setVistaAdmin}
          notificaciones={notificaciones}
          usuario={usuario}
          setUsuario={setUsuario}
          setVista={setVista}
        />

        <main className="p-4">
          {vistaAdmin === "inventario"       && <Inventario usuario={usuario} />}
          {vistaAdmin === "movimientos"      && <Movimientos />}
          {vistaAdmin === "historialprecios" && <HistorialPrecios usuario={usuario} />}
          {vistaAdmin === "notificaciones"   && <Notificaciones notificaciones={notificaciones} setNotificaciones={setNotificaciones} />}
          {vistaAdmin === "reportes"         && <Reportes />}
          {vistaAdmin === "GestionUsuarios"  && <GestionUsuarios />}
          {vistaAdmin === "RegistroUsuarios" && <RegistroUsuarios />}
          {vistaAdmin === "perfil"           && <PerfilAdmin usuario={usuario} setUsuario={setUsuario} />}
        </main>

      </div>
    </div>
  );
}

export default AdminDashboard;