import { useState } from "react";
import Swal from "sweetalert2";
import { User, Mail, Lock, Shield } from "lucide-react";
import { supabase } from "../../supabase/supabaseClient";

// =========================================
// COMPONENTE INPUT
// =========================================
const Input = ({ label, icon, ...props }) => (
  <div>
    <label style={{ fontSize: "13px", fontWeight: "500" }}>{label}</label>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #dee2e6",
        borderRadius: "20px",
        padding: "7px 12px",
        marginTop: "4px",
        background: "#fff",
      }}
    >
      <div style={{ color: "#B89B6A" }}>{icon}</div>
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

      Swal.fire({ icon: "error", title: "Error al registrar", text: mensaje });

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
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo conectar con el servidor de correos.",
      });
    } finally {
      setCargando(false);
    }
  };

  // =========================================
  // RENDER
  // =========================================
  return (
    <div className="p-5" style={{ marginTop: "1px", background: "#fff", minHeight: "100vh" }}>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Registro de Usuarios</h4>
          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#B89B6A",
              borderRadius: "10px",
              marginBottom: "5px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Registra nuevos usuarios en el sistema
          </p>
        </div>
      </div>

      {/* FORM */}
      <div
        className="card p-3 rounded-4 shadow-sm mb-4"
        style={{ background: "#fff", border: "1px solid #e5e7eb" }}
      >
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Nuevo Usuario</h6>

        <div style={{ display: "grid", gap: "10px", marginTop: "6px" }}>
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

          <div style={{ display: "flex", gap: "10px" }}>
            <Input
              icon={<Lock size={16} />}
              type="password"
              label="Contraseña"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Input
              icon={<Lock size={16} />}
              type="password"
              label="Confirmar"
              value={form.confirmar}
              onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
            />
          </div>

          {/* ROL */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500" }}>Rol del Usuario</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #dee2e6",
                borderRadius: "20px",
                padding: "7px 12px",
                marginTop: "4px",
                background: "#fff",
              }}
            >
              <Shield size={16} style={{ marginRight: "8px", color: "#B89B6A" }} />
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
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={manejarRegistro}
              disabled={cargando}
              className="btn rounded-pill btn-sm"
              style={{
                flex: 1,
                backgroundColor: cargando ? "#6b7280" : "#1f2937",
                color: "#fff",
                border: "none",
                padding: "10px",
                fontSize: "13px",
                cursor: cargando ? "not-allowed" : "pointer",
              }}
            >
              {cargando ? "Registrando..." : "Registrar Usuario"}
            </button>

            <button
              onClick={reenviarCorreo}
              disabled={cargando}
              className="btn rounded-pill btn-sm"
              style={{
                flex: 1,
                backgroundColor: "#B89B6A",
                color: "#000",
                border: "none",
                padding: "10px",
                fontSize: "13px",
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