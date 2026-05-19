import React, { useState } from "react";

const data = [
  {
    id: "RN-001",
    vehiculo: "APC Guardian",
    problema: "Falla Motor",
    prioridad: "Crítica",
    estado: "Nueva",
    costo: "$15,000",
    fecha: "4/2/2024",
  },
  {
    id: "RN-002",
    vehiculo: "Tank Scorpion",
    problema: "Blindaje Dañado",
    prioridad: "Crítica",
    estado: "Revisada",
    costo: "$25,000",
    fecha: "3/2/2024",
  },
  {
    id: "RN-003",
    vehiculo: "Humvee Armored",
    problema: "Sistema de Luces",
    prioridad: "Media",
    estado: "Aprobada",
    costo: "$3,500",
    fecha: "3/1/2024",
  },
  {
    id: "RN-004",
    vehiculo: "APC Titan",
    problema: "Comunicaciones",
    prioridad: "Alta",
    estado: "Nueva",
    costo: "$8,000",
    fecha: "2/2/2024",
  },
  {
    id: "RN-005",
    vehiculo: "MRAP Defender",
    problema: "Sistema Eléctrico",
    prioridad: "Baja",
    estado: "Revisada",
    costo: "$2,000",
    fecha: "1/2/2024",
  },
];

const Notificaciones = () => {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [prioridadFiltro, setPrioridadFiltro] = useState("");
  const [items, setItems] = useState(data);

  const cambiarEstado = (id, nuevoEstado) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, estado: nuevoEstado } : item
    );
    setItems(updated);
  };

  const filteredData = items.filter((item) => {
    const matchSearch =
      item.vehiculo.toLowerCase().includes(search.toLowerCase()) ||
      item.problema.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    const matchEstado = estadoFiltro === "" || item.estado === estadoFiltro;
    const matchPrioridad =
      prioridadFiltro === "" || item.prioridad === prioridadFiltro;
    return matchSearch && matchEstado && matchPrioridad;
  });

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
          <h4 className="fw-bold mb-1">Notificaciones</h4>

          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#B89B6A",
              borderRadius: "10px",
              marginBottom: "5px",
            }}
          />

          <p
            style={{
              color: "#6b7280",
              fontSize: "13px",
              margin: 0,
            }}
          >
            Revisa y aprueba las solicitudes de reparación de vehículos
          </p>
        </div>
      </div>

      {/* CARDS */}
      <div className="row g-3 mb-4">
        {[
          { title: "Nuevas",    number: "2", subtitle: "sin revisar" },
          { title: "Revisadas", number: "2", subtitle: "pendientes"  },
          { title: "Aprobadas", number: "1", subtitle: "autorizadas" },
          { title: "Críticas",  number: "2", subtitle: "urgente"     },
        ].map((c) => (
          <div className="col-3" key={c.title}>
            <div
              className="card rounded-4 shadow-sm p-3"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  {c.title}
                </span>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#B89B6A",
                    display: "inline-block",
                  }}
                />
              </div>
              <h4 className="fw-bold mb-0" style={{ color: "#111827" }}>
                {c.number}
              </h4>
              <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                {c.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* COSTO TOTAL */}
      <div
        className="card rounded-4 shadow-sm p-3 mb-4 d-flex flex-row justify-content-between align-items-center"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <div>
          <p style={{ fontSize: "13px", color: "#B89B6A", margin: 0 }}>
            Costo Total Estimado
          </p>
          <h4 className="fw-bold mb-0" style={{ color: "#111827" }}>
            $53,500
          </h4>
        </div>
        <span style={{ fontSize: "22px", color: "#B89B6A" }}>↑</span>
      </div>

      {/* FILTROS */}
      <div
        className="card p-3 rounded-4 shadow-sm mb-4"
        style={{ background: "#fff", border: "1px solid #e5e7eb" }}
      >
        <h6 className="fw-bold mb-2" style={{ color: "#B89B6A" }}>
          Filtros y Búsqueda
        </h6>

        <div className="d-flex gap-3">
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="form-select rounded-pill"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="">Estados</option>
            <option value="Nueva">Nueva</option>
            <option value="Revisada">Revisada</option>
            <option value="Aprobada">Aprobada</option>
          </select>

          <select
            className="form-select rounded-pill"
            value={prioridadFiltro}
            onChange={(e) => setPrioridadFiltro(e.target.value)}
            style={{ maxWidth: "200px" }}
          >
            <option value="">Prioridad</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {/* RESULTADO */}
      <p style={{ fontSize: "12px", color: "#6b7280", textAlign: "right", marginBottom: "8px" }}>
        Mostrando {filteredData.length} de {items.length}
      </p>

      {/* TABLA */}
      <div className="card p-3 rounded-4 shadow-sm">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehículo</th>
              <th>Problema</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Costo</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.vehiculo}</td>
                <td>{item.problema}</td>
                <td>{badgePrioridad(item.prioridad)}</td>
                <td>{badgeEstado(item.estado)}</td>
                <td className="fw-bold">{item.costo}</td>
                <td>{item.fecha}</td>
                <td className="d-flex gap-2 align-items-center">
                  <button
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: "#B89B6A",
                      color: "#000",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                    }}
                    onClick={() => cambiarEstado(item.id, "Aprobada")}
                  >
                    ✓
                  </button>

                  <button
                    style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                    onClick={() => cambiarEstado(item.id, "Revisada")}
                  >
                    ✕ Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

const badgePrioridad = (tipo) => {
  const map = {
    Crítica: { background: "#1f2937", color: "#fff" },
    Alta:    { background: "#374151", color: "#fff" },
    Media:   { background: "#B89B6A", color: "#000" },
    Baja:    { background: "#6b7280", color: "#fff" },
  };
  const s = map[tipo] || { background: "#6b7280", color: "#fff" };
  return (
    <span
      style={{
        ...s,
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        textTransform: "capitalize",
      }}
    >
      {tipo}
    </span>
  );
};

const badgeEstado = (estado) => {
  const map = {
    Nueva:    { background: "#1f2937", color: "#fff" },
    Revisada: { background: "#374151", color: "#fff" },
    Aprobada: { background: "#B89B6A", color: "#000" },
  };
  const s = map[estado] || { background: "#6b7280", color: "#fff" };
  return (
    <span
      style={{
        ...s,
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        textTransform: "capitalize",
      }}
    >
      {estado}
    </span>
  );
};

export default Notificaciones;