import { useState } from "react";
import escudoLogo from "../../assets/escudo1.png";
import vehiculoBlindado from "../../assets/imagen11.png";

function SidebarGerente({ setVistaGerente, vistaGerente }) {
  const [abierto, setAbierto] = useState(true);

  const NAVY           = "#0d1b2a";
  const NAVY_OSCURO    = "#091420";
  const DORADO         = "#c9a25a";
  const DORADO_SUAVE   = "#b89b6a";
  const DORADO_OSCURO  = "#8a6a35";
  const TEXTO_INACTIVO = "#9aa5b1";

  const getButtonStyle = (vista) => ({
    background:      vistaGerente === vista
      ? `linear-gradient(90deg, ${DORADO}, ${DORADO_OSCURO})`
      : "transparent",
    color:           vistaGerente === vista ? "#1a1a1a" : TEXTO_INACTIVO,
    fontSize:        "15px",
    fontWeight:      vistaGerente === vista ? 700 : 500,
    padding:         "11px 14px",
    border:          "none",
    transition:      "0.25s",
    borderRadius:    "50px",
    boxShadow:       vistaGerente === vista ? "0 2px 8px rgba(0,0,0,0.25)" : "none",
  });

  const menuItems = [
    { key: "inventario",         icon: "bi-box-seam",        label: "Inventario" },
    { key: "movimientos",        icon: "bi-arrow-left-right", label: "Movimientos" },
    { key: "notificaciones",     icon: "bi-bell",             label: "Notificaciones" },
    { key: "asignacion-tareas",  icon: "bi-clipboard-check",  label: "Asignación de Tareas" },
    { key: "cliente",            icon: "bi-person",           label: "Cliente" },
    { key: "direcciones-cliente",icon: "bi-geo-alt",          label: "Direcciones-Cliente" },
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
        justifyContent:  "space-between",
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
          {/* Escudo */}
          <img
            src={escudoLogo}
            alt="Logo T4D"
            style={{
              width:      abierto ? "72px" : "44px",
              height:     abierto ? "72px" : "44px",
              objectFit:  "contain",
              filter:     "drop-shadow(0 2px 8px rgba(201,162,90,0.45))",
              transition: "0.3s",
              marginBottom: abierto ? "10px" : "0",
            }}
          />

          {/* Nombre empresa — debajo del logo, centrado */}
          {abierto && (
            <div style={{ lineHeight: 1.3, textAlign: "center" }}>
              {/* Título blanco */}
              <div style={{ color: "#ffffff", fontWeight: 800, fontSize: "20px", letterSpacing: "1px" }}>
                DEFENSA ÉLITE
              </div>
              {/* Subtítulo dorado debajo, un poco más grande */}
              <div style={{ color: DORADO_SUAVE, fontSize: "14px", fontWeight: 600, letterSpacing: "0.8px", marginTop: "4px" }}>
                TECNOLOGÍA · PROTECCIÓN · SUPREMACÍA
              </div>
            </div>
          )}
        </div>

        {/* ── MENÚ ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setVistaGerente(item.key)}
              className="btn text-start d-flex align-items-center gap-2"
              style={getButtonStyle(item.key)}
              onMouseEnter={(e) => {
                if (vistaGerente !== item.key) {
                  e.currentTarget.style.backgroundColor = `${DORADO}1a`;
                  e.currentTarget.style.color = DORADO_SUAVE;
                }
              }}
              onMouseLeave={(e) => {
                if (vistaGerente !== item.key) {
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

      {/* ── IMAGEN VEHÍCULO AL PIE ── */}
      <div
        style={{
          margin:          "12px 10px 12px",
          borderRadius:    "12px",
          overflow:        "hidden",
          border:          `1px solid ${DORADO}33`,
          backgroundColor: NAVY_OSCURO,
          position:        "relative",
          flexShrink:      0,
        }}
      >
        <img
          src={vehiculoBlindado}
          alt="Vehículo blindado"
          style={{
            width:          "100%",
            height:         abierto ? "230px" : "90px",
            objectFit:      "cover",
            objectPosition: "center 35%",
            display:        "block",
            transition:     "height 0.3s",
            filter:         "brightness(1.05) contrast(1.05) saturate(1.1)",
          }}
        />
        {/* Degradado oscuro solo en la franja inferior, deja el vehículo nítido arriba */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${NAVY_OSCURO}f5 0%, ${NAVY_OSCURO}99 18%, transparent 45%)`, pointerEvents: "none" }} />

        {/* Texto sobre la imagen (solo cuando está abierto) */}
        {abierto && (
          <div style={{
            position:      "absolute",
            bottom:        0, left: 0, right: 0,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           "4px",
            color:         DORADO,
            fontSize:      "12px",
            fontWeight:    700,
            letterSpacing: "0.5px",
            padding:       "0 12px 12px",
            textAlign:     "center",
          }}>
            <i className="bi bi-star-fill" style={{ fontSize: "13px" }}></i>
            <span>SISTEMA INTEGRADO<br />DE DEFENSA</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SidebarGerente;