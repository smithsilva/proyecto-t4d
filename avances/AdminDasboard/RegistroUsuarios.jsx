import { useState } from "react";
import Swal from "sweetalert2";
import { User, Mail, Lock, Shield } from "lucide-react";


function RegistroUsuarios() {

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmar: "",
    rol: "",
  });

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
      return Swal.fire(
        "Error",
        "La contraseña debe tener mínimo 6 caracteres",
        "error"
      );
    }

    if (form.password !== form.confirmar) {
      return Swal.fire(
        "Error",
        "Las contraseñas no coinciden",
        "error"
      );
    }

    try {

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

  return (
    <div
      style={{
        background: "#ffffff",
        minHeight: "100vh",
        padding: "16px 20px",       // ← reducido de 25px
        color: "#1f2937"
      }}
    >

      {/* HEADER */}
      <div>

        <h4 style={{ marginBottom: "4px" }}>   {/* ← reducido de 5px */}
          Registro de Usuarios
        </h4>

        {/* Línea dorada */}
        <div
          style={{
            width: "50px",
            height: "3px",
            backgroundColor: "#B89B6A",
            borderRadius: "10px",
            marginBottom: "4px",    // ← reducido de 6px
          }}
        ></div>

        <p
          style={{
            color: "#6b7280",
            fontSize: "13px"        // ← reducido de 14px
          }}
        >
          Registra nuevos usuarios
        </p>
      </div>

      {/* FORM */}
      <div
        style={{
          marginTop: "12px",        // ← reducido de 20px
          background: "#ffffff",
          padding: "16px",          // ← reducido de 22px
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
        }}
      >

        <h6
          style={{
            marginBottom: "8px",    // ← reducido de 10px
            color: "#B89B6A"
          }}
        >
          Nuevo Usuario
        </h6>

        <div
          style={{
            display: "grid",
            gap: "8px",             // ← reducido de 12px
            marginTop: "6px"        // ← reducido de 10px
          }}
        >

          <Input
            icon={<User size={16} />}     // ← reducido de 17
            label="Nombre Completo"
            value={form.nombre}
            onChange={(e) =>
              setForm({
                ...form,
                nombre: e.target.value
              })
            }
          />

          <Input
            icon={<Mail size={16} />}     // ← reducido de 17
            label="Correo Electrónico"
            value={form.correo}
            onChange={(e) =>
              setForm({
                ...form,
                correo: e.target.value
              })
            }
          />

          <div
            style={{
              display: "flex",
              gap: "10px"
            }}
          >

            <Input
              icon={<Lock size={16} />}   // ← reducido de 17
              type="password"
              label="Contraseña"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
            />

            <Input
              icon={<Lock size={16} />}   // ← reducido de 17
              type="password"
              label="Confirmar"
              value={form.confirmar}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmar: e.target.value
                })
              }
            />

          </div>

          {/* ROL */}
          <div>

            <label
              style={{
                fontSize: "13px",   // ← reducido de 14px
                fontWeight: "500"
              }}
            >
              Rol del Usuario
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #e5e7eb",
                borderRadius: "9px",
                padding: "7px 10px",  // ← reducido de 8px
                marginTop: "4px",     // ← reducido de 5px
                background: "#f9fafb"
              }}
            >

              <Shield
                size={16}             // ← reducido de 17
                style={{
                  marginRight: "8px",
                  color: "#B89B6A"
                }}
              />

              <select
                value={form.rol}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rol: e.target.value
                  })
                }
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "13px",   // ← reducido de 14px
                  background: "transparent"
                }}
              >

                <option value="">
                  Seleccionar rol
                </option>

                <option>
                  Administrador
                </option>

                <option>
                  Gerente
                </option>

                <option>
                  Mecánico
                </option>

                <option>
                  Contador
                </option>

              </select>

            </div>
          </div>

          {/* BOTÓN REGISTRAR */}

          <button
            onClick={manejarRegistro}
            style={{
              marginTop: "6px",     // ← reducido de 10px
              background: "#000000",
              color: "#fff",
              border: "none",
              padding: "11px",      // ← reducido de 12px
              borderRadius: "22px",
              fontSize: "13px",     // ← reducido de 14px
              cursor: "pointer"
            }}
          >
            Registrar Usuario
          </button>

          {/* BOTÓN REENVIAR */}

          <button
            onClick={reenviarCorreo}
            style={{
              background: "#B89B6A",
              color: "#fff",
              border: "none",
              padding: "11px",      // ← reducido de 12px
              borderRadius: "22px",
              fontSize: "13px",     // ← reducido de 14px
              cursor: "pointer"
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

const Input = ({
  label,
  icon,
  ...props
}) => (

  <div>

    <label
      style={{
        fontSize: "13px",           // ← reducido de 14px
        fontWeight: "500"
      }}
    >
      {label}
    </label>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #e5e7eb",
        borderRadius: "9px",
        padding: "7px 10px",        // ← reducido de 8px
        marginTop: "4px",           // ← reducido de 5px
        background: "#f9fafb"
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
          fontSize: "13px",         // ← reducido de 14px
          background: "transparent"
        }}
      />

    </div>
  </div>
);

export default RegistroUsuarios;