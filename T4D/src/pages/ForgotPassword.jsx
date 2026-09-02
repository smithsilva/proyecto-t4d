import { useState } from "react";
import { solicitarRecuperacion } from "../api/authApi";
import imagen3 from "../assets/imagen10.png";

const DORADO           = "#d4a743";
const DORADO_OSCURO    = "#8c6b3f";
const DORADO_CLARO     = "#e7c98a";
const FONDO            = "#f7f1e3";
const ENCABEZADO       = "#13202e";
const TEXTO_ENCABEZADO = "#e7c98a";

const C = {
  cardBg:      "rgba(14,22,33,0.92)",
  cardBorder:  "rgba(184,155,106,0.30)",
  titulo:      "#ffffff",
  dorado:      DORADO,
  doradoClaro: DORADO_CLARO,
  doradoOsc:   DORADO_OSCURO,
  inputBg:     "#1a2336",
  inputBorder: "#2d3a52",
  inputTxt:    "#c5cfe0",
  placeholder: "#4e6080",
  labelTxt:    "#9ab0c8",
  subtitulo:   "#8a9bb5",
};

const IconSobre = ({ size = 15, color = DORADO }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </svg>
);

const ForgotPassword = ({ setVista }) => {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await solicitarRecuperacion(email);
      setEnviado(true);
    } catch (err) {
      setError(err.message || "Ocurrió un error, intenta de nuevo");
    } finally {
      setCargando(false);
    }
  };

  const inputStyle = {
    background: C.inputBg,
    border: `1px solid ${C.inputBorder}`,
    color: C.inputTxt,
    borderRadius: "10px",
    fontSize: "14px",
    padding: "11px 14px 11px 42px",
    width: "100%",
    outline: "none",
    transition: "border 0.2s",
  };

  const labelStyle = {
    color: C.labelTxt,
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  };

  const iconWrap = {
    position: "absolute",
    left: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    color: C.dorado,
    display: "flex",
  };

  const botonCancelar = {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: `1px solid ${C.inputBorder}`,
    background: "transparent",
    color: C.inputTxt,
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s",
  };

  const botonEnviar = {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: `linear-gradient(135deg, ${C.doradoClaro} 0%, ${C.doradoOsc} 100%)`,
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    letterSpacing: "0.3px",
    cursor: "pointer",
    boxShadow: "0 4px 18px rgba(184,155,106,0.35)",
    opacity: cargandoOpacity(cargando),
  };

  function cargandoOpacity(c) {
    return c ? 0.7 : 1;
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Fondo con imagen, igual que Login */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${imagen3})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(0px) brightness(1.1)",
          transform: "scale(1.10)",
          zIndex: 0,
        }}
      />
      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(5,10,22,0.25)", zIndex: 1 }} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "400px",
          background: C.cardBg,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: "18px",
          padding: "32px 30px 28px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      >
        {/* ENCABEZADO CON ÍCONO Y TÍTULO */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="fw-bold mb-0" style={{ color: C.titulo, fontSize: "18px" }}>
            Restablecer contraseña
          </h5>
          <button
            type="button"
            onClick={() => setVista("home")}
            style={{
              background: "none",
              border: "none",
              color: C.subtitulo,
              fontSize: "18px",
              lineHeight: 1,
              cursor: "pointer",
              padding: 0,
            }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* LÍNEA DORADA DEBAJO DEL TÍTULO */}
        <div
          style={{
            height: "2px",
            width: "48px",
            background: `linear-gradient(to right, ${C.doradoClaro}, ${C.doradoOsc})`,
            marginBottom: "14px",
            borderRadius: "2px",
          }}
        />

        {enviado ? (
          <>
            <p style={{ color: C.subtitulo, fontSize: "13.5px", lineHeight: 1.5 }}>
              Si el correo existe en nuestro sistema, se ha enviado un enlace
              de recuperación. Revisa tu bandeja de entrada (y la carpeta de
              spam).
            </p>
            <button
              type="button"
              onClick={() => setVista("home")}
              style={{ ...botonEnviar, width: "100%" }}
            >
              Volver al inicio de sesión
            </button>
          </>
        ) : (
          <>
            <p style={{ color: C.subtitulo, fontSize: "13.5px", lineHeight: 1.5, marginBottom: "18px" }}>
              Ingresa el correo electrónico de tu cuenta. Te enviaremos un
              enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label style={labelStyle}>
                  <IconSobre /> Correo electrónico
                </label>
                <div style={{ position: "relative" }}>
                  <span style={iconWrap}>
                    <IconSobre />
                  </span>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    required
                    onFocus={(e) => (e.target.style.borderColor = C.dorado)}
                    onBlur={(e) => (e.target.style.borderColor = C.inputBorder)}
                  />
                </div>
              </div>

              {error && (
                <p style={{ color: "#e07a7a", fontSize: "12.5px", marginBottom: "10px" }}>
                  {error}
                </p>
              )}

              <div className="d-flex gap-2 mt-3">
                <button type="button" onClick={() => setVista("home")} style={botonCancelar}>
                  Cancelar
                </button>
                <button type="submit" disabled={cargando} style={botonEnviar}>
                  {cargando ? "Enviando..." : "Enviar enlace"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;