import { useState } from "react";
import escudoLogo from "../../assets/escudo1.png";

function SidebarContadora({ setVistaContadora, vistaContadora }) {
  const [abierto, setAbierto] = useState(true);

  const NAVY           = "#0d1b2a";
  const NAVY_OSCURO    = "#091420";
  const DORADO         = "#c9a25a";
  const DORADO_SUAVE   = "#b89b6a";
  const DORADO_OSCURO  = "#8a6a35";
  const TEXTO_INACTIVO = "#9aa5b1";

  const getButtonStyle = (vista) => ({
    background:      vistaContadora === vista
      ? `linear-gradient(90deg, ${DORADO}, ${DORADO_OSCURO})`
      : "transparent",
    color:           vistaContadora === vista ? "#1a1a1a" : TEXTO_INACTIVO,
    fontSize:        "15px",
    fontWeight:      vistaContadora === vista ? 700 : 500,
    padding:         "11px 14px",
    border:          "none",
    transition:      "0.25s",
    borderRadius:    "50px",
    boxShadow:       vistaContadora === vista ? "0 2px 8px rgba(0,0,0,0.25)" : "none",
  });

  const menuItems = [
          { key: "inventario", icon: "bi-box-seam", label: "Inventario"},
          { key: "movimientoscontables", icon: "bi-currency-dollar", label: "Movimientos Contables"},
          { key: "metodospago", icon: "bi-credit-card", label: "MetodosPago"},
          { key: "historialprecios", icon: "bi-graph-up", label: "HistorialPrecios"},
          { key: "proveedores", icon: "bi-people", label: "Proveedores"},
          { key: "empleados", icon: "bi-person", label: "Empleados"},
          { key: "sucursales", icon: "bi-building", label: "Sucursales"},
          { key: "reportes", icon: "bi-graph-up", label: "Reportes"},
  ];

  return (
    <div
      style={{
        width:           abierto ? "280px" : "70px",
        minHeight:       "100vh",
        backgroundColor: NAVY,
        borderRight:     `1px solid ${DORADO}33`,
        transition:      "width 0.3s",
        display:         "flex",
        flexDirection:   "column",
        overflow:        "hidden",
      }}
    >
      <div style={{ padding: "12px 10px 0" }}>

        {/* TOGGLE */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
          <button
            onClick={() => setAbierto(!abierto)}
            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "18px", color: DORADO_SUAVE }}
          >
            {abierto ? "⮜" : "⮞"}
          </button>
        </div>

        {/* ── LOGO + TEXTOS DEBAJO ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px", paddingLeft: "0" }}>
          <img
            src={escudoLogo}
            alt="Logo T4D"
            style={{
              width:        abierto ? "72px" : "44px",
              height:       abierto ? "72px" : "44px",
              objectFit:    "contain",
              filter:       "drop-shadow(0 2px 8px rgba(201,162,90,0.45))",
              transition:   "0.3s",
              marginBottom: abierto ? "10px" : "0",
            }}
          />

          {abierto && (
            <div style={{ lineHeight: 1.3, textAlign: "center" }}>
              <div style={{ color: "#ffffff", fontWeight: 800, fontSize: "20px", letterSpacing: "1px" }}>
                T4D
              </div>
              <div style={{ color: DORADO_SUAVE, fontSize: "14px", fontWeight: 600, letterSpacing: "0.8px", marginTop: "4px" }}>
                TECHNOLOGY FOR DEFENSE SAS 
              </div>
            </div>
          )}
        </div>

        {/* ── MENÚ ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setVistaContadora(item.key)}
              className="btn text-start d-flex align-items-center gap-2"
              style={getButtonStyle(item.key)}
              onMouseEnter={(e) => {
                if (vistaContadora !== item.key) {
                  e.currentTarget.style.backgroundColor = `${DORADO}1a`;
                  e.currentTarget.style.color = DORADO_SUAVE;
                }
              }}
              onMouseLeave={(e) => {
                if (vistaContadora !== item.key) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = TEXTO_INACTIVO;
                }
              }}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: "20px", flexShrink: 0 }}></i>
              {abierto && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SidebarContadora;