import { useState } from "react";
import Swal from "sweetalert2";
import { User, Mail, Lock, Shield } from "lucide-react";
import { supabase } from "../../Supabase/SupabaseClient";

// =========================================
// COMPONENTE INPUT
// =========================================

const Input = ({ label, icon, ...props }) => (
  <div>
    <label style={{ fontSize: "13px", fontWeight: "500" }}>{label}</label>
    <div style={{
      display: "flex", alignItems: "center",
      border: "1px solid #dee2e6", borderRadius: "20px",
      padding: "7px 12px", marginTop: "4px", background: "#fff",
    }}>
      <div style={{ color: "#B89B6A" }}>{icon}</div>
      <input
        {...props}
        placeholder={label}
        style={{
          border: "none", outline: "none",
          marginLeft: "8px", width: "100%",
          fontSize: "13px", background: "transparent",
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
  // MAPEAR ROLES
  // =========================

  const mapearRol = (rol) => {

    switch (rol) {

      case "Administrador":
        return "Admin";

      case "Gerente":
        return "Gerente";

      case "Mecánico":
        return "Mecanico";

      case "Contador":
        return "Contador";

      default:
        return "";
    }
  };

  // =========================
  // REGISTRAR
  // =========================

  const manejarRegistro = async () => {

    if (
      !form.nombre ||
      !form.correo ||
      !form.password ||
      !form.confirmar ||
      !form.rol
    ) {
      return Swal.fire(
        "Error",
        "Completa todos los campos",
        "error"
      );
    }
    if (form.password.length < 6) {
      return Swal.fire("Error", "La contraseña debe tener mínimo 6 caracteres", "error");
    }
    if (form.password !== form.confirmar) {
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    }

    setCargando(true);

      // =========================
      // GENERAR CÓDIGO
      // =========================

      const codigo = generarCodigo();

      // =========================
      // CREAR USUARIO AUTH
      // =========================

      const { data, error } = await supabase.auth.signUp({
        email: form.correo,
        password: form.password,
      });

      if (error) throw error;

      const auth_id = data.user.id;

      // =========================
      // BUSCAR ID ROL
      // =========================

      const nombreRol = mapearRol(form.rol);

      const { data: rolData, error: rolError } = await supabase
        .from("roles")
        .select("id_rol")
        .eq("nombre_rol", nombreRol)
        .single();

      if (rolError) throw rolError;

      // =========================
      // INSERTAR EN USUARIOS
      // =========================

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

      if (insertError) throw insertError;

      // =========================
      // ENVIAR CORREO
      // =========================

      await fetch("http://localhost:5000/enviar-correo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.correo,
          password: form.password,
          codigo: codigo,
        }),
      });

      // =========================
      // ALERTA
      // =========================

      Swal.fire({
        icon: "success",
        title: "Usuario registrado",
        text: `Código generado: ${codigo}`,
      });

      // =========================
      // LIMPIAR FORM
      // =========================

      setForm({
        nombre: "",
        correo: "",
        password: "",
        confirmar: "",
        rol: "",
      });

    } catch (error) {

      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  // =========================
  // REENVIAR CORREO
  // =========================

  const reenviarCorreo = async () => {

    if (!form.correo) {
      return Swal.fire(
        "Error",
        "Ingresa el correo",
        "error"
      );
    }

    try {

      // =========================
      // BUSCAR USUARIO
      // =========================

      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("codigo, email")
        .eq("email", form.correo)
        .single();

      if (error || !usuario) {
        return Swal.fire(
          "Error",
          "Usuario no encontrado",
          "error"
        );
      }

      // =========================
      // ENVIAR CORREO
      // =========================

      await fetch("http://localhost:5000/enviar-correo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usuario.email,
          password: "La contraseña es la registrada anteriormente",
          codigo: usuario.codigo,
        }),
      });

      Swal.fire({
        icon: "success",
        title: "Correo reenviado",
        text: "Las credenciales fueron enviadas nuevamente",
      });

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });

    }
  };

  // ── RENDER ───────────────────────────────
  return (

    <div
      className="p-5"
      style={{
        marginTop: "1px",
        background: "#fff",
        minHeight: "100vh",
      }}
    >

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Registro de Usuarios</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Registra nuevos usuarios en el sistema</p>
        </div>
      </div>

      {/* FORM */}

      <div
        className="card p-3 rounded-4 shadow-sm mb-4"
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
        }}
      >

        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Nuevo Usuario</h6>

        <div style={{ display: "grid", gap: "10px", marginTop: "6px" }}>

          <Input
            icon={<User size={16} />}
            label="Nombre Completo"
            value={form.nombre}
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value })
            }
          />

          <Input
            icon={<Mail size={16} />}
            label="Correo Electrónico"
            value={form.correo}
            onChange={(e) =>
              setForm({ ...form, correo: e.target.value })
            }
          />

          <div style={{ display: "flex", gap: "10px" }}>

            <Input
              icon={<Lock size={16} />}
              type="password"
              label="Contraseña"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <Input
              icon={<Lock size={16} />}
              type="password"
              label="Confirmar"
              value={form.confirmar}
              onChange={(e) =>
                setForm({ ...form, confirmar: e.target.value })
              }
            />

          </div>

          {/* ROL — value coincide exactamente con nombre_rol en la BD */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500" }}>Rol del Usuario</label>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #dee2e6", borderRadius: "20px", padding: "7px 12px", marginTop: "4px", background: "#fff" }}>
              <Shield size={16} style={{ marginRight: "8px", color: "#B89B6A" }} />
              <select
                value={form.rol}
                onChange={(e) => setForm({ ...form, rol: e.target.value })}
                style={{ border: "none", outline: "none", width: "100%", fontSize: "13px", background: "transparent" }}
              >
                <option value="">Seleccionar rol</option>
                <option value="Admin">Administrador</option>
                <option value="Gerente">Gerente</option>
                <option value="Mecanico">Mecánico</option>
                <option value="Contador">Contador</option>
              </select>
            </div>
          </div>

          {/* BOTÓN REGISTRAR */}

          <button
            onClick={manejarRegistro}
            disabled={cargando}
            className="btn rounded-pill btn-sm"
            style={{
              marginTop: "6px",
              backgroundColor: "#1f2937",
              color: "#fff",
              border: "none",
              padding: "10px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Registrar Usuario
          </button>

          {/* BOTÓN REENVIAR */}

          <button
            onClick={reenviarCorreo}
            className="btn rounded-pill btn-sm"
            style={{
              backgroundColor: "#B89B6A",
              color: "#000",
              border: "none",
              padding: "10px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Reenviar Credenciales
          </button>

        </div>
      </div>
    </div>
  );
}

/* INPUT */

const Input = ({ label, icon, ...props }) => (

  <div>

    <label style={{ fontSize: "13px", fontWeight: "500" }}>
      {label}
    </label>

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

      <div style={{ color: "#B89B6A" }}>
        {icon}
      </div>

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

export default RegistroUsuarios;