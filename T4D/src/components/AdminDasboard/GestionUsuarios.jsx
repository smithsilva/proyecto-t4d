import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Eye, Pencil, Trash2, RefreshCcw, Users, Shield, Wrench, UserCheck, Search, X } from "lucide-react";
import { Eye, Pencil, Trash2, RefreshCcw, Users, Shield, Wrench, UserCheck } from "lucide-react";
import { supabase } from "../../supabase/supabaseClient";

const injectStyles = () => {
  if (document.getElementById("gu-styles")) return;
  const s = document.createElement("style");
  s.id = "gu-styles";
  s.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
    @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 5px rgba(34,197,94,0)} }
    .gu-row { animation: fadeUp .3s ease both; transition: background .15s; }
    .gu-row:hover td { background: rgba(184,155,106,0.04) !important; }
    .gu-dot-active { animation: pulse 2s ease infinite; }
    .gu-search:focus { outline:none; border-color:#B89B6A !important; box-shadow:0 0 0 3px rgba(184,155,106,0.15) !important; }
    .gu-search::placeholder { color:#9ca3af; }
    .gu-action { display:flex; align-items:center; gap:4px; padding:5px 10px; border-radius:8px; border:none; cursor:pointer; font-size:12px; font-weight:500; transition:all .15s; }
    .gu-action:hover { filter:brightness(0.92); transform:translateY(-1px); }
    .gu-card { transition: transform .2s, box-shadow .2s; }
    .gu-card:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(0,0,0,0.2) !important; }
  `;
  document.head.appendChild(s);
};

const ROL_META = {
  Admin:    { label: "Admin",    bg: "#B89B6A", fg: "#000" },
  Gerente:  { label: "Gerente",  bg: "#1f2937", fg: "#fff" },
  Mecanico: { label: "Mecánico", bg: "#374151", fg: "#fff" },
  Contador: { label: "Contador", bg: "#e5e7eb", fg: "#111" },
};

const RolBadge = ({ rol }) => {
  const m = ROL_META[rol] || { label: rol, bg: "#6b7280", fg: "#fff" };
  return (
    <span style={{ background: m.bg, color: m.fg, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.03em" }}>
      {m.label}
    </span>
  );
};

const EstadoBadge = ({ activo }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
    color: activo ? "#16a34a" : "#6b7280",
    background: activo ? "rgba(34,197,94,0.08)" : "rgba(107,114,128,0.1)",
    padding: "4px 10px", borderRadius: 20, border: `1px solid ${activo ? "rgba(34,197,94,0.2)" : "rgba(107,114,128,0.2)"}`,
  }}>
    <span className={activo ? "gu-dot-active" : ""} style={{
      width: 7, height: 7, borderRadius: "50%",
      background: activo ? "#22c55e" : "#9ca3af", display: "inline-block",
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
  }}>{iniciales}</div>
);

// Modal de detalle de usuario
const ModalVer = ({ usuario, onClose }) => {
  if (!usuario) return null;
  const m = ROL_META[usuario.rol] || { label: usuario.rol, bg: "#6b7280", fg: "#fff" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "fadeUp .25s ease" }}
        onClick={e => e.stopPropagation()}>
        {/* cabecera */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #B89B6A, #8C7450)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "#fff",
            boxShadow: "0 4px 16px rgba(184,155,106,0.4)", marginBottom: 12,
          }}>{usuario.iniciales}</div>
          <h6 style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>{usuario.nombre}</h6>
          <span style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{usuario.correo}</span>
        </div>
        {/* info */}
        {[
          { label: "Rol", value: <span style={{ background: m.bg, color: m.fg, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{m.label}</span> },
          { label: "Estado", value: <EstadoBadge activo={usuario.activo} /> },
          { label: "ID", value: <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>#{usuario.id}</span> },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
            {value}
          </div>
        ))}
        <button onClick={onClose} style={{ marginTop: 20, width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#1f2937", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default function GestionUsuarios() {
  injectStyles();

  const [busqueda, setBusqueda] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioVer, setUsuarioVer] = useState(null);

  useEffect(() => { obtenerUsuarios(); }, []);

  const obtenerUsuarios = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("usuarios")
      .select(`id_usuario, username, email, activo, roles(nombre_rol)`);
function GestionUsuarios() {

  const [busqueda, setBusqueda] = useState("");
  const [usuarios, setUsuarios] = useState([]);

  // =========================================
  // OBTENER USUARIOS
  // =========================================

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {

    const { data, error } = await supabase
      .from("usuarios")
      .select(`
        id_usuario,
        username,
        email,
        activo,
        roles (
          nombre_rol
        )
      `);

    if (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los usuarios",
      });
      return;
    }

    const usuariosFormateados = data.map((u) => ({
      id: u.id_usuario,
      nombre: u.username,
      correo: u.email,
      rol: u.roles?.nombre_rol || "Sin rol",
      estado: u.activo ? "activo" : "inactivo",
      activo: u.activo,
      iniciales: u.username
        ?.split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    }));

    setUsuarios(usuariosFormateados);
  };

  // =========================================
  // EDITAR USUARIO
  // =========================================

  const editarUsuario = async (usuario) => {

    const { value: formValues } = await Swal.fire({
      title: "Editar Usuario",
      html: `
        <input
          id="swal-nombre"
          class="swal2-input"
          placeholder="Nombre"
          value="${usuario.nombre}"
        />
        <input
          id="swal-correo"
          class="swal2-input"
          placeholder="Correo"
          value="${usuario.correo}"
        />
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          nombre: document.getElementById("swal-nombre").value,
          correo: document.getElementById("swal-correo").value,
        };
      },
    });

    if (!formValues) return;

    const { error } = await supabase
      .from("usuarios")
      .update({
        username: formValues.nombre,
        email: formValues.correo,
      })
      .eq("id_usuario", usuario.id);

    if (error) {
      Swal.fire("Error", "No se pudo actualizar el usuario", "error");
      return;
    }

    Swal.fire("Actualizado", "Usuario actualizado correctamente", "success");
    obtenerUsuarios();
  };

  // =========================================
  // ACTIVAR / DESACTIVAR
  // =========================================

  const cambiarEstado = async (usuario) => {

    const nuevoEstado = !usuario.activo;

    const { error } = await supabase
      .from("usuarios")
      .update({ activo: nuevoEstado })
      .eq("id_usuario", usuario.id);

    if (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los usuarios" });
      setCargando(false);
      return;
    }
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el estado del usuario",
      });
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
    const { error } = await supabase.from("usuarios").update({ username: value.nombre, email: value.correo }).eq("id_usuario", u.id);
    if (error) return Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar" });
    Swal.fire({ icon: "success", title: "Actualizado", timer: 1400, showConfirmButton: false });
    obtenerUsuarios();
  };
    Swal.fire(
      "Actualizado",
      `Usuario ${nuevoEstado ? "activado" : "desactivado"} correctamente`,
      "success"
    );

    obtenerUsuarios();
  };

  const cambiarEstado = async (u) => {
    const { error } = await supabase.from("usuarios").update({ activo: !u.activo }).eq("id_usuario", u.id);
    if (error) return Swal.fire({ icon: "error", title: "Error" });
    Swal.fire({ icon: "success", title: u.activo ? "Usuario desactivado" : "Usuario activado", timer: 1400, showConfirmButton: false });
    obtenerUsuarios();
  };
  // =========================================
  // ELIMINAR USUARIO
  // =========================================

  const eliminarUsuario = async (id) => {

    const resultado = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });

    if (!resultado.isConfirmed) return;

    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id_usuario", id);

    if (error) {
      Swal.fire("Error", "No se pudo eliminar el usuario", "error");
      return;
    }

    Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
    obtenerUsuarios();
  };

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

  const normalizar = t => t?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
  const filtrados = usuarios.filter(u => {
    const q = normalizar(busqueda);
    return normalizar(u.nombre).includes(q) || normalizar(u.correo).includes(q) || normalizar(u.rol).includes(q);
  });
  // =========================================
  // BUSCADOR
  // =========================================

  const normalizar = (texto) =>
    texto
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtrados = usuarios.filter((u) => {
    const texto = normalizar(busqueda);
    return (
      normalizar(u.nombre).includes(texto) ||
      normalizar(u.correo).includes(texto) ||
      normalizar(u.rol).includes(texto)
    );
  });

  // =========================================
  // COLORES ROLES
  // =========================================

  const getRol = (rol) => {

    if (rol === "Admin") {
      return (
        <span className="badge" style={{ background: "#B89B6A", color: "#000" }}>
          Admin
        </span>
      );
    }

    if (rol === "Gerente") {
      return (
        <span className="badge" style={{ background: "#1f2937" }}>
          Gerente
        </span>
      );
    }

    if (rol === "Mecanico") {
      return (
        <span className="badge" style={{ background: "#374151" }}>
          Mecánico
        </span>
      );
    }

    if (rol === "Contador") {
      return (
        <span className="badge" style={{ background: "#e5e7eb", color: "#000" }}>
          Contador
        </span>
      );
    }

    return (
      <span className="badge" style={{ background: "#6b7280" }}>
        {rol}
      </span>
    );
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div style={{ padding: "24px", width: "100%", minHeight: "100vh", boxSizing: "border-box", background: "#f8f9fa" }}>

      {/* MODAL VER */}
      <ModalVer usuario={usuarioVer} onClose={() => setUsuarioVer(null)} />
    <div
      style={{
        padding: "20px",
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >

      {/* HEADER */}
      <div style={{ marginBottom: 22 }}>
        <h5 style={{ fontWeight: 700, margin: 0, fontSize: 20 }}>Gestión de Usuarios</h5>
        <div style={{ width: 48, height: 3, background: "#B89B6A", borderRadius: 4, margin: "7px 0 4px" }} />
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Administra los usuarios del sistema</p>
      <div style={{ marginBottom: 22 }}>
        <h5 style={{ fontWeight: 700, margin: 0, fontSize: 20 }}>
          Gestión de Usuarios
        </h5>
        <div
          style={{
            width: 48,
            height: 3,
            background: "#B89B6A",
            borderRadius: 4,
            margin: "7px 0 4px",
          }}
        />
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          Administra los usuarios del sistema
        </p>
      </div>

      {/* TARJETAS */}
      <div className="row g-3 mb-3">
        {[
          { label: "Total Usuarios",   icon: <Users size={20} color="#B89B6A" />,     value: usuarios.length },
          { label: "Administradores",  icon: <Shield size={20} color="#B89B6A" />,    value: usuarios.filter(u => u.rol === "Admin").length },
          { label: "Mecánicos",        icon: <Wrench size={20} color="#B89B6A" />,    value: usuarios.filter(u => u.rol === "Mecanico").length },
          { label: "Otros Roles",      icon: <UserCheck size={20} color="#B89B6A" />, value: usuarios.filter(u => u.rol !== "Admin" && u.rol !== "Mecanico").length },
        ].map(c => (
          <div key={c.label} className="col-12 col-sm-6 col-lg-3">
            <div className="gu-card p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
              style={{ background: "#121212", border: "1px solid #B89B6A", color: "#fff" }}>
              <div>
                <small style={{ color: "#B89B6A", fontSize: 12 }}>{c.label}</small>
                <h5 className="fw-bold mb-0" style={{ marginTop: 4 }}>{c.value}</h5>
              </div>
              {c.icon}

        {/* TOTAL USUARIOS */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
            style={{
              background: "#121212",
              border: "1px solid #B89B6A",
              color: "#fff",
            }}
          >
            <div>
              <small style={{ color: "#B89B6A" }}>Total Usuarios</small>
              <h5 className="fw-bold mb-0">{usuarios.length}</h5>
            </div>
            <Users size={20} color="#B89B6A" />
          </div>
        </div>

        {/* ADMINISTRADORES */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
            style={{
              background: "#121212",
              border: "1px solid #B89B6A",
              color: "#fff",
            }}
          >
            <div>
              <small style={{ color: "#B89B6A" }}>Administradores</small>
              <h5 className="fw-bold mb-0">
                {usuarios.filter((u) => u.rol === "Admin").length}
              </h5>
            </div>
            <Shield size={20} color="#B89B6A" />
          </div>
        ))}
        </div>

        {/* MECÁNICOS */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
            style={{
              background: "#121212",
              border: "1px solid #B89B6A",
              color: "#fff",
            }}
          >
            <div>
              <small style={{ color: "#B89B6A" }}>Mecánicos</small>
              <h5 className="fw-bold mb-0">
                {usuarios.filter((u) => u.rol === "Mecanico").length}
              </h5>
            </div>
            <Wrench size={20} color="#B89B6A" />
          </div>
        </div>

        {/* ACTIVOS */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div
            className="p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100"
            style={{
              background: "#121212",
              border: "1px solid #B89B6A",
              color: "#fff",
            }}
          >
            <div>
              <small style={{ color: "#B89B6A" }}>Activos</small>
              <h5 className="fw-bold mb-0">
                {usuarios.filter((u) => u.activo).length}
              </h5>
            </div>
            <UserCheck size={20} color="#B89B6A" />
          </div>
        </div>

      </div>

      {/* BUSCADOR */}
      <div className="card rounded-4 shadow-sm mb-3" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={15} style={{ color: "#9ca3af", flexShrink: 0 }} />
          <input
            className="gu-search"
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: 13, background: "transparent", color: "#111" }}
          />
          {busqueda && <X size={14} onClick={() => setBusqueda("")} style={{ color: "#9ca3af", cursor: "pointer", flexShrink: 0 }} />}
        </div>
      <div
        className="card p-3 rounded-4 shadow-sm mb-3"
        style={{ background: "#fff", width: "100%" }}
      >
        <input
          type="text"
          className="form-control rounded-pill"
          placeholder="Buscar por nombre, correo o rol..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <div className="card rounded-4 shadow-sm mb-3" style={{ background: "#fff", border: "1px solid #e5e7eb", overflow: "hidden" }}>

        {/* barra conteo */}
        <div style={{ padding: "10px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            {cargando ? "Cargando..." : `${filtrados.length} usuario${filtrados.length !== 1 ? "s" : ""}`}
          </span>
          <button onClick={obtenerUsuarios} style={{ background: "transparent", border: "none", color: "#B89B6A", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
            <RefreshCcw size={12} /> Actualizar
          </button>
        </div>

      <div
        className="card p-3 rounded-4 shadow-sm mb-3"
        style={{ background: "#fff", width: "100%" }}
      >
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ minWidth: 850, fontSize: 13 }}>
            <thead style={{ background: "#fafafa" }}>
              <tr>
                {["Usuario", "Correo", "Rol", "Estado", "Acciones"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid #f3f4f6" }}>{h}</th>
                ))}
          <table
            className="table align-middle mb-0"
            style={{ minWidth: "850px" }}
          >
            <thead>
              <tr style={{ fontSize: "13px" }}>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                [1,2,3,4].map(i => (
                  <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                    {[140, 200, 80, 70, 120].map((w, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, width: w, animation: "shimmer 1.4s ease infinite" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "48px", color: "#9ca3af", fontSize: 13 }}>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filtrados.map((u, i) => (
                  <tr key={u.id} className="gu-row" style={{ borderBottom: "1px solid #f9fafb", animationDelay: `${i * 0.04}s` }}>

                    {/* Usuario */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar iniciales={u.iniciales} />
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: "#111" }}>{u.nombre}</p>
              ) : (
                filtrados.map((u) => (
                  <tr key={u.id} style={{ fontSize: "13px" }}>

                    {/* NOMBRE */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center fw-bold"
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: "#B89B6A",
                            color: "#000",
                            flexShrink: 0,
                          }}
                        >
                          {u.iniciales}
                        </div>
                        <span className="fw-semibold">{u.nombre}</span>
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
                      <div style={{ display: "flex", gap: 6 }}>
                    {/* CORREO */}
                    <td>{u.correo}</td>

                    {/* ROL */}
                    <td>{getRol(u.rol)}</td>

                    {/* ESTADO */}
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: u.estado === "activo" ? "#B89B6A" : "#1f2937",
                          color: u.estado === "activo" ? "#000" : "#fff",
                        }}
                      >
                        {u.estado}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td>
                      <div className="d-flex gap-2 align-items-center">

                        {/* VER */}
                        <button className="gu-action" onClick={() => setUsuarioVer(u)}
                          style={{ background: "#f3f4f6", color: "#374151" }}>
                          <Eye size={13} /> Ver
                        </button>
                        <Eye size={16} style={{ cursor: "pointer" }} />

                        {/* EDITAR */}
                        <button className="gu-action" onClick={() => editarUsuario(u)}
                          style={{ background: "rgba(184,155,106,0.12)", color: "#8C7450" }}>
                          <Pencil size={13} /> Editar
                        </button>
                        <Pencil
                          size={16}
                          style={{ cursor: "pointer" }}
                          onClick={() => editarUsuario(u)}
                        />

                        {/* ACTIVAR / DESACTIVAR */}
                        <button className="gu-action" onClick={() => cambiarEstado(u)}
                          style={{ background: u.activo ? "rgba(245,158,11,0.1)" : "rgba(34,197,94,0.1)", color: u.activo ? "#d97706" : "#16a34a" }}>
                          <RefreshCcw size={13} /> {u.activo ? "Desactivar" : "Activar"}
                        </button>
                        <RefreshCcw
                          size={16}
                          style={{
                            cursor: "pointer",
                            color: u.activo ? "#f59e0b" : "#22c55e",
                          }}
                          onClick={() => cambiarEstado(u)}
                        />

                        {/* ELIMINAR */}
                        <button className="gu-action" onClick={() => eliminarUsuario(u.id)}
                          style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
                          <Trash2 size={13} /> Eliminar
                        </button>
                        <Trash2
                          size={16}
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => eliminarUsuario(u.id)}
                        />

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