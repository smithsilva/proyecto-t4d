import { useState } from "react";
import escudoLogo from "../../assets/escudo1.png";

function SidebarContadora({ setVistaContadora, vistaContadora }) {
  const [abierto, setAbierto] = useState(true);

  const NAVY           = "#0d1b2a";
  const DORADO         = "#c9a25a";
  const DORADO_SUAVE   = "#b89b6a";
  const DORADO_OSCURO  = "#8a6a35";
  const TEXTO_INACTIVO = "#9aa5b1";

  const getButtonStyle = (vista) => ({
    background:   vistaContadora === vista
      ? `linear-gradient(90deg, ${DORADO}, ${DORADO_OSCURO})`
      : "transparent",
    color:        vistaContadora === vista ? "#1a1a1a" : TEXTO_INACTIVO,
    fontSize:     "13px",
    fontWeight:   vistaContadora === vista ? 700 : 500,
    padding:      "9px 12px",
    border:       "none",
    transition:   "0.25s",
    borderRadius: "50px",
    boxShadow:    vistaContadora === vista ? "0 2px 8px rgba(0,0,0,0.25)" : "none",
    width:        "100%",
    textAlign:    "left",
    display:      "flex",
    alignItems:   "center",
    gap:          "8px",
    cursor:       "pointer",
  });

  const menuItems = [
    { key: "inventario",          icon: "bi-box-seam",        label: "Inventario"           },
    { key: "movimientoscontables",icon: "bi-currency-dollar",  label: "Movimientos Contables" },
    { key: "metodospago",         icon: "bi-credit-card",      label: "Métodos de Pago"      },
    { key: "historialprecios",    icon: "bi-graph-up",         label: "Historial Precios"    },
    { key: "proveedores",         icon: "bi-people",           label: "Proveedores"          },
    { key: "empleados",           icon: "bi-person",           label: "Empleados"            },
    { key: "sucursales",          icon: "bi-building",         label: "Sucursales"           },
    { key: "reportes",            icon: "bi-bar-chart",        label: "Reportes"             },
  ];

  return (
    <div
      style={{
        width:           abierto ? "220px" : "60px",
        minWidth:        abierto ? "220px" : "60px",
        maxWidth:        abierto ? "220px" : "60px",
        minHeight:       "100vh",
        backgroundColor: NAVY,
        borderRight:     `1px solid ${DORADO}33`,
        transition:      "width 0.3s, min-width 0.3s, max-width 0.3s",
        display:         "flex",
        flexDirection:   "column",
        overflow:        "hidden",
        flexShrink:      0,
      }}
    >
      <div style={{ padding: "10px 8px 0" }}>

        {/* TOGGLE */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "6px" }}>
          <button
            onClick={() => setAbierto(!abierto)}
            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "16px", color: DORADO_SUAVE }}
          >
            {abierto ? "⮜" : "⮞"}
          </button>
        </div>

        {/* ── LOGO + TEXTOS ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
          <img
            src={escudoLogo}
            alt="Logo T4D"
            style={{
              width:        abierto ? "52px" : "36px",
              height:       abierto ? "52px" : "36px",
              objectFit:    "contain",
              filter:       "drop-shadow(0 2px 6px rgba(201,162,90,0.4))",
              transition:   "0.3s",
              marginBottom: abierto ? "8px" : "0",
            }}
          />

          {abierto && (
            <div style={{ lineHeight: 1.3, textAlign: "center" }}>
              <div style={{ color: "#ffffff", fontWeight: 800, fontSize: "15px", letterSpacing: "1px" }}>
                T4D
              </div>
              <div style={{ color: DORADO_SUAVE, fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px", marginTop: "3px" }}>
                TECHNOLOGY FOR DEFENSE SAS
              </div>
            </div>
          )}
        </div>

        {/* ── MENÚ ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setVistaContadora(item.key)}
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
              <i className={`bi ${item.icon}`} style={{ fontSize: "17px", flexShrink: 0 }} />
              {abierto && <span style={{ whiteSpace: "nowrap", fontSize: "13px" }}>{item.label}</span>}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

export default SidebarContadora;