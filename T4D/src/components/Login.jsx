import { useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../supabase/supabaseClient";
import imagen3 from "../assets/imagen10.png";
import escudoLogo from "../assets/escudo1.png";
import SessionTimeout from "../components/SessionTimeout";

const C = {
  cardBg:      "rgba(14,22,33,0.45)",
  cardBorder:  "rgba(184,155,106,0.30)",
  titulo:      "#ffffff",
  dorado:      "#b89b6a",
  doradoClaro: "#c9a84c",
  doradoOsc:   "#8B6914",
  inputBg:     "#1a2336",
  inputBorder: "#2d3a52",
  inputTxt:    "#c5cfe0",
  placeholder: "#4e6080",
  labelTxt:    "#9ab0c8",
};

function Login({ setVista, setUsuario }) {
  const [correo,   setCorreo]   = useState("");
  const [password, setPassword] = useState("");
  const [codigo,   setCodigo]   = useState("");
  const [showPass, setShowPass] = useState(false);

  const normalizarRol = (rol) =>
    rol?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const manejarLogin = async (e) => {
    e.preventDefault();
    if (!correo || !password || !codigo)
      return Swal.fire({ icon: "warning", title: "Campos vacíos", text: "Completa todos los campos" });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });
      if (error) return Swal.fire({ icon: "error", title: "Error", text: "Correo o contraseña incorrectos" });

      const { data: usuarioBD, error: errorUsuario } = await supabase
        .from("usuarios").select("*").eq("email", correo).single();
      if (errorUsuario || !usuarioBD)
        return Swal.fire({ icon: "error", title: "Error", text: "Usuario no encontrado" });
      if (!usuarioBD.activo)
        return Swal.fire({ icon: "warning", title: "Cuenta deshabilitada", text: "Contacta al administrador" });
      if (usuarioBD.codigo !== codigo)
        return Swal.fire({ icon: "error", title: "Código incorrecto", text: "El código de verificación no coincide" });

      let rolReal = "";
      switch (usuarioBD.id_rol) {
        case 1: rolReal = "Admin";     break;
        case 2: rolReal = "Contadora"; break;
        case 3: rolReal = "Gerente";   break;
        case 4: rolReal = "Mecanico";  break;
        default: rolReal = usuarioBD.rol || "Usuario";
      }
      const rolFinal = normalizarRol(rolReal) || "usuario";
      const usuarioAdaptado = { ...usuarioBD, nombre: usuarioBD.username || "Usuario", correo: usuarioBD.email || "", rol: rolFinal, id_usuario: usuarioBD.id_usuario, username: usuarioBD.username };

      localStorage.setItem("usuario", JSON.stringify(usuarioAdaptado));
      localStorage.setItem("token", data.session.access_token);
      if (setUsuario) setUsuario(usuarioAdaptado);

      await Swal.fire({ icon: "success", title: "Inicio exitoso", text: `Bienvenido ${usuarioBD.username}`, timer: 1500, showConfirmButton: false });

      if      (rolFinal === "admin")                                setVista("admin");
      else if (rolFinal === "contador" || rolFinal === "contadora") setVista("contadora");
      else if (rolFinal === "gerente")                              setVista("gerente");
      else if (rolFinal === "mecanico")                             setVista("mecanico");
      else                                                          setVista("home");

    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error de conexión", text: "No conecta con Supabase" });
    }
  };

  const inputStyle = {
    background: C.inputBg, border: `1px solid ${C.inputBorder}`, color: C.inputTxt,
    borderRadius: "10px", fontSize: "14px", padding: "11px 14px 11px 42px",
    width: "100%", outline: "none", transition: "border 0.2s",
  };
  const labelStyle = {
    color: C.labelTxt, fontSize: "13px", fontWeight: 600, marginBottom: "6px",
    display: "flex", alignItems: "center", gap: "7px",
  };
  const iconWrap = {
    position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)",
    color: C.dorado, display: "flex",
  };

  const IconPersona = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.dorado} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
  const IconCandado = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.dorado} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
  const IconEscudo = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.dorado} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ position: "relative", overflow: "hidden" }}>
      {/* Fondo nítido */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${imagen3})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", filter: "blur(0px) brightness(1.1)", transform: "scale(1.10)", zIndex: 0 }} />
      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(5,10,22,0.25)", zIndex: 1 }} />

      {/* Card */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ width: "400px", background: C.cardBg, border: "none", borderRadius: "18px", padding: "36px 32px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>

          {/* LOGO */}
          <div className="text-center mb-3">
            <img src={escudoLogo} alt="T4D Logo" style={{ width: "110px", height: "110px", objectFit: "contain", filter: "drop-shadow(0 4px 18px rgba(184,155,106,0.45))" }} />
          </div>

          {/* TÍTULO — blanco grande */}
          <h5 className="text-center fw-bold mb-1" style={{ color: C.titulo, fontSize: "18px", letterSpacing: "1.2px" }}>
            TECHNOLOGY FOR DEFENSE S.A.S.
          </h5>

          {/* SUBTÍTULO con líneas doradas — separado y más grande */}
          <div className="d-flex align-items-center justify-content-center gap-2 mb-4" style={{ marginTop: "10px" }}>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, transparent, ${C.dorado})` }} />
            <span style={{ color: C.dorado, fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
              Sistema de Control de Inventario
            </span>
            <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left, transparent, ${C.dorado})` }} />
          </div>

          {/* FORM */}
          <form onSubmit={manejarLogin}>

            {/* CORREO */}
            <div className="mb-3">
              <label style={labelStyle}><IconPersona /> Correo electrónico</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><IconPersona /></span>
                <input type="email" placeholder="Ingrese su correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = C.dorado)}
                  onBlur={(e)  => (e.target.style.borderColor = C.inputBorder)} />
              </div>
            </div>

            {/* CONTRASEÑA */}
            <div className="mb-3">
              <label style={labelStyle}><IconCandado /> Contraseña</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><IconCandado /></span>
                <input type={showPass ? "text" : "password"} placeholder="Ingrese su contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: "42px" }}
                  onFocus={(e) => (e.target.style.borderColor = C.dorado)}
                  onBlur={(e)  => (e.target.style.borderColor = C.inputBorder)} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.dorado, padding: 0, display: "flex" }}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* CÓDIGO */}
            <div className="mb-4">
              <label style={labelStyle}><IconEscudo /> Código de verificación</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><IconEscudo /></span>
                <input type="text" placeholder="Ingrese el código de verificación" value={codigo} onChange={(e) => setCodigo(e.target.value)} style={{ ...inputStyle, paddingRight: "42px", letterSpacing: "3px" }}
                  onFocus={(e) => (e.target.style.borderColor = C.dorado)}
                  onBlur={(e)  => (e.target.style.borderColor = C.inputBorder)} />
              </div>
              <small style={{ color: C.placeholder, fontSize: "12px", marginTop: "4px", display: "block" }}>Código enviado a tu correo</small>
            </div>

            {/* BOTÓN */}
            <button type="submit"
              style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${C.doradoClaro} 0%, ${C.doradoOsc} 100%)`, color: "#fff", fontWeight: 700, fontSize: "15px", letterSpacing: "0.5px", cursor: "pointer", boxShadow: "0 4px 18px rgba(184,155,106,0.35)", transition: "opacity 0.2s, transform 0.1s" }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1";   e.currentTarget.style.transform = "translateY(0)"; }}>
              Iniciar sesión
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;