import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Shield, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { obtenerCategoriasApi } from "../../api/Categoriasapi";

// ─── PALETA (igual a Inventario) ─────────────────────────────────────────────
const DORADO        = "#d4a743";
const DORADO_OSCURO = "#8c6b3f";
const DORADO_CLARO  = "#e7c98a";
const FONDO         = "#f7f1e3";
const ENCABEZADO    = "#13202e";
const TEXTO_ENC     = "#e7c98a";

function CategoriasMecanico() {
  const [busqueda, setBusqueda] = useState("");
  const [categorias, setCategorias] = useState([]);

  useEffect(() => { obtenerCategorias(); }, []);

  const obtenerCategorias = async () => {
    try {
      const data = await obtenerCategoriasApi();

      if (!Array.isArray(data)) {
        Swal.fire({ icon: "error", title: "Error", text: data?.error || "No se pudieron cargar las categorías" });
        return;
      }

      setCategorias(data.map((c, index) => ({
        id: c.id_categoria,
        codigo: `CAT-${String(index + 1).padStart(3, "0")}`,
        nombre: c.nombre_categoria,
        descripcion: c.descripcion,
        activo: c.activo,
        estado: c.activo ? "Activa" : "Inactiva",
      })));
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar las categorías" });
    }
  };

  const normalizar = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtradas = categorias.filter((c) => {
    const texto = normalizar(busqueda);
    return (
      normalizar(c.nombre).includes(texto) ||
      normalizar(c.descripcion).includes(texto) ||
      normalizar(c.codigo).includes(texto)
    );
  });

  const totalActivas   = categorias.filter((c) => c.activo).length;
  const totalInactivas = categorias.filter((c) => !c.activo).length;

  const statCards = [
    { label: "Total Categorías", valor: categorias.length, sublabel: "niveles registrados", Icon: Shield        },
    { label: "Activas",          valor: totalActivas,       sublabel: "en uso",              Icon: CheckCircle  },
    { label: "Inactivas",        valor: totalInactivas,     sublabel: "deshabilitadas",      Icon: XCircle      },
  ];

  return (
    <div className="p-5" style={{ background: FONDO, minHeight: "100vh" }}>

      {/* HEADER (sin botón de agregar) */}
      <div
        className="d-flex justify-content-between align-items-start flex-wrap mb-4 gap-2 p-4 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div>
          <h4 className="fw-bold mb-2" style={{ color: "#1a1a1a" }}>
            Categorías de Blindaje{" "}
            <span className="fw-normal text-muted" style={{ fontSize: "16px" }}>- Consulta de niveles de protección balística</span>
          </h4>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to right, transparent, ${DORADO})`, display: "inline-block" }} />
            <span style={{ color: DORADO, fontSize: "14px" }}>★</span>
            <span style={{ height: "2px", width: "70px", background: `linear-gradient(to left, transparent, ${DORADO})`, display: "inline-block" }} />
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <div key={i} className="rounded-4 shadow-sm"
            style={{ padding: "18px 20px", border: `1.5px solid ${DORADO_CLARO}`, background: "#fffdf8", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <small style={{ color: "#6b7280", fontSize: "13px", fontWeight: "600" }}>{card.label}</small>
              <h3 style={{ fontSize: "26px", fontWeight: "bold", color: DORADO_OSCURO, margin: "4px 0" }}>{card.valor}</h3>
              <small style={{ color: "#9ca3af", fontSize: "12px" }}>{card.sublabel}</small>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f0e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <card.Icon size={18} color={DORADO_OSCURO} />
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div className="p-3 rounded-4 shadow-sm mb-4" style={{ background: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <Filter size={18} color={DORADO_OSCURO} />
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a", fontSize: "16px" }}>Filtros y Búsqueda</h6>
        </div>
        <div style={{ position: "relative" }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: "38px", fontSize: 13 }}
          />
        </div>
      </div>

      {/* TABLA (sin columna de Acciones) */}
      <div className="rounded-4 shadow-sm overflow-hidden" style={{ background: "#fffdf8", border: `1px solid ${DORADO_CLARO}` }}>
        <div className="d-flex justify-content-between align-items-center p-3">
          <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>Categorías Registradas</h6>
          <small style={{ color: "#6b7280" }}>{filtradas.length} categoría{filtradas.length !== 1 ? "s" : ""}</small>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr style={{ backgroundColor: ENCABEZADO }}>
                {["ID", "Nombre Categoría", "Descripción", "Estado"].map((col) => (
                  <th key={col} style={{ fontSize: 13, backgroundColor: ENCABEZADO, color: TEXTO_ENC, border: "none", padding: "12px 8px" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4" style={{ color: "#9ca3af", fontSize: 13 }}>
                    No se encontraron categorías
                  </td>
                </tr>
              ) : (
                filtradas.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #ece4d3", backgroundColor: "#fffdf8" }}>
                    <td style={{ fontSize: 13, color: DORADO_OSCURO, fontWeight: 600 }}>{c.codigo}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Shield size={14} color={DORADO_OSCURO} />
                        <span className="fw-semibold" style={{ fontSize: 13 }}>{c.nombre}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: "#374151" }}>{c.descripcion}</td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        background: c.activo ? "#e3f7e9" : "#fbe2df",
                        color: c.activo ? "#1f9d55" : "#c0392b",
                        padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      }}>
                        {c.activo ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {c.estado}
                      </span>
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

export default CategoriasMecanico;