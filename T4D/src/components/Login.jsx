import { useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../supabase/supabaseClient";
import imagen3 from "../assets/imagen3.jpg";

function Login({ setVista, setUsuario }) {

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");

  const normalizarRol = (rol) => {
    return rol
      ?.toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const manejarLogin = async (e) => {
    e.preventDefault();

    if (!correo || !password || !codigo) {
      return Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Completa todos los campos",
      });
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: correo,
        password: password,
      });

      if (error) {
        console.log(error);
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "Correo o contraseña incorrectos",
        });
      }

      const { data: usuarioBD, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", correo)
        .single();

      if (errorUsuario || !usuarioBD) {
        console.log(errorUsuario);
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "Usuario no encontrado",
        });
      }

      if (!usuarioBD.activo) {
        return Swal.fire({
          icon: "warning",
          title: "Cuenta deshabilitada",
          text: "Contacta al administrador",
        });
      }

      if (usuarioBD.codigo !== codigo) {
        return Swal.fire({
          icon: "error",
          title: "Código incorrecto",
          text: "El código de verificación no coincide",
        });
      }

      let rolReal = "";
      switch (usuarioBD.id_rol) {
        case 1: rolReal = "Admin"; break;
        case 2: rolReal = "Contadora"; break;
        case 3: rolReal = "Gerente"; break;
        case 4: rolReal = "Mecanico"; break;
        default: rolReal = usuarioBD.rol || "Usuario";
      }

      const rolNormalizado = normalizarRol(rolReal);
      const rolFinal = rolNormalizado || "usuario";

      // =========================================
      // USUARIO — se conservan TODOS los campos
      // de Supabase (id_usuario, username, etc.)
      // y se agregan los campos del perfil encima
      // =========================================
      const usuarioAdaptado = {
        ...usuarioBD,                              // id_usuario, username, email, rol, etc.
        nombre:    usuarioBD.username || "Usuario",
        correo:    usuarioBD.email    || "",
        rol:       rolFinal,
        id_usuario: usuarioBD.id_usuario,          // explícito por seguridad
        username:   usuarioBD.username,            // explícito por seguridad
      };

      localStorage.setItem("usuario", JSON.stringify(usuarioAdaptado));
      localStorage.setItem("token", data.session.access_token);

      if (setUsuario) setUsuario(usuarioAdaptado);

      await Swal.fire({
        icon: "success",
        title: "Inicio exitoso",
        text: `Bienvenido ${usuarioBD.username}`,
        timer: 1500,
        showConfirmButton: false,
      });

      if (rolFinal === "admin") {
        setVista("admin");
      } else if (rolFinal === "contador" || rolFinal === "contadora") {
        setVista("contadora");
      } else if (rolFinal === "gerente") {
        setVista("gerente");
      } else if (rolFinal === "mecanico") {
        setVista("mecanico");
      } else {
        setVista("home");
      }

    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No conecta con Supabase",
      });
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)),
          url(${imagen3})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="p-4 rounded-4 shadow"
        style={{
          width: "380px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {/* LOGO */}
        <div className="text-center mb-3">
          <div
            className="fw-bold d-inline-block px-3 py-2 rounded-3"
            style={{ backgroundColor: "#B89B6A", color: "#fff" }}
          >
            T4D
          </div>
        </div>

        {/* TITULO */}
        <h6 className="text-center fw-bold" style={{ color: "#fff" }}>
          TECHNOLOGY FOR DEFENSE SAS.
        </h6>
        <p className="text-center small" style={{ color: "#d1d5db" }}>
          Sistema de Control de Inventario
        </p>

        <div className="text-center my-3">
          <h5 className="fw-bold mb-1" style={{ color: "#fff" }}>
            Iniciar sesión
          </h5>
          <div
            style={{
              width: "40px",
              height: "3px",
              backgroundColor: "#B89B6A",
              margin: "0 auto",
              borderRadius: "10px",
            }}
          />
        </div>

        {/* FORM */}
        <form onSubmit={manejarLogin}>

          {/* CORREO */}
          <div className="mb-2">
            <label className="form-label small" style={{ color: "#fff" }}>
              Correo electrónico
            </label>
            <input
              type="email"
              className="form-control rounded-pill"
              placeholder="usuario@empresa.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-2">
            <label className="form-label small" style={{ color: "#fff" }}>
              Contraseña
            </label>
            <input
              type="password"
              className="form-control rounded-pill"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            />
          </div>

          {/* CODIGO */}
          <div className="mb-2">
            <label className="form-label small" style={{ color: "#fff" }}>
              Código de verificación
            </label>
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Ingresa el código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
              }}
            />
            <small style={{ color: "#d1d5db" }}>Código enviado a tu correo</small>
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            className="btn w-100 mt-3 rounded-pill"
            style={{
              backgroundColor: "#B89B6A",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
            }}
          >
            Iniciar sesión
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;