import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Search, Clock3, Wrench, Shield, CheckCircle, Eye, Check, X, Plus, Trash2,
} from "lucide-react";
import { supabase } from "../../supabase/supabaseClient";

function MisMantenimientos({ usuario }) {

  // =========================
  // ESTADOS
  // =========================
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  // Modal detalle
  const [modalDetalle, setModalDetalle] = useState(null);
  const [productos, setProductos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({ id_producto: "", cantidad: 1 });
  const [guardando, setGuardando] = useState(false);

  // =========================
  // TIPOS
  // =========================
  const TIPOS = [
    "Mantenimiento", "Reparación", "Blindamiento", "Inspección",
    "Fisica", "Online", "Preventivo", "Correctivo",
    "Blindaje Nivel 1", "Blindaje Nivel 2", "Blindaje Nivel 3",
    "Blindaje Nivel 4", "Blindaje Nivel 5",
  ];

  // =========================
  // CARGAR ASIGNACIONES
  // =========================
  const cargarAsignaciones = async () => {
    if (!usuario) { setCargando(false); return; }
    setCargando(true);

   // cargarAsignaciones — agrega costo y metodos_pago al select
const { data: rows, error } = await supabase
  .from("asignaciones_tareas")
  .select(`
    id_asignacion, id_mecanico, vehiculo, tipo_trabajo,
    descripcion, prioridad, fecha_limite, estado, fecha_asignacion,
    costo,
    metodos_pago(
      nombre_metodo,
      permite_online
    )
  `)
  .eq("id_mecanico", usuario.id_usuario)
  .order("fecha_asignacion", { ascending: false });

// Y en el setData, agrega los dos campos nuevos:
setData((rows || []).map((r) => ({
  id_mantenimiento:    r.id_asignacion,
  fecha_hora:          r.fecha_asignacion?.slice(0, 16).replace("T", " ") || "—",
  tipo_de_mantenimiento: r.tipo_trabajo,
  id_cliente:          r.vehiculo,
  descripcion:         r.descripcion,
  prioridad:           r.prioridad,
  fecha_limite:        r.fecha_limite,
  estado:              r.estado,
  costo:               r.costo,           // ← nuevo
  metodo_pago:         r.metodos_pago,    // ← nuevo
})));

    if (error) {
      Swal.fire({ icon: "error", title: "Error cargando asignaciones", text: error.message });
      setCargando(false);
      return;
    }

    setData((rows || []).map((r) => ({
      id_mantenimiento: r.id_asignacion,
      fecha_hora: r.fecha_asignacion?.slice(0, 16).replace("T", " ") || "—",
      tipo_de_mantenimiento: r.tipo_trabajo,
      id_cliente: r.vehiculo,
      descripcion: r.descripcion,
      prioridad: r.prioridad,
      fecha_limite: r.fecha_limite,
      estado: r.estado,
    })));

    setCargando(false);
  };

  // =========================
  // CARGAR PRODUCTOS (catálogo)
  // =========================
  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("id_producto, nombre_producto, stock_actual")
      .eq("activo", true)
      .order("nombre_producto");
    if (!error) setProductos(data || []);
  };

  // =========================
  // CARGAR DETALLE DE UNA ASIGNACIÓN
  // =========================
  const cargarDetalle = async (id_asignacion) => {
    setCargandoDetalle(true);
    const { data, error } = await supabase
      .from("detalle_asignacion")
      .select(`
        id_detalle,
        cantidad,
        productos(id_producto, nombre_producto, precio_actual)
      `)
      .eq("id_asignacion", id_asignacion);

    if (!error) setDetalles(data || []);
    setCargandoDetalle(false);
  };

  // =========================
  // ABRIR MODAL DETALLE
  // =========================
  const abrirDetalle = async (m) => {
    setModalDetalle(m);
    setNuevoProducto({ id_producto: "", cantidad: 1 });
    await cargarDetalle(m.id_mantenimiento);
  };

  // =========================
  // AGREGAR PRODUCTO AL DETALLE
  // =========================
  const agregarProducto = async () => {
    if (!nuevoProducto.id_producto || nuevoProducto.cantidad < 1) {
      Swal.fire({ icon: "warning", title: "Completa los campos", text: "Selecciona un producto e indica la cantidad.", confirmButtonColor: "#B89B6A" });
      return;
    }

    // Verificar si ya existe en el detalle
    const yaExiste = detalles.find(d => d.productos?.id_producto === parseInt(nuevoProducto.id_producto));
    if (yaExiste) {
      Swal.fire({ icon: "warning", title: "Producto ya agregado", text: "Ese producto ya está en el detalle. Elimínalo primero si quieres cambiar la cantidad.", confirmButtonColor: "#B89B6A" });
      return;
    }

    setGuardando(true);
    const { error } = await supabase
      .from("detalle_asignacion")
      .insert([{
        id_asignacion: modalDetalle.id_mantenimiento,
        id_producto: parseInt(nuevoProducto.id_producto),
        cantidad: parseInt(nuevoProducto.cantidad),
      }]);

    if (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
      setGuardando(false);
      return;
    }

    setNuevoProducto({ id_producto: "", cantidad: 1 });
    await cargarDetalle(modalDetalle.id_mantenimiento);
    setGuardando(false);
  };

  // =========================
  // ELIMINAR PRODUCTO DEL DETALLE
  // =========================
  const eliminarDetalle = async (id_detalle) => {
    const { error } = await supabase
      .from("detalle_asignacion")
      .delete()
      .eq("id_detalle", id_detalle);

    if (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
      return;
    }
    await cargarDetalle(modalDetalle.id_mantenimiento);
  };

  // =========================
  // EFECTO
  // =========================
  useEffect(() => {
    cargarAsignaciones();
    cargarProductos();
    const intervalo = setInterval(cargarAsignaciones, 20000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  // =========================
  // FILTROS
  // =========================
  const filtered = data.filter((d) => {
    const texto = search.toLowerCase();
    const coincideBusqueda =
      !texto ||
      String(d.id_mantenimiento).includes(texto) ||
      (d.id_cliente || "").toLowerCase().includes(texto) ||
      (d.tipo_de_mantenimiento || "").toLowerCase().includes(texto);
    return coincideBusqueda &&
      (!filterEstado || d.estado === filterEstado) &&
      (!filterTipo || d.tipo_de_mantenimiento === filterTipo);
  });

  // =========================
  // MÉTRICAS
  // =========================
  const pendientes  = data.filter((d) => d.estado === "Pendiente").length;
  const enProceso   = data.filter((d) => d.estado === "En proceso").length;
  const finalizados = data.filter((d) => d.estado === "Finalizada").length;

  // =========================
  // ACEPTAR TAREA
  // =========================
  const aceptarTarea = async (id_asignacion) => {
    const { error } = await supabase
      .from("asignaciones_tareas")
      .update({ estado: "En proceso" })
      .eq("id_asignacion", id_asignacion);

    if (error) { Swal.fire({ icon: "error", title: "Error", text: error.message }); return; }

    setData((prev) => prev.map((d) =>
      d.id_mantenimiento === id_asignacion ? { ...d, estado: "En proceso" } : d
    ));
    Swal.fire({ icon: "success", title: "Tarea aceptada", text: "La tarea ahora está en proceso", confirmButtonColor: "#B89B6A", timer: 1800, showConfirmButton: false });
  };

  // =========================
  // FINALIZAR TAREA
  // =========================
  const finalizarTarea = async (id_asignacion) => {
    const { error } = await supabase
      .from("asignaciones_tareas")
      .update({ estado: "Finalizada" })
      .eq("id_asignacion", id_asignacion);

    if (error) { Swal.fire({ icon: "error", title: "Error", text: error.message }); return; }

    setData((prev) => prev.map((d) =>
      d.id_mantenimiento === id_asignacion ? { ...d, estado: "Finalizada" } : d
    ));
    if (modalDetalle?.id_mantenimiento === id_asignacion) {
      setModalDetalle((prev) => ({ ...prev, estado: "Finalizada" }));
    }
    Swal.fire({ icon: "success", title: "Trabajo finalizado", confirmButtonColor: "#B89B6A", timer: 1800, showConfirmButton: false });
  };

  // =========================
  // BADGES
  // =========================
  const TipoBadge = ({ tipo }) => (
    <span style={{ background: "#1f2937", color: "#B89B6A", padding: "7px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
      {tipo || "—"}
    </span>
  );

  const EstadoBadge = ({ estado }) => {
    const estilos = {
      Pendiente:   { background: "#B89B6A", color: "#000" },
      "En proceso": { background: "#1f2937", color: "#fff" },
      Finalizada:  { background: "#14532d", color: "#fff" },
    };
    const estilo = estilos[estado] || { background: "#6b7280", color: "#fff" };
    return (
      <span style={{ ...estilo, padding: "7px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
        {estado}
      </span>
    );
  };

  // =========================
  // TARJETAS MÉTRICAS
  // =========================
  const CardMetric = ({ titulo, valor, subtitulo, icono }) => (
    <div className="col-md-3">
      <div className="p-3 rounded-4 shadow-sm d-flex justify-content-between"
        style={{ background: "#121212", border: "1px solid #B89B6A", color: "#fff" }}>
        <div>
          <small style={{ color: "#B89B6A" }}>{titulo}</small>
          <h5 className="fw-bold mb-0">{valor}</h5>
          <small style={{ color: "#9ca3af", fontSize: "11px" }}>{subtitulo}</small>
        </div>
        {icono}
      </div>
    </div>
  );

  // =========================
  // RENDER
  // =========================
  return (
    <div style={{ padding: "20px", width: "100%", minHeight: "100vh", boxSizing: "border-box" }}>

      {/* HEADER */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Mis Tareas y Mantenimientos</h4>
        <p className="text-muted mb-0" style={{ fontSize: "13px" }}>Visualiza y gestiona tus asignaciones</p>
      </div>

      {/* MÉTRICAS */}
      <div className="row g-3 mb-4">
        <CardMetric titulo="Pendientes"  valor={pendientes}  subtitulo="Por aceptar"    icono={<Clock3 size={20} color="#B89B6A" />} />
        <CardMetric titulo="En proceso"  valor={enProceso}   subtitulo="Trabajos activos" icono={<Wrench size={20} color="#B89B6A" />} />
        <CardMetric titulo="Finalizados" valor={finalizados} subtitulo="Completados"    icono={<CheckCircle size={20} color="#B89B6A" />} />
        <CardMetric titulo="Total tareas" valor={data.length} subtitulo="Asignaciones"  icono={<Shield size={20} color="#B89B6A" />} />
      </div>

      {/* FILTROS */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fff" }}>
        <h6 className="fw-bold mb-3">Filtros y búsqueda</h6>
        <div className="row g-2">
          <div className="col-md-6">
            <div className="position-relative">
              <Search size={16} style={{ position: "absolute", top: "12px", left: "12px", color: "#6b7280" }} />
              <input type="text" className="form-control rounded-pill" placeholder="Buscar..."
                value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "35px" }} />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select rounded-pill" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select rounded-pill" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm" style={{ background: "#fff", width: "100%" }}>
        {cargando ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ display: "inline-block", width: 28, height: 28, border: "3px solid #e5e7eb", borderTop: "3px solid #B89B6A", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ marginTop: 12, color: "#9ca3af", fontSize: 13 }}>Cargando asignaciones...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ minWidth: "900px" }}>
              <thead>
                <tr style={{ fontSize: "13px" }}>
                  <th>ID</th><th>Fecha</th><th>Tipo</th><th>Vehículo / Cliente</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      {data.length === 0 ? "No tienes asignaciones aún" : "Sin resultados"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id_mantenimiento} style={{ fontSize: "13px" }}>
                      <td>#{d.id_mantenimiento}</td>
                      <td>{d.fecha_hora}</td>
                      <td><TipoBadge tipo={d.tipo_de_mantenimiento} /></td>
                      <td>{d.id_cliente || "—"}</td>
                      <td><EstadoBadge estado={d.estado} /></td>
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          <button onClick={() => abrirDetalle(d)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            <Eye size={18} color="#B89B6A" />
                          </button>
                          {d.estado === "Pendiente" && (
                            <button onClick={() => aceptarTarea(d.id_mantenimiento)} className="btn btn-sm"
                              style={{ background: "#B89B6A", color: "#000", border: "none", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
                              <Check size={14} />
                            </button>
                          )}
                          {d.estado === "En proceso" && (
                            <button onClick={() => finalizarTarea(d.id_mantenimiento)} className="btn btn-sm"
                              style={{ background: "#14532d", color: "#fff", border: "none", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==============================
          MODAL DETALLE
      ============================== */}
      {modalDetalle && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setModalDetalle(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: 28, position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera modal */}
            <button onClick={() => setModalDetalle(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer" }}>
              <X size={20} color="#6b7280" />
            </button>

            <h5 className="fw-bold mb-1">Asignación #{modalDetalle.id_mantenimiento}</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 4, marginBottom: 18 }} />

            {/* Info básica */}
            {[
              ["Vehículo",        modalDetalle.id_cliente || "—"],
              ["Tipo",            modalDetalle.tipo_de_mantenimiento || "—"],
              ["Descripción",     modalDetalle.descripcion || "—"],
              ["Prioridad",       modalDetalle.prioridad || "—"],
              ["Fecha asignación",modalDetalle.fecha_hora],
              ["Fecha límite",    modalDetalle.fecha_limite || "—"],
              ["Estado",          modalDetalle.estado],
            ].map(([label, valor]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "#111827", fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{valor}</span>
              </div>
            ))}

            {/* Botones aceptar / finalizar dentro del modal */}
            <div className="d-flex gap-2 mt-3 mb-4">
              {modalDetalle.estado === "Pendiente" && (
                <button onClick={() => aceptarTarea(modalDetalle.id_mantenimiento)} className="btn btn-sm"
                  style={{ background: "#B89B6A", color: "#000", border: "none", borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
                  <Check size={13} /> Aceptar tarea
                </button>
              )}
              {modalDetalle.estado === "En proceso" && (
                <button onClick={() => finalizarTarea(modalDetalle.id_mantenimiento)} className="btn btn-sm"
                  style={{ background: "#14532d", color: "#fff", border: "none", borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
                  <Check size={13} /> Finalizar tarea
                </button>
              )}
            </div>

            {/* Sección productos usados */}
            <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Productos usados</h6>

            {/* Agregar producto */}
            <div className="d-flex gap-2 mb-3" style={{ flexWrap: "wrap" }}>
              <select
                value={nuevoProducto.id_producto}
                onChange={(e) => setNuevoProducto((p) => ({ ...p, id_producto: e.target.value }))}
                className="form-select form-select-sm rounded-pill"
                style={{ flex: 2, minWidth: 160 }}
              >
                <option value="">Seleccionar producto</option>
                {productos.map((p) => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre_producto} (stock: {p.stock_actual})
                  </option>
                ))}
              </select>
              <input
                type="number" min={1}
                value={nuevoProducto.cantidad}
                onChange={(e) => setNuevoProducto((p) => ({ ...p, cantidad: e.target.value }))}
                className="form-control form-control-sm rounded-pill"
                placeholder="Cant."
                style={{ flex: 1, minWidth: 70, maxWidth: 90 }}
              />
              <button onClick={agregarProducto} disabled={guardando}
                className="btn btn-sm"
                style={{ background: "#B89B6A", color: "#000", border: "none", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap" }}>
                <Plus size={13} /> Agregar
              </button>
            </div>

            {/* Lista de productos en el detalle */}
            {cargandoDetalle ? (
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Cargando productos...</p>
            ) : detalles.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9ca3af" }}>No hay productos registrados aún.</p>
            ) : (
              <table className="table table-sm align-middle" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((d) => (
                    <tr key={d.id_detalle}>
                      <td>{d.productos?.nombre_producto || "—"}</td>
                      <td>{d.cantidad}</td>
                      <td>
                        <button onClick={() => eliminarDetalle(d.id_detalle)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default MisMantenimientos;