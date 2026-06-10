import { useState, useCallback, useEffect } from "react";
import { supabase } from '../../Supabase/SupabaseClient';

// ─── Iconos SVG inline (Tabler style) ────────────────────────────────────────
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
const IconPencil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.37 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>
  </svg>
);
const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const IconStar = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const IconUserEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M15 20a6 6 0 0 0-9.33-5"/>
  </svg>
);

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const S = {
  btnGold: {
    padding: "8px 18px", borderRadius: "50px", border: "none",
    background: "#B89B6A", color: "#000", fontSize: "13px",
    cursor: "pointer", fontWeight: "600", display: "inline-flex",
    alignItems: "center", gap: "6px",
  },
  btnGhost: {
    padding: "8px 18px", borderRadius: "50px",
    border: "1.5px solid #e5e7eb", background: "#fff",
    fontSize: "13px", cursor: "pointer", color: "#374151",
    fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px",
  },
  btnSmEdit: {
    padding: "5px 10px", borderRadius: "8px",
    border: "1.5px solid #e5e7eb", background: "#fff",
    fontSize: "12px", cursor: "pointer", color: "#B89B6A",
    display: "inline-flex", alignItems: "center",
  },
  btnSmDelete: {
    padding: "5px 10px", borderRadius: "8px",
    border: "none", background: "#fef2f2",
    fontSize: "12px", cursor: "pointer", color: "#dc2626",
    display: "inline-flex", alignItems: "center",
  },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: "10px",
    border: "1.5px solid #e5e7eb", fontSize: "13px",
    background: "#fafafa", color: "#111827", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  },
  label: {
    fontSize: "12px", fontWeight: "600", color: "#374151",
    display: "block", marginBottom: "6px",
  },
  badgeGold: {
    background: "#B89B6A", color: "#000", padding: "3px 12px",
    borderRadius: "20px", fontSize: "11px", fontWeight: "600",
    display: "inline-flex", alignItems: "center", gap: "5px",
  },
  badgeDark: {
    background: "#374151", color: "#fff", padding: "3px 12px",
    borderRadius: "20px", fontSize: "11px", fontWeight: "600",
  },
  badgePrincipal: {
    background: "#f5e9cc", color: "#8a7450", padding: "3px 10px",
    borderRadius: "20px", fontSize: "11px", fontWeight: "600",
    border: "1px solid #ddd0b0", display: "inline-flex", alignItems: "center", gap: "4px",
  },
};

// ─── Colores para avatares (se asignan por índice) ────────────────────────────
const COLORES = [
  { color: "#E6F1FB", colorTexto: "#0C447C" },
  { color: "#E1F5EE", colorTexto: "#085041" },
  { color: "#FBEAF0", colorTexto: "#72243E" },
  { color: "#EEEDFE", colorTexto: "#3C3489" },
  { color: "#FEF3C7", colorTexto: "#92400E" },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px",
      background: "#1f2937", color: "#fff", padding: "12px 20px",
      borderRadius: "12px", fontSize: "13px", fontWeight: "500",
      zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", gap: "8px",
    }}>
      <IconCheck /> {message}
    </div>
  );
}

// ─── Modal Agregar / Editar Dirección ─────────────────────────────────────────
function ModalDireccion({ tipo, cliente, dirInicial, onGuardar, onCerrar }) {
  const [form, setForm] = useState(
    dirInicial
      ? { ...dirInicial }
      : { direccion: "", ciudad: "", barrio: "", indicaciones: "", esPrincipal: false }
  );
  const [errores, setErrores] = useState({});

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  const validar = () => {
    const e = {};
    if (!form.direccion.trim()) e.direccion = true;
    if (!form.ciudad.trim()) e.ciudad = true;
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;
    onGuardar(form);
  };

  const inputStyle = (campo) => ({
    ...S.input,
    borderColor: errores[campo] ? "#dc2626" : "#e5e7eb",
  });

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.45)", display: "flex",
        justifyContent: "center", alignItems: "center", zIndex: 1050,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div style={{
        background: "#fff", borderRadius: "16px", width: "480px",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
      }}>
        <div style={{
          background: "#1f2937", padding: "20px 24px",
          borderRadius: "16px 16px 0 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#B89B6A" }}><IconMapPin /></span>
              {tipo === "agregar" ? "Agregar dirección" : "Editar dirección"}
            </div>
            <div style={{ color: "#B89B6A", fontSize: "12px", marginTop: "4px" }}>
              Cliente: {cliente.nombre}
            </div>
          </div>
          <button onClick={onCerrar} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex" }}>
            <IconX />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: "14px" }}>
            <label style={S.label}>Dirección completa *</label>
            <input
              style={inputStyle("direccion")}
              type="text"
              placeholder="Ej: Calle 72 # 10-34"
              value={form.direccion}
              onChange={(e) => set("direccion", e.target.value)}
            />
            {errores.direccion && <span style={{ fontSize: "11px", color: "#dc2626" }}>Campo obligatorio</span>}
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Ciudad *</label>
              <input
                style={inputStyle("ciudad")}
                type="text"
                placeholder="Bogotá"
                value={form.ciudad}
                onChange={(e) => set("ciudad", e.target.value)}
              />
              {errores.ciudad && <span style={{ fontSize: "11px", color: "#dc2626" }}>Campo obligatorio</span>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Barrio</label>
              <input style={S.input} type="text" placeholder="Chapinero" value={form.barrio} onChange={(e) => set("barrio", e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={S.label}>Indicaciones de entrega</label>
            <textarea
              rows={3}
              placeholder="Ej: Casa blanca, portón negro, timbre 2 veces"
              value={form.indicaciones}
              onChange={(e) => set("indicaciones", e.target.value)}
              style={{ ...S.input, resize: "none" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <input
              type="checkbox"
              id="chkPrincipal"
              checked={form.esPrincipal}
              onChange={(e) => set("esPrincipal", e.target.checked)}
              style={{ accentColor: "#B89B6A", width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label htmlFor="chkPrincipal" style={{ fontSize: "13px", color: "#111827", cursor: "pointer", fontWeight: "500" }}>
              Marcar como dirección principal
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
            <button style={S.btnGhost} onClick={onCerrar}>Cancelar</button>
            <button style={S.btnGold} onClick={handleGuardar}>
              <IconCheck /> Guardar dirección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Editar Cliente ────────────────────────────────────────────────────
function ModalEditarCliente({ cliente, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    correo: cliente.correo,
    tipoDocumento: cliente.tipoDocumento,
    numeroDocumento: cliente.numeroDocumento,
  });
  const [errores, setErrores] = useState({});

  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = true;
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.45)", display: "flex",
        justifyContent: "center", alignItems: "center", zIndex: 1050,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div style={{
        background: "#fff", borderRadius: "16px", width: "480px",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
      }}>
        <div style={{
          background: "#1f2937", padding: "20px 24px",
          borderRadius: "16px 16px 0 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ color: "#fff", fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#B89B6A" }}><IconUserEdit /></span>
            Editar cliente
          </div>
          <button onClick={onCerrar} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", display: "flex" }}>
            <IconX />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ marginBottom: "14px" }}>
            <label style={S.label}>Nombre completo *</label>
            <input style={{ ...S.input, borderColor: errores.nombre ? "#dc2626" : "#e5e7eb" }}
              type="text" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
            {errores.nombre && <span style={{ fontSize: "11px", color: "#dc2626" }}>Campo obligatorio</span>}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={S.label}>Teléfono</label>
            <input style={S.input} type="text" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={S.label}>Correo electrónico</label>
            <input style={S.input} type="email" value={form.correo} onChange={(e) => set("correo", e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Tipo de documento</label>
              <select value={form.tipoDocumento} onChange={(e) => set("tipoDocumento", e.target.value)} style={{ ...S.input }}>
                <option>Cédula de ciudadanía</option>
                <option>Cédula de extranjería</option>
                <option>Pasaporte</option>
                <option>NIT</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Número de documento</label>
              <input style={S.input} type="text" value={form.numeroDocumento} onChange={(e) => set("numeroDocumento", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
            <button style={S.btnGhost} onClick={onCerrar}>Cancelar</button>
            <button style={S.btnGold} onClick={() => { if (validar()) onGuardar(form); }}>
              <IconCheck /> Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
function DireccionesCliente({ onVolver }) {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // ── Cargar datos desde Supabase ──────────────────────────────────────────
  const cargarClientes = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        id_cliente,
        nombre_completo,
        tipo_documento,
        numero_documento,
        telefono,
        email,
        fecha_registro,
        estado,
        direcciones_cliente (
          id_direccion,
          direccion,
          ciudad,
          barrio,
          indicaciones_entrega,
          es_principal
        )
      `)
      .order('id_cliente');

    if (error) {
      showToast("Error al cargar los datos.");
      setCargando(false);
      return;
    }

    const formateados = data.map((c, i) => {
      const nombre = c.nombre_completo || '';
      const iniciales = nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
      const color = COLORES[i % COLORES.length];
      const fecha = c.fecha_registro
        ? new Date(c.fecha_registro).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';
      return {
        id: c.id_cliente,
        iniciales,
        nombre,
        tipoDocumento: c.tipo_documento,
        numeroDocumento: c.numero_documento,
        telefono: c.telefono,
        correo: c.email,
        fechaRegistro: fecha,
        estado: c.estado || 'Activo',
        color: color.color,
        colorTexto: color.colorTexto,
        direcciones: (c.direcciones_cliente || []).map(d => ({
          id: d.id_direccion,
          direccion: d.direccion,
          ciudad: d.ciudad,
          barrio: d.barrio,
          indicaciones: d.indicaciones_entrega,
          esPrincipal: d.es_principal,
          estado: "Activa",
        })),
      };
    });

    setClientes(formateados);
    setCargando(false);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // ── Agregar dirección ────────────────────────────────────────────────────
  const handleGuardarDireccion = useCallback(async (form) => {
    if (form.esPrincipal) {
      await supabase
        .from('direcciones_cliente')
        .update({ es_principal: false })
        .eq('id_cliente', modal.clienteId);
    }
    const { error } = await supabase.from('direcciones_cliente').insert({
      id_cliente: modal.clienteId,
      direccion: form.direccion,
      ciudad: form.ciudad,
      barrio: form.barrio,
      indicaciones_entrega: form.indicaciones,
      es_principal: form.esPrincipal,
    });
    if (error) { showToast("Error al agregar dirección."); return; }
    showToast("Dirección agregada correctamente.");
    setModal(null);
    cargarClientes();
  }, [modal]);

  // ── Editar dirección ─────────────────────────────────────────────────────
  const handleGuardarEdicionDir = useCallback(async (form) => {
    if (form.esPrincipal) {
      await supabase
        .from('direcciones_cliente')
        .update({ es_principal: false })
        .eq('id_cliente', modal.clienteId);
    }
    const { error } = await supabase
      .from('direcciones_cliente')
      .update({
        direccion: form.direccion,
        ciudad: form.ciudad,
        barrio: form.barrio,
        indicaciones_entrega: form.indicaciones,
        es_principal: form.esPrincipal,
      })
      .eq('id_direccion', modal.dirId);
    if (error) { showToast("Error al actualizar dirección."); return; }
    showToast("Dirección actualizada.");
    setModal(null);
    cargarClientes();
  }, [modal]);

  // ── Editar cliente ───────────────────────────────────────────────────────
  const handleGuardarCliente = useCallback(async (form) => {
    const { error } = await supabase
      .from('clientes')
      .update({
        nombre_completo: form.nombre,
        telefono: form.telefono,
        email: form.correo,
        tipo_documento: form.tipoDocumento,
        numero_documento: form.numeroDocumento,
      })
      .eq('id_cliente', modal.clienteId);
    if (error) { showToast("Error al actualizar cliente."); return; }
    showToast("Cliente actualizado.");
    setModal(null);
    cargarClientes();
  }, [modal]);

  // ── Eliminar dirección ───────────────────────────────────────────────────
  const eliminarDireccion = async (clienteId, dirId) => {
    const cliente = clientes.find(x => x.id === clienteId);
    if (cliente.direcciones.length === 1) {
      showToast("El cliente debe tener al menos una dirección.");
      return;
    }
    const { error } = await supabase
      .from('direcciones_cliente')
      .delete()
      .eq('id_direccion', dirId);
    if (error) { showToast("Error al eliminar dirección."); return; }
    showToast("Dirección eliminada.");
    cargarClientes();
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.numeroDocumento?.includes(busqueda)
  );

  const totalDirecciones = clientes.reduce((a, c) => a + c.direcciones.length, 0);
  const totalPrincipales = clientes.reduce((a, c) => a + c.direcciones.filter(d => d.esPrincipal).length, 0);

  const clienteDelModal = modal ? clientes.find(c => c.id === modal.clienteId) : null;
  const dirDelModal = modal?.dirId ? clienteDelModal?.direcciones.find(d => d.id === modal.dirId) : null;

  return (
    <div className="p-5" style={{ background: "#fff", minHeight: "100vh", marginTop: "1px" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Direcciones del cliente</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Gestión y administración de direcciones registradas por los clientes
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={S.btnGhost} onClick={onVolver || (() => window.history.back())}>
            <IconArrowLeft /> Volver
          </button>
          <button
            className="btn rounded-pill btn-sm"
            style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
            onClick={() => clientesFiltrados[0] && setModal({ tipo: "agregar", clienteId: clientesFiltrados[0].id })}
          >
            <IconPlus /> Agregar dirección
          </button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div style={{ marginBottom: "20px", position: "relative", display: "inline-block" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
          <IconSearch />
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="form-control rounded-pill"
          style={{ width: "340px", paddingLeft: "36px", fontSize: "13px" }}
        />
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total clientes", valor: clientes.length, border: "#B89B6A", color: "#B89B6A", icon: <IconUsers /> },
          { label: "Total direcciones", valor: totalDirecciones, border: "#9ca3af", color: "#374151", icon: <IconMapPin /> },
          { label: "Direcciones principales", valor: totalPrincipales, border: "#ddd0b0", color: "#8a7450", icon: <IconStar /> },
        ].map((stat, i) => (
          <div key={i} className="card shadow-sm rounded-4" style={{ padding: "18px 20px", border: `1.5px solid ${stat.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span style={{ fontSize: "28px", fontWeight: "700", color: stat.color }}>{stat.valor}</span>
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ESTADO DE CARGA */}
      {cargando && (
        <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "14px" }}>
          Cargando datos...
        </div>
      )}

      {/* LISTA DE CLIENTES */}
      {!cargando && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {clientesFiltrados.length === 0 && (
            <div className="card rounded-4" style={{ textAlign: "center", padding: "40px", color: "#9ca3af", border: "1.5px solid #e5e7eb" }}>
              No se encontraron clientes.
            </div>
          )}
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className="card shadow-sm rounded-4" style={{ border: "1.5px solid #e5e7eb", overflow: "hidden" }}>

              {/* Header cliente */}
              <div style={{
                padding: "18px 24px", borderBottom: "1px solid #f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#fafafa", flexWrap: "wrap", gap: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: cliente.color, color: cliente.colorTexto,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "700", fontSize: "15px", flexShrink: 0,
                  }}>
                    {cliente.iniciales}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: "#111827" }}>{cliente.nombre}</div>
                    <div style={{ fontSize: "12px", color: "#374151", marginTop: "2px" }}>
                      {cliente.tipoDocumento} — {cliente.numeroDocumento}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "13px", color: "#374151", display: "flex", alignItems: "center", gap: "5px" }}>
                    <IconPhone /> {cliente.telefono}
                  </span>
                  <span style={{ fontSize: "13px", color: "#374151", display: "flex", alignItems: "center", gap: "5px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={cliente.correo}>
                    <IconMail /> {cliente.correo}
                  </span>
                  <span style={{ fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "5px" }}>
                    <IconCalendar /> {cliente.fechaRegistro}
                  </span>
                  <span style={S.badgeGold}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a1a1a", display: "inline-block" }} />
                    {cliente.estado}
                  </span>
                  <span style={S.badgeDark}>
                    {cliente.direcciones.length} direcci{cliente.direcciones.length === 1 ? "ón" : "ones"}
                  </span>
                </div>
              </div>

              {/* Tabla de direcciones */}
              <div style={{ overflowX: "auto" }}>
                <table className="table align-middle" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      {["ID", "Dirección", "Ciudad", "Barrio", "Indicaciones", "Principal", "Estado", "Acciones"].map((h) => (
                        <th key={h} style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cliente.direcciones.map((dir) => (
                      <tr key={dir.id}>
                        <td style={{ fontSize: "12px", color: "#374151", fontFamily: "monospace" }}>{dir.id}</td>
                        <td style={{ fontSize: "13px", color: "#111827", fontWeight: "600", maxWidth: "200px" }}>{dir.direccion}</td>
                        <td style={{ fontSize: "13px" }}>{dir.ciudad}</td>
                        <td style={{ fontSize: "13px" }}>{dir.barrio}</td>
                        <td style={{ fontSize: "12px", color: "#374151", maxWidth: "180px" }}>{dir.indicaciones}</td>
                        <td>
                          {dir.esPrincipal
                            ? <span style={S.badgePrincipal}><IconStar /> Principal</span>
                            : <span style={{ fontSize: "13px", color: "#9ca3af" }}>—</span>
                          }
                        </td>
                        <td>
                          <span style={S.badgeGold}>{dir.estado}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              style={S.btnSmEdit}
                              title="Editar dirección"
                              onClick={() => setModal({ tipo: "editarDir", clienteId: cliente.id, dirId: dir.id })}
                            >
                              <IconPencil />
                            </button>
                            <button
                              style={S.btnSmDelete}
                              title="Eliminar dirección"
                              onClick={() => eliminarDireccion(cliente.id, dir.id)}
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer cliente */}
              <div style={{
                padding: "12px 24px", borderTop: "1px solid #f3f4f6",
                display: "flex", gap: "10px", justifyContent: "flex-end",
                background: "#fafafa",
              }}>
                <button
                  className="btn rounded-pill btn-sm"
                  style={{ backgroundColor: "#B89B6A", color: "#000", border: "none", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  onClick={() => setModal({ tipo: "agregar", clienteId: cliente.id })}
                >
                  <IconPlus /> Agregar dirección
                </button>
                <button
                  style={{ ...S.btnGhost, fontSize: "12px", padding: "7px 16px" }}
                  onClick={() => setModal({ tipo: "editarCliente", clienteId: cliente.id })}
                >
                  <IconPencil /> Editar cliente
                </button>
                <button
                  style={{ ...S.btnGhost, fontSize: "12px", padding: "7px 16px" }}
                  onClick={() => cargarClientes().then(() => showToast("Datos sincronizados correctamente."))}
                >
                  <IconRefresh /> Actualizar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALES */}
      {modal?.tipo === "agregar" && clienteDelModal && (
        <ModalDireccion
          tipo="agregar"
          cliente={clienteDelModal}
          dirInicial={null}
          onGuardar={handleGuardarDireccion}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editarDir" && clienteDelModal && dirDelModal && (
        <ModalDireccion
          tipo="editar"
          cliente={clienteDelModal}
          dirInicial={dirDelModal}
          onGuardar={handleGuardarEdicionDir}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editarCliente" && clienteDelModal && (
        <ModalEditarCliente
          cliente={clienteDelModal}
          onGuardar={handleGuardarCliente}
          onCerrar={() => setModal(null)}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}

export default DireccionesCliente;