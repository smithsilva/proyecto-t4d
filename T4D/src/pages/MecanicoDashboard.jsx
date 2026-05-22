import { useState } from "react";
import TopbarMecanico from "../components/MecanicoDasboard/TopbarMecanico";
import SidebarMecanico from "../components/MecanicoDasboard/SidebarMecanico";
import Inventario from "../components/MecanicoDasboard/Inventario";
import PerfilUsuario from "../components/AdminDasboard/PerfilUsuario";
import MisMantenimientos from "../components/MecanicoDasboard/MisMantenimientos";
import CategoriasBrindajes from "../components/MecanicoDasboard/CategoriasBrindaje"

function MecanicoDashboard({ setVista }) {

  const [vistaMecanico, setVistaMecanico] = useState("inventario");

  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");

    return guardado
      ? JSON.parse(guardado)
      : {
          nombre: "Pedro Martinez",
          correo: "mecanico@gmail.com",
          rol: "Mecánico",
          foto: null,
        };
  });

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >

      <SidebarMecanico
        setVistaMecanico={setVistaMecanico}
        vistaMecanico={vistaMecanico}
      />

      <div className="flex-grow-1">

        <TopbarMecanico
          setVista={setVistaMecanico}
          usuario={usuario}
        />

        <main className="p-4">

          {vistaMecanico === "inventario" && <Inventario />}


          {vistaMecanico === "mismantenimientos"  && <MisMantenimientos/>}

          {vistaMecanico === "categoriasbrindaje" && <CategoriasBrindajes/>}

          {vistaMecanico === "perfil" && (
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

export default MecanicoDashboard;