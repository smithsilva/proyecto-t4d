import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Eye, Pencil, Trash2, RefreshCcw, Users, Shield, Wrench, UserCheck, Search, X } from "lucide-react";
import { supabase } from "../../supabase/supabaseClient";

// =========================================
// CONSTANTES DE ROLES
// =========================================

const ROL_META = {
  Admin:    { label: "Admin",    bg: "#B89B6A", fg: "#000" },
  Gerente:  { label: "Gerente",  bg: "#1f2937", fg: "#fff" },
  Mecanico: { label: "Mecánico", bg: "#374151", fg: "#fff" },
  Contador: { label: "Contador", bg: "#e5e7eb", fg: "#111" },
};

// =========================================
// COMPONENTES AUXILIARES
// =========================================

const RolBadge = ({ rol }) => {
  const m = ROL_META[rol] || { label: rol, bg: "#6b7280", fg: "#fff" };
  return (
    <span style={{
      background: m.bg, color: m.fg,
      padding: "4px 12px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.03em",
    }}>
      {m.label}
    </span>
  );
};

const EstadoBadge = ({ activo }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 12, fontWeight: 600,
    color: activo ? "#16a34a" : "#6b7280",
    background: activo ? "rgba(34,197,94,0.08)" : "rgba(107,114,128,0.1)",
    padding: "4px 10px", borderRadius: 20,
    border: `1px solid ${activo ? "rgba(34,197,94,0.2)" : "rgba(107,114,128,0.2)"}`,
  }}>
    <span style={{
      width: 7, height: 7, borderRadius: "50%",
      background: activo ? "#22c55e" : "#9ca3af",
      display: "inline-block",
    }} />
    {activo ? "Activo" : "Inactivo"}
  </span>
);

const Avatar = ({ iniciales }) => (
  <div style={{
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, #B89B6A, #8C7450)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0,
    boxShadow: "0 2px 8px rgba(184,155,106,0.35)",
  }}>
    {iniciales}
  </div>
);

const ModalVer = ({ usuario, onClose }) => {
  if (!usuario) return null;
  const m = ROL_META[usuario.rol] || { label: usuario.rol, bg: "#6b7280", fg: "#fff" };
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: 32,
          width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Cabecera */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #B89B6A, #8C7450)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "#fff",
            boxShadow: "0 4px 16px rgba(184,155,106,0.4)", marginBottom: 12,
          }}>
            {usuario.iniciales}
          </div>
          <h6 style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>{usuario.nombre}</h6>
          <span style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{usuario.correo}</span>
        </div>

        {/* Info */}
        {[
          { label: "Rol",    value: <span style={{ background: m.bg, color: m.fg, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{m.label}</span> },
          { label: "Estado", value: <EstadoBadge activo={usuario.activo} /> },
          { label: "ID",     value: <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>#{usuario.id}</span> },
        ].map(({ label, value }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0", borderBottom: "1px solid #f3f4f6",
          }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
            {value}
          </div>
        ))}

        <button
          onClick={onClose}
          style={{
            marginTop: 20, width: "100%", padding: "10px",
            borderRadius: 10, border: "none", background: "#1f2937",
            color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13,
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// =========================================
// COMPONENTE PRINCIPAL
// =========================================

function GestionUsuarios() {
  const [busqueda,   setBusqueda]   = useState("");
  const [usuarios,   setUsuarios]   = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [usuarioVer, setUsuarioVer] = useState(null);

  useEffect(() => { obtenerUsuarios(); }, []);

  // ── OBTENER ──────────────────────────────
  const obtenerUsuarios = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("usuarios")
      .select(`id_usuario, username, email, activo, roles(nombre_rol)`);

    if (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los usuarios" });
      setCargando(false);
      return;
    }

    setUsuarios(data.map(u => ({
      id:        u.id_usuario,
      nombre:    u.username,
      correo:    u.email,
      rol:       u.roles?.nombre_rol || "Sin rol",
      activo:    u.activo,
      iniciales: u.username?.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2) || "?",
    })));
    setCargando(false);
  };

  // ── EDITAR ───────────────────────────────
  const editarUsuario = async (u) => {
    const { value } = await Swal.fire({
      title: "Editar usuario",
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${u.nombre}" style="border-radius:10px"/>
        <input id="swal-correo" class="swal2-input" placeholder="Correo" value="${u.correo}" style="border-radius:10px"/>
      `,
      confirmButtonColor: "#B89B6A",
      focusConfirm: false,
      preConfirm: () => ({
        nombre: document.getElementById("swal-nombre").value,
        correo: document.getElementById("swal-correo").value,
      }),
    });
    if (!value) return;

    const { error } = await supabase
      .from("usuarios")
      .update({ username: value.nombre, email: value.correo })
      .eq("id_usuario", u.id);

    if (error) return Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar" });
    Swal.fire({ icon: "success", title: "Actualizado", timer: 1400, showConfirmButton: false });
    obtenerUsuarios();
  };

  // ── CAMBIAR ESTADO ───────────────────────
  const cambiarEstado = async (u) => {
    const { error } = await supabase
      .from("usuarios")
      .update({ activo: !u.activo })
      .eq("id_usuario", u.id);

    if (error) return Swal.fire({ icon: "error", title: "Error" });
    Swal.fire({ icon: "success", title: u.activo ? "Usuario desactivado" : "Usuario activado", timer: 1400, showConfirmButton: false });
    obtenerUsuarios();
  };

  // ── ELIMINAR ─────────────────────────────
  const eliminarUsuario = async (id) => {
    const r = await Swal.fire({
      title: "¿Eliminar usuario?", text: "Esta acción no se puede deshacer",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d33", cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;

    const { error } = await supabase.from("usuarios").delete().eq("id_usuario", id);
    if (error) return Swal.fire({ icon: "error", title: "Error" });
    Swal.fire({ icon: "success", title: "Eliminado", timer: 1400, showConfirmButton: false });
    obtenerUsuarios();
  };

  // ── FILTRO ───────────────────────────────
  const normalizar = t => t?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
  const filtrados = usuarios.filter(u => {
    const q = normalizar(busqueda);
    return (
      normalizar(u.nombre).includes(q) ||
      normalizar(u.correo).includes(q) ||
      normalizar(u.rol).includes(q)
    );
  });

  // ── TARJETAS ─────────────────────────────
  const tarjetas = [
    { label: "Total Usuarios",  icon: <Users size={20} color="#B89B6A" />,     value: usuarios.length },
    { label: "Administradores", icon: <Shield size={20} color="#B89B6A" />,    value: usuarios.filter(u => u.rol === "Admin").length },
    { label: "Mecánicos",       icon: <Wrench size={20} color="#B89B6A" />,    value: usuarios.filter(u => u.rol === "Mecanico").length },
    { label: "Otros Roles",     icon: <UserCheck size={20} color="#B89B6A" />, value: usuarios.filter(u => u.rol !== "Admin" && u.rol !== "Mecanico").length },
  ];

  // ── RENDER ───────────────────────────────
  return (
    <div style={{ padding: 24, width: "100%", minHeight: "100vh", boxSizing: "border-box", background: "#f8f9fa" }}>

      <ModalVer usuario={usuarioVer} onClose={() => setUsuarioVer(null)} />

      {/* HEADER */}
      <div style={{ marginBottom: 22 }}>
        <h5 style={{ fontWeight: 700, margin: 0, fontSize: 20 }}>Gestión de Usuarios</h5>
        <div style={{ width: 48, height: 3, background: "#B89B6A", borderRadius: 4, margin: "7px 0 4px" }} />
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Administra los usuarios del sistema</p>
      </div>

      {/* TARJETAS */}
      <div className="row g-3 mb-3">
        {tarjetas.map(c => (
          <div key={c.label} className="col-12 col-sm-6 col-lg-3">
            <div className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
              style={{ background: "#121212", border: "1px solid #B89B6A", color: "#fff" }}>
              <div>
                <small style={{ color: "#B89B6A", fontSize: 12 }}>{c.label}</small>
                <h5 className="fw-bold mb-0" style={{ marginTop: 4 }}>{c.value}</h5>
              </div>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* BUSCADOR */}
      <div className="card rounded-4 shadow-sm mb-3" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={15} style={{ color: "#9ca3af", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: 13, background: "transparent", color: "#111" }}
          />
          {busqueda && (
            <X size={14} onClick={() => setBusqueda("")} style={{ color: "#9ca3af", cursor: "pointer", flexShrink: 0 }} />
          )}
        </div>
      </div>

      {/* TABLA */}
      <div className="card rounded-4 shadow-sm mb-3" style={{ background: "#fff", border: "1px solid #e5e7eb", overflow: "hidden" }}>

        {/* Barra conteo + actualizar */}
        <div style={{ padding: "10px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {cargando ? "Cargando..." : `${filtrados.length} usuario${filtrados.length !== 1 ? "s" : ""}`}
          </span>
          <button
            onClick={obtenerUsuarios}
            style={{ background: "transparent", border: "none", color: "#B89B6A", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}
          >
            <RefreshCcw size={12} /> Actualizar
          </button>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ minWidth: 850, fontSize: 13 }}>
            <thead style={{ background: "#fafafa" }}>
              <tr>
                {["Usuario", "Correo", "Rol", "Estado", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid #f3f4f6" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                    {[140, 200, 80, 70, 120].map((w, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, width: w }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: 48, color: "#9ca3af", fontSize: 13 }}>
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filtrados.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f9fafb" }}>

                    {/* Usuario */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar iniciales={u.iniciales} />
                        <p style={{ margin: 0, fontWeight: 600, color: "#111" }}>{u.nombre}</p>
                      </div>
                    </td>

                    {/* Correo */}
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{u.correo}</td>

                    {/* Rol */}
                    <td style={{ padding: "12px 16px" }}><RolBadge rol={u.rol} /></td>

                    {/* Estado */}
                    <td style={{ padding: "12px 16px" }}><EstadoBadge activo={u.activo} /></td>

                    {/* Acciones */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>

                        <button onClick={() => setUsuarioVer(u)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: "#f3f4f6", color: "#374151" }}>
                          <Eye size={13} /> Ver
                        </button>

                        <button onClick={() => editarUsuario(u)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: "rgba(184,155,106,0.12)", color: "#8C7450" }}>
                          <Pencil size={13} /> Editar
                        </button>

                        <button onClick={() => cambiarEstado(u)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: u.activo ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)", color: u.activo ? "#d97706" : "#16a34a" }}>
                          <RefreshCcw size={13} /> {u.activo ? "Desactivar" : "Activar"}
                        </button>

                        <button onClick={() => eliminarUsuario(u.id)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
                          <Trash2 size={13} /> Eliminar
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GestionUsuarios;