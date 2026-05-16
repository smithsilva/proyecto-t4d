import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  DollarSign,
  BadgeCheck,
  CalendarDays,
  Save,
  X,
} from "lucide-react";

const EMPLEADOS_INICIALES = [
  {
    id: "EMP-001",
    nombre: "General Roberto Vásquez",
    cargo: "Administrador",
    salario: 15000000,
    fecha_contratacion: "2020-01-15",
  },
  {
    id: "EMP-002",
    nombre: "General Carlos Mendoza",
    cargo: "Gerente",
    salario: 12000000,
    fecha_contratacion: "2020-03-10",
  },
  {
    id: "EMP-003",
    nombre: "Sargento Miguel Rodríguez",
    cargo: "Mecánico Senior",
    salario: 4500000,
    fecha_contratacion: "2021-06-20",
  },
  {
    id: "EMP-004",
    nombre: "Licenciada Patricia Ramírez",
    cargo: "Contador",
    salario: 5500000,
    fecha_contratacion: "2020-08-05",
  },
];

const fmt = (n) =>
  "$ " + n.toLocaleString("es-CO", { minimumFractionDigits: 0 });

function formatFecha(iso) {
  const [y, m, d] = iso.split("-");
  const meses = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre",
  ];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

export default function Empleados() {
  const [empleados, setEmpleados] = useState(EMPLEADOS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [empleadoEditar, setEmpleadoEditar] = useState(null);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    cargo: "",
    salario: "",
    fecha_contratacion: "",
  });

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return empleados;
    return empleados.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.cargo.toLowerCase().includes(q)
    );
  }, [empleados, busqueda]);

  const nominaMensual = empleados.reduce((acc, e) => acc + e.salario, 0);
  const salarioPromedio = Math.round(nominaMensual / empleados.length);

  const guardarEmpleado = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      setEmpleados((prev) =>
        prev.map((emp) =>
          emp.id === empleadoEditar.id
            ? { ...nuevoEmpleado, id: empleadoEditar.id, salario: Number(nuevoEmpleado.salario) }
            : emp
        )
      );
    } else {
      const nuevo = {
        ...nuevoEmpleado,
        id: `EMP-00${empleados.length + 1}`,
        salario: Number(nuevoEmpleado.salario),
      };
      setEmpleados([...empleados, nuevo]);
    }
    setMostrarModal(false);
    setModoEdicion(false);
    setNuevoEmpleado({ nombre: "", cargo: "", salario: "", fecha_contratacion: "" });
  };

  const editarEmpleado = (empleado) => {
    setModoEdicion(true);
    setEmpleadoEditar(empleado);
    setNuevoEmpleado(empleado);
    setMostrarModal(true);
  };

  const eliminarEmpleado = (id) => {
    const confirmar = window.confirm("¿Eliminar empleado?");
    if (!confirmar) return;
    setEmpleados((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div
      className="p-5"
      style={{ background: "#fff", minHeight: "100vh" }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">Gestión de Empleados</h4>
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
            Administra el personal de la empresa
          </p>
        </div>
        <button
          onClick={() => { setModoEdicion(false); setMostrarModal(true); }}
          className="btn rounded-pill btn-sm"
          style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}
        >
          <Plus size={16} className="me-1" />
          Agregar Empleado
        </button>
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
        <table className="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Salario</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((e) => (
              <tr key={e.id}>
                <td style={{ color: "#6b7280", fontWeight: 600, letterSpacing: "1.5px", fontSize: "13px" }}>{e.id}</td>
                <td style={{ fontWeight: 600, color: "#111827" }}>{e.nombre}</td>
                <td>
                  <span style={{ background: "#f3f4f6", color: "#374151", borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600 }}>
                    {e.cargo}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: "#B89B6A" }}>{fmt(e.salario)}</td>
                <td>
                  <div className="d-flex align-items-center gap-2" style={{ color: "#374151", fontSize: "13px" }}>
                    <CalendarDays size={15} color="#6b7280" />
                    {formatFecha(e.fecha_contratacion)}
                  </div>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => editarEmpleado(e)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e8d5b7", background: "#fdf8f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Pencil size={15} color="#B89B6A" />
                    </button>
                    <button
                      onClick={() => eliminarEmpleado(e.id)}
                      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Trash2 size={15} color="#dc2626" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }}
        >
          <div className="bg-white p-4 rounded-4 shadow" style={{ width: "400px" }}>
            <h5 className="fw-bold mb-3">{modoEdicion ? "Editar Empleado" : "Agregar Empleado"}</h5>
            <form onSubmit={guardarEmpleado}>
              <input type="text" className="form-control mb-2" placeholder="Nombre" value={nuevoEmpleado.nombre} onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })} />
              <input type="text" className="form-control mb-2" placeholder="Cargo" value={nuevoEmpleado.cargo} onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, cargo: e.target.value })} />
              <input type="number" className="form-control mb-2" placeholder="Salario" value={nuevoEmpleado.salario} onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, salario: e.target.value })} />
              <input type="date" className="form-control mb-3" value={nuevoEmpleado.fecha_contratacion} onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, fecha_contratacion: e.target.value })} />
              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => setMostrarModal(false)} className="btn btn-secondary">
                  <X size={16} />
                </button>
                <button type="submit" className="btn" style={{ backgroundColor: "#B89B6A", color: "#000", border: "none" }}>
                  <Save size={16} className="me-1" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
