import { useState } from "react";
import TopbarContadora from "../components/ContadoraDasboard/topbarContadora";
import SidebarContadora from "../components/ContadoraDasboard/SidebarContadora";

import Inventario from "../components/ContadoraDasboard/Inventario";
import Reportes from "../components/ContadoraDasboard/Reportes";
import PerfilUsuario from "../components/AdminDasboard/PerfilUsuario";
import MovimientosContables from "../components/ContadoraDasboard/MovimientosContables";
import Empleados from "../components/ContadoraDasboard/Empleados";
import Proveedores from "../components/ContadoraDasboard/Proveedores";
import HistorialPrecios from "../components/ContadoraDasboard/HistorialPrecios";
import MetodosPago from "../components/ContadoraDasboard/MetodosPago";
import Sucursales from "../components/ContadoraDasboard/Sucursales";

function ContadoraDashboard({ usuario, setVista, setUsuario }) {

  const [vistaContadora, setVistaContadora] = useState("movimientoscontables");

  const [notificaciones, setNotificaciones] = useState([
    {
      id: 1,
      titulo: "Nuevo reporte disponible",
      descripcion: "El gerente subió un nuevo reporte",
      tiempo: "Hace 2 min",
      leido: false,
    },
    {
      id: 2,
      titulo: "Movimiento registrado",
      descripcion: "Se agregó un nuevo movimiento contable",
      tiempo: "Hace 10 min",
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

      <SidebarContadora
        setVistaContadora={setVistaContadora}
        vistaContadora={vistaContadora}
      />

      <div className="flex-grow-1">

        <TopbarContadora
          setVistaContadora={setVistaContadora}
          notificaciones={notificaciones}
          usuario={usuario}
          setUsuario={setUsuario}
          setVista={setVista}
        />

        <main className="p-4">

          {vistaContadora === "inventario" && <Inventario />}
          {vistaContadora === "reportes" && <Reportes />}

          {vistaContadora === "perfil" && (
            <PerfilUsuario
              usuario={usuario}
              setUsuario={setUsuario}
            />
          )}
          {vistaContadora === "movimientoscontables" && <MovimientosContables />}
          {vistaContadora === "empleados" && <Empleados />}
          {vistaContadora === "proveedores" && <Proveedores />}
          {vistaContadora === "historialprecios" && <HistorialPrecios usuario={usuario} />}
          {vistaContadora === "metodospago" && <MetodosPago />}
          {vistaContadora === "sucursales" && <Sucursales />}
        </main>

      </div>
    </div>
  );
}

export default ContadoraDashboard;