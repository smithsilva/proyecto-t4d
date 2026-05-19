import { useState } from "react";
import { User, Mail, Shield } from "lucide-react";

function PerfilUsuario({ usuario, setUsuario }) {

 const [nombreEditado, setNombreEditado] = useState(
  usuario?.nombre || ""
);

  const subirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const nuevaFoto = reader.result;
      const actualizado = { ...usuario, foto: nuevaFoto };
      setUsuario(actualizado);
      localStorage.setItem("usuario", JSON.stringify(actualizado));
    };
    reader.readAsDataURL(file);
  };

  const guardarCambios = () => {
    const actualizado = { ...usuario, nombre: nombreEditado };
    setUsuario(actualizado);
    localStorage.setItem("usuario", JSON.stringify(actualizado));
  };

  const cancelar = () => {
    setNombreEditado(usuario.nombre);
  };

  return (
    <div
      className="p-3"
      style={{ maxWidth: "1800px", margin: "0 auto", maxHeight: "88vh", overflowY: "auto" }}
    >

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-1">Mi Perfil</h5>
          <p className="text-muted mb-0 small">Gestiona tu información</p>
        </div>
        <button className="btn btn-light border rounded-pill btn-sm">Cerrar</button>
      </div>

      {/* 🔥 align-items-stretch iguala la altura de ambas columnas */}
      <div className="row g-3 align-items-stretch">

        {/* PERFIL */}
        <div className="col-md-4 d-flex">
          <div className="card border-0 shadow-sm rounded-4 p-3 text-center w-100">

            <h6 className="fw-bold text-start mb-2">Perfil</h6>

            {/* AVATAR */}
            <div
              className="mx-auto mb-2 d-flex align-items-center justify-content-center shadow-sm overflow-hidden"
              style={{ width: "180px", height: "180px", borderRadius: "50%", background: "#e5e7eb" }}
            >
              {usuario.foto ? (
                <img
                  src={usuario.foto}
                  alt="perfil"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    color: "#fff", fontSize: "44px", fontWeight: "bold",
                    background: "linear-gradient(135deg, #1f2937, #B89B6A)",
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {usuario.nombre.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <h6 className="fw-bold mb-0">{usuario.nombre}</h6>
            <p className="text-muted small mb-1">{usuario.correo}</p>

            <span
              className="badge rounded-pill px-2 py-1 mb-2"
              style={{ background: "#B89B6A", color: "#000" }}
            >
              {usuario.rol}
            </span>

            <label className="btn btn-light border rounded-pill w-100 mb-2 btn-sm">
              📷 Cambiar
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={subirImagen} />
            </label>

            <small className="text-muted d-block" style={{ fontSize: "11px" }}>
              JPG, PNG • 5MB
            </small>

            <hr className="my-2" />

            <div className="text-start" style={{ fontSize: "12px" }}>
              <p className="mb-1">
                <strong>Estado:</strong>{" "}
                <span className="badge" style={{ background: "#B89B6A", color: "#000" }}>Activo</span>
              </p>
              <p className="mb-1">
                <strong>Último:</strong> 2h
              </p>
            </div>

          </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div className="col-md-8 d-flex">
          <div className="card border-0 shadow-sm rounded-4 p-3 w-100">

            <h6 className="fw-bold mb-2">Configuración</h6>

            <div className="d-flex gap-2 mb-3">
              <button
                className="btn rounded-pill px-2 btn-sm"
                style={{ background: "#B89B6A", color: "#000" }}
              >
                Info
              </button>
              <button className="btn btn-light border rounded-pill px-2 btn-sm">
                Seguridad
              </button>
            </div>

            {/* NOMBRE */}
            <div className="mb-2">
              <label className="form-label small">Nombre</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><User size={15} /></span>
                <input
                  type="text"
                  className="form-control"
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                />
              </div>
            </div>

            {/* CORREO */}
            <div className="mb-2">
              <label className="form-label small">Correo</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><Mail size={15} /></span>
                <input type="email" className="form-control" value={usuario.correo} readOnly />
              </div>
            </div>

            {/* ROL */}
            <div className="mb-3">
              <label className="form-label small">Rol</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><Shield size={15} /></span>
                <input type="text" className="form-control" value={usuario.rol} readOnly />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-light border rounded-pill px-3 btn-sm"
                onClick={cancelar}
              >
                Cancelar
              </button>
              <button
                className="btn rounded-pill px-3 btn-sm"
                style={{ background: "#B89B6A", color: "#000" }}
                onClick={guardarCambios}
              >
                Guardar
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default PerfilUsuario;