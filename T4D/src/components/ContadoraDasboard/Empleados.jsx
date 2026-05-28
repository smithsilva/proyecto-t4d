import { useState, useMemo, useEffect } from "react";
import { supabase } from "../../Supabase/SupabaseClient";
import {
  Search,
  Users,
  DollarSign,
  BadgeCheck,
  CalendarDays,
  Eye,
  X,
} from "lucide-react";

const fmt = (n) =>
  "$ " + Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 });

function formatFecha(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre",
  ];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [verEmpleado, setVerEmpleado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from("empleados")
        .select("*")
        .order("id_empleado", { ascending: true });
      if (error) throw error;
      setEmpleados(data || []);
    } catch (err) {
      console.error("Error al cargar empleados:", err.message);
    }
    setCargando(false);
  };

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return empleados;
    return empleados.filter(
      (e) =>
        e.nombre_completo?.toLowerCase().includes(q) ||
        e.cargo?.toLowerCase().includes(q)
    );
  }, [empleados, busqueda]);

  const nominaMensual = empleados.reduce((acc, e) => acc + Number(e.salario), 0);
  const salarioPromedio = empleados.length > 0 ? Math.round(nominaMensual / empleados.length) : 0;

  return (
    <div className="p-5" style={{ background: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Gestión de Empleados</h4>
          <div style={{ width: "60px", height: "3px", backgroundColor: "#B89B6A", borderRadius: "10px", marginBottom: "5px" }} />
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Administra el personal de la empresa</p>
        </div>
      </div>

      {/* CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Total Empleados</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#B89B6A" }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#B89B6A" }}>{empleados.length}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>personal activo</div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Nómina Mensual</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151" }}>
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#374151" }}>{fmt(nominaMensual)}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>costo total</div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 rounded-4 shadow-sm" style={{ border: "1px solid #e5e7eb" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>Salario Promedio</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#1f2937" }}>
                <BadgeCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#1f2937" }}>{fmt(salarioPromedio)}</div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 4 }}>por empleado</div>
          </div>
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div className="card p-3 rounded-4 shadow-sm mb-4" style={{ border: "1px solid #e5e7eb" }}>
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>Filtros y Búsqueda</h6>
        <div style={{ position: "relative" }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar por nombre o cargo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ paddingLeft: "38px" }}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        {cargando ? (
          <div className="text-center py-4" style={{ color: "#6b7280", fontSize: 13 }}>Cargando empleados...</div>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ fontSize: 12 }}>ID</th>
                <th style={{ fontSize: 12 }}>Cédula</th>
                <th style={{ fontSize: 12 }}>Nombre</th>
                <th style={{ fontSize: 12 }}>Cargo</th>
                <th style={{ fontSize: 12 }}>Tipo Contrato</th>
                <th style={{ fontSize: 12 }}>Salario</th>
                <th style={{ fontSize: 12 }}>F. Contratación</th>
                <th style={{ fontSize: 12 }}>F. Terminación</th>
                <th style={{ fontSize: 12 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e) => (
                <tr key={e.id_empleado}>
                  <td style={{ color: "#6b7280", fontWeight: 600, letterSpacing: "1.5px", fontSize: "13px" }}>{e.id_empleado}</td>
                  <td style={{ fontSize: 13, color: "#374151" }}>{e.cedula}</td>
                  <td style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{e.nombre_completo}</td>
                  <td>
                    <span style={{ background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600 }}>
                      {e.cargo}
                    </span>
                  </td>
                  <td>
                    <span style={{ background: "#fdf8f2", color: "#B89B6A", borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 600, border: "1px solid #e8d5b7" }}>
                      {e.tipo_contrato}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "#B89B6A" }}>{fmt(e.salario)}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2" style={{ color: "#374151", fontSize: "13px" }}>
                      <CalendarDays size={15} color="#6b7280" />
                      {formatFecha(e.fecha_contratacion)}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: "#374151" }}>{formatFecha(e.fecha_terminacion)}</td>
                  <td>
                    <button
                      onClick={() => setVerEmpleado(e)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Ver detalle"
                    >
                      <Eye size={15} color="#374151" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL VER */}
      {verEmpleado && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }}
          onClick={() => setVerEmpleado(null)}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: 420, position: "relative" }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <button
              onClick={() => setVerEmpleado(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X size={18} />
            </button>
            <h5 className="fw-bold mb-1">Detalle del Empleado</h5>
            <div style={{ width: 40, height: 3, background: "#B89B6A", borderRadius: 10, marginBottom: 20 }} />

            {[
              ["ID", verEmpleado.id_empleado],
              ["Cédula", verEmpleado.cedula],
              ["Nombre Completo", verEmpleado.nombre_completo],
              ["Cargo", verEmpleado.cargo],
              ["Tipo de Contrato", verEmpleado.tipo_contrato?.replace(/_/g, " ")],
              ["Salario", fmt(verEmpleado.salario)],
              ["Fecha de Contratación", formatFecha(verEmpleado.fecha_contratacion)],
              ["Fecha de Terminación", formatFecha(verEmpleado.fecha_terminacion)],
            ].map(([label, valor]) => (
              <p key={label} style={{ fontSize: 13, marginBottom: 8 }}>
                <strong>{label}:</strong> {valor}
              </p>
            ))}

            <button onClick={() => setVerEmpleado(null)} className="btn btn-secondary w-100 mt-2">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}