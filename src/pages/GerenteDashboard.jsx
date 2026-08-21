import { useState } from "react";
import TopbarGerente from "../components/GerenteDashboard/TopbarGerente";
import SidebarGerente from "../components/GerenteDashboard/SidebarGerente";
import Movimientos from "../components/GerenteDashboard/Movimientos";
import Inventario from "../components/GerenteDashboard/Inventario";
import Notificaciones from "../components/GerenteDashboard/Notificaciones";
import AsignacionTareas from "../components/GerenteDashboard/AsignacionTareas";
import Clientes from "../components/GerenteDashboard/Clientes";
import DireccionesCliente from "../components/GerenteDashboard/DireccionesCliente";
import PerfilUsuario from "../components/AdminDasboard/PerfilUsuario";
import HistorialPrecios from "../components/GerenteDashboard/HistorialPrecios";

function GerenteDashboard({ usuario, setVista, setUsuario }) {

  const [vistaGerente, setVistaGerente] = useState("inventario");

  const [notificaciones, setNotificaciones] = useState([
    {
      id: 1,
      titulo: "Reporte mensual disponible",
      descripcion: "El reporte financiero fue generado",
      tiempo: "Hace 5 min",
      leido: false,
    },
    {
      id: 2,
      titulo: "Inventario actualizado",
      descripcion: "Se registró nuevo stock",
      tiempo: "Hace 20 min",
      leido: false,
    },
  ]);

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >

      <SidebarGerente
        setVistaGerente={setVistaGerente}
        vistaGerente={vistaGerente}
      />

      <div className="flex-grow-1">

        <TopbarGerente
          setVistaGerente={setVistaGerente}
          notificaciones={notificaciones}
          usuario={usuario}
          setUsuario={setUsuario}
          setVista={setVista}
        />

        <main className="p-4">

          {vistaGerente === "inventario" && <Inventario />}
          {vistaGerente === "movimientos" && <Movimientos />}
          {vistaGerente === "historialprecios" && <HistorialPrecios usuario={usuario} />}
          {vistaGerente === "asignacion-tareas" && <AsignacionTareas />}
          {vistaGerente === "cliente" && <Clientes />}
          {vistaGerente === "direcciones-cliente" && <DireccionesCliente />}

          {vistaGerente === "notificaciones" && (
            <Notificaciones
              notificaciones={notificaciones}
              setNotificaciones={setNotificaciones}
            />
          )}

          {vistaGerente === "perfil" && (
            <PerfilUsuario
              usuario={usuario}
              setUsuario={setUsuario}
            />
          )}

        </main>

      </div>
    </div>
  );
}

export default GerenteDashboard;