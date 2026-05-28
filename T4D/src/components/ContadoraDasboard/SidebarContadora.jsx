import { useState } from "react";

function SidebarContadora({ setVistaContadora, vistaContadora }) {
  const [abierto, setAbierto] = useState(true);

  const getButtonStyle = (vista) => ({
    backgroundColor: vistaContadora === vista ? "#8c6b3f" : "transparent",
    color: vistaContadora === vista ? "#fff" : "#cfcfcf",
    fontSize: "14px",
    padding: "8px 12px",
    border: "none",
    transition: "0.3s",
  });

  return (
    <div
      style={{
        width: abierto ? "200px" : "60px",
        minHeight: "100vh",
        backgroundColor: "#0b0b0b",
        borderRight: "1px solid #8c6b3f",
        transition: "0.3s",
      }}
      className="p-2"
    >
      {/* TOGGLE */}
      <div className="d-flex justify-content-end mb-2">
        <button
          onClick={() => setAbierto(!abierto)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "18px",
            color: "#b89b6a",
          }}
        >
          {abierto ? "⮜" : "⮞"}
        </button>
      </div>

      {/* LOGO */}
      <div className="mb-3 d-flex align-items-center gap-2">
        <div
          className="rounded-circle d-flex justify-content-center align-items-center fw-bold"
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "#8c6b3f",
            color: "#fff",
            fontSize: "13px",
          }}
        >
          T4D
        </div>

        {abierto && (
          <span className="fw-bold" style={{ fontSize: "14px", color: "#fff" }}>
            Technology for Defense
          </span>
        )}
      </div>

      {/* MENÚ */}
      <div className="d-flex flex-column gap-1">

        {[
          
          { key: "movimientoscontables", icon: "bi-currency-dollar", label: "Movimientos Contables"},
          { key: "metodospago", icon: "bi-credit-card", label: "MetodosPago"},
          { key: "historialprecios", icon: "bi-graph-up", label: "HistorialPrecios"},
          { key: "proveedores", icon: "bi-people", label: "Proveedores"},
          { key: "empleados", icon: "bi-person", label: "Empleados"},
          { key: "sucursales", icon: "bi-building", label: "Sucursales"},
          
          
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setVistaContadora(item.key)}
            className="btn text-start rounded-pill d-flex align-items-center gap-2"
            style={getButtonStyle(item.key)}
            onMouseEnter={(e) => {
              if (vistaContadora !== item.key) {
                e.currentTarget.style.backgroundColor = "#1a1a1a";
                e.currentTarget.style.color = "#b89b6a";
              }
            }}
            onMouseLeave={(e) => {
              if (vistaContadora !== item.key) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#cfcfcf";
              }
            }}
          >
            <i className={`bi ${item.icon}`} style={{ fontSize: "16px" }}></i>
            {abierto && item.label}
          </button>
        ))}

      </div>
    </div>
  );
}

export default SidebarContadora;