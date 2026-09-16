import { useState } from "react";
import { restablecerContrasena } from "../api/authApi";
import imagen3 from "../assets/imagen10.png";

const DORADO           = "#d4a743";
const DORADO_OSCURO    = "#8c6b3f";
const DORADO_CLARO     = "#e7c98a";
const ENCABEZADO       = "#13202e";

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
  subtitulo:   "#8a9bb5",
};

const IconCandado = ({ size = 15, color = DORADO }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// token viene como prop, extraído en App.jsx desde la URL (?token=...)
const ResetPassword = ({ token, setVista }) => {
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

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
    color: "#9ab0c8",
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

  const botonPrincipal = {
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: `linear-gradient(135deg, ${C.doradoClaro} 0%, ${C.doradoOsc} 100%)`,
    color: "#fff",
    fontWeight: 700,
    fontSize: "15px",
    letterSpacing: "0.3px",
    cursor: "pointer",
    boxShadow: "0 4px 18px rgba(184,155,106,0.35)",
    marginTop: "8px",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("El enlace no es válido. Solicita uno nuevo.");
      return;
    }
    if (nuevaPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);
    try {
      await restablecerContrasena(token, nuevaPassword);
      setExito(true);
      setTimeout(() => {
        window.history.replaceState({}, "", "/");
        setVista("home");
      }, 3000);
    } catch (err) {
      setError(err.message || "El enlace es inválido o ha expirado");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ position: "relative", overflow: "hidden" }}>
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
        <h5 className="fw-bold mb-2" style={{ color: C.titulo, fontSize: "18px" }}>
          Restablecer contraseña
        </h5>
        <div
          style={{
            height: "2px",
            width: "48px",
            background: `linear-gradient(to right, ${C.doradoClaro}, ${C.doradoOsc})`,
            marginBottom: "14px",
            borderRadius: "2px",
          }}
        />

        {!token ? (
          <>
            <p style={{ color: C.subtitulo, fontSize: "13.5px", lineHeight: 1.5 }}>
              Este enlace de recuperación no es válido. Solicita uno nuevo desde
              la pantalla de inicio de sesión.
            </p>
            <button type="button" onClick={() => setVista("home")} style={botonPrincipal}>
              Volver al inicio de sesión
            </button>
          </>
        ) : exito ? (
          <p style={{ color: C.subtitulo, fontSize: "13.5px", lineHeight: 1.5 }}>
            Tu contraseña fue actualizada correctamente. Serás redirigido al
            inicio de sesión en unos segundos...
          </p>
        ) : (
          <>
            <p style={{ color: C.subtitulo, fontSize: "13.5px", lineHeight: 1.5, marginBottom: "18px" }}>
              Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label style={labelStyle}><IconCandado /> Nueva contraseña</label>
                <div style={{ position: "relative" }}>
                  <span style={iconWrap}><IconCandado /></span>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    style={inputStyle}
                    required
                    onFocus={(e) => (e.target.style.borderColor = C.dorado)}
                    onBlur={(e) => (e.target.style.borderColor = C.inputBorder)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label style={labelStyle}><IconCandado /> Confirmar contraseña</label>
                <div style={{ position: "relative" }}>
                  <span style={iconWrap}><IconCandado /></span>
                  <input
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    style={inputStyle}
                    required
                    onFocus={(e) => (e.target.style.borderColor = C.dorado)}
                    onBlur={(e) => (e.target.style.borderColor = C.inputBorder)}
                  />
                </div>
              </div>

              {error && (
                <p style={{ color: "#e07a7a", fontSize: "12.5px", marginBottom: "6px" }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={cargando} style={{ ...botonPrincipal, opacity: cargando ? 0.7 : 1 }}>
                {cargando ? "Actualizando..." : "Restablecer contraseña"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;