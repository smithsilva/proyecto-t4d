import { useState } from "react";
import Swal from "sweetalert2";
import { User, Mail, Lock, Shield, UserPlus } from "lucide-react";
import { supabase } from "../../supabase/supabaseClient";

// =========================================
// PALETA (igual a Inventario.jsx)
// =========================================
const DORADO = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO = "#e7c98a";
const FONDO = "#f7f1e3";
const ENCABEZADO = "#13202e";
const TEXTO_ENCABEZADO = "#e7c98a";

// =========================================
// COMPONENTE INPUT
// =========================================
const Input = ({ label, icon, ...props }) => (
  <div>
    <label
      style={{
        fontSize: "12px",
        fontWeight: 600,
        color: DORADO_OSCURO,
        marginBottom: "4px",
        display: "block",
      }}
    >
      {label}
    </label>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `1px solid ${DORADO_CLARO}`,
        borderRadius: "20px",
        padding: "9px 14px",
        background: "#fffdf8",
      }}
    >
      <div style={{ color: DORADO_OSCURO, display: "flex" }}>{icon}</div>
      <input
        {...props}
        placeholder={label}
        style={{
          border: "none",
          outline: "none",
          marginLeft: "8px",
          width: "100%",
          fontSize: "13px",
          background: "transparent",
        }}
      />
    </div>
  </div>
);

// =========================================
// COMPONENTE PRINCIPAL
// =========================================
function RegistroUsuarios() {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmar: "",
    rol: "",
  });

  const [cargando, setCargando] = useState(false);

  // =========================
  // GENERAR CÓDIGO
  // =========================
  const generarCodigo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // =========================
  // REGISTRAR USUARIO
  // =========================
  const manejarRegistro = async () => {
    if (!form.nombre || !form.correo || !form.password || !form.confirmar || !form.rol) {
      return Swal.fire("Error", "Completa todos los campos", "error");
    }
    if (form.password.length < 6) {
      return Swal.fire("Error", "La contraseña debe tener mínimo 6 caracteres", "error");
    }
    if (form.password !== form.confirmar) {
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    }

    setCargando(true);

    try {
      const codigo = generarCodigo();

      // PASO 1 — BUSCAR ID DEL ROL
      const { data: rolData, error: rolError } = await supabase
        .from("roles")
        .select("id_rol, nombre_rol")
        .eq("nombre_rol", form.rol)
        .single();

      if (rolError || !rolData) {
        throw new Error(`No se encontró el rol "${form.rol}" en la tabla roles`);
      }

      // PASO 2 — CREAR EN SUPABASE AUTH (Email + Password)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.correo,
        password: form.password,
        options: {
          data: {
            username: form.nombre,
            rol: form.rol,
          },
        },
      });

      if (authError) throw authError;

      const auth_id = authData.user?.id;
      if (!auth_id) {
        throw new Error("No se pudo obtener el ID de autenticación");
      }

      // PASO 3 — INSERTAR EN LA TABLA USUARIOS
      const { error: insertError } = await supabase
        .from("usuarios")
        .insert([
          {
            username: form.nombre,
            email: form.correo,
            auth_id: auth_id,
            codigo: codigo,
            activo: true,
            id_rol: rolData.id_rol,
          },
        ]);

      if (insertError) {
        // Evitamos dejar usuarios huérfanos en Auth si falla la inserción en BD
        await supabase.auth.admin.deleteUser(auth_id).catch(() => {});
        throw insertError;
      }

      // PASO 4 — ENVIAR CORREO (No bloquea el registro si el servidor de correos falla)
      try {
        await fetch("http://localhost:5000/enviar-correo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.correo,
            password: form.password,
            codigo: codigo,
          }),
        });
      } catch (errEmail) {
        console.warn("El correo no pudo ser enviado directamente por el servidor local:", errEmail);
      }

      // ÉXITO
      await Swal.fire({
        icon: "success",
        title: "Usuario registrado",
        html: `
          <p>El usuario <strong>${form.nombre}</strong> fue creado correctamente.</p>
          <p>Código de verificación: <strong style="font-size:20px;letter-spacing:4px">${codigo}</strong></p>
          <p style="font-size:12px;color:#6b7280">Se ha intentado enviar un correo. Guarda este código, lo necesitará para iniciar sesión.</p>
        `,
        confirmButtonColor: DORADO_OSCURO,
      });

      setForm({ nombre: "", correo: "", password: "", confirmar: "", rol: "" });

    } catch (error) {
      console.error(error);

      // Traducción de mensajes de error de Supabase
      let mensaje = error.message;
      if (mensaje.includes("already registered") || mensaje.includes("User already registered")) {
        mensaje = "Este correo ya está registrado en el sistema.";
      } else if (mensaje.includes("invalid email")) {
        mensaje = "El correo electrónico no es válido.";
      } else if (mensaje.includes("Password should be")) {
        mensaje = "La contraseña debe tener al menos 6 caracteres.";
      }

      Swal.fire({ icon: "error", title: "Error al registrar", text: mensaje, confirmButtonColor: DORADO_OSCURO });

    } finally {
      setCargando(false);
    }
  };

  // =========================
  // REENVIAR CORREO
  // =========================
  const reenviarCorreo = async () => {
    if (!form.correo) {
      return Swal.fire("Error", "Ingresa el correo en el formulario para poder reenviar las credenciales", "error");
    }

    setCargando(true);

    try {
      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("codigo, email")
        .eq("email", form.correo)
        .single();

      if (error || !usuario) {
        return Swal.fire("Error", "Usuario no encontrado en la base de datos", "error");
      }

      await fetch("http://localhost:5000/enviar-correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: usuario.email,
          password: "La contraseña registrada anteriormente",
          codigo: usuario.codigo,
        }),
      });

      Swal.fire({
        icon: "success",
        title: "Credenciales reenviadas",
        text: `Se ha enviado un correo con las credenciales a ${usuario.email}`,
        confirmButtonColor: DORADO_OSCURO,
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo conectar con el servidor de correos.",
        confirmButtonColor: DORADO_OSCURO,
      });
    } finally {
      setCargando(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================
  return (
    <div
      className="p-4"
      style={{
        margin: 0,
        backgroundColor: FONDO,
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* ENCABEZADO (mismo estilo que Inventario) */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{
          backgroundColor: "#fffdf8",
          border: `1px solid ${DORADO_CLARO}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Registro de Usuarios{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>
              - Administra el acceso al sistema
            </span>
          </h4>
          {/* Línea decorativa con estrella, igual a Inventario */}
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span
              style={{
                height: "2px",
                width: "70px",
                background: `linear-gradient(to right, transparent, ${DORADO})`,
                display: "inline-block",
              }}
            />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span
              style={{
                height: "2px",
                width: "70px",
                background: `linear-gradient(to left, transparent, ${DORADO})`,
                display: "inline-block",
              }}
            />
          </div>
        </div>
      </div>

      {/* FORM */}
      <div
        className="p-4 rounded-4 shadow-sm mb-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}
      >
        <div className="d-flex align-items-center gap-2 mb-3">
          <UserPlus size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>
            Nuevo Usuario
          </h6>
        </div>

        <div style={{ display: "grid", gap: "14px" }}>
          <Input
            icon={<User size={16} />}
            label="Nombre Completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <Input
            icon={<Mail size={16} />}
            label="Correo Electrónico"
            type="email"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
          />

          <div className="d-flex gap-3 flex-wrap">
            <div style={{ flex: "1 1 200px" }}>
              <Input
                icon={<Lock size={16} />}
                type="password"
                label="Contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <Input
                icon={<Lock size={16} />}
                type="password"
                label="Confirmar"
                value={form.confirmar}
                onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
              />
            </div>
          </div>

          {/* ROL */}
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: DORADO_OSCURO,
                marginBottom: "4px",
                display: "block",
              }}
            >
              Rol del Usuario
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1px solid ${DORADO_CLARO}`,
                borderRadius: "20px",
                padding: "9px 14px",
                background: "#fffdf8",
              }}
            >
              <Shield size={16} style={{ marginRight: "8px", color: DORADO_OSCURO }} />
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "13px",
                  background: "transparent",
                }}
              >
                <option value="">Seleccionar rol</option>
                <option value="Admin">Administrador</option>
                <option value="Gerente">Gerente</option>
                <option value="Mecanico">Mecánico</option>
                <option value="Contador">Contador</option>
              </select>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="d-flex gap-3 flex-wrap" style={{ marginTop: "6px" }}>
            <button
              onClick={manejarRegistro}
              disabled={cargando}
              className="btn d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{
                flex: "1 1 200px",
                background: cargando ? "#9ca3af" : ENCABEZADO,
                color: cargando ? "#fff" : TEXTO_ENCABEZADO,
                border: "none",
                borderRadius: "20px",
                padding: "10px 18px",
                fontSize: "13px",
                boxShadow: cargando ? "none" : "0 3px 12px rgba(19, 32, 46, 0.45)",
                cursor: cargando ? "not-allowed" : "pointer",
              }}
            >
              <UserPlus size={15} />
              {cargando ? "Registrando..." : "Registrar Usuario"}
            </button>

            <button
              onClick={reenviarCorreo}
              disabled={cargando}
              className="btn fw-semibold"
              style={{
                flex: "1 1 200px",
                background: cargando ? "#9ca3af" : ENCABEZADO,
                color: cargando ? "#fff" : TEXTO_ENCABEZADO,
                border: "none",
                borderRadius: "20px",
                padding: "10px 18px",
                fontSize: "13px",
                boxShadow: cargando ? "none" : "0 3px 12px rgba(19, 32, 46, 0.45)",
                cursor: cargando ? "not-allowed" : "pointer",
              }}
            >
              Reenviar Credenciales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistroUsuarios;