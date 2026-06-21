import { useState } from "react";
import { User, Mail, Shield, Camera, Check, X, LogOut, Info } from "lucide-react";

// ─── Paleta ───────────────────────────────────────────────────────
const DORADO_OSCURO      = "#8c6b3f";
const DORADO_CLARO       = "#e7c98a";
const FONDO              = "#f7f1e3";
const GRADIENTE_DORADO   = "linear-gradient(135deg, #c9941f, #8c6b3f)";

const btnOutline = (activo = false) => ({
  border: `1.5px solid ${DORADO_OSCURO}`,
  color: DORADO_OSCURO,
  background: activo ? "#fdf6e8" : "#fff",
});

function PerfilAdmin({ usuario, setUsuario }) {
  const [nombreEditado, setNombreEditado] = useState(usuario.nombre);
  const [tab, setTab] = useState("info");

  const subirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const actualizado = { ...usuario, foto: reader.result };
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

  const cancelar = () => setNombreEditado(usuario.nombre);

  return (
    <div
      className="p-3"
      style={{ maxWidth: "1600px", margin: "0 auto", maxHeight: "90vh", overflowY: "auto", backgroundColor: FONDO }}
    >

      {/* HEADER */}
      <div
        className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-4"
        style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
      >
        <div>
          <h5 className="fw-bold mb-1" style={{ color: "#1a1a1a" }}>Perfil del Administrador</h5>
          <p className="text-muted mb-0 small">Gestiona tu información personal</p>
        </div>
        <button
          className="btn btn-sm d-flex align-items-center gap-2 fw-semibold rounded-pill"
          style={{ ...btnOutline(), padding: "6px 16px" }}
        >
          <LogOut size={14} color={DORADO_OSCURO} />
          Cerrar
        </button>
      </div>

      {/* FILAS */}
      <div className="row g-3 align-items-stretch">

        {/* TARJETA PERFIL */}
        <div className="col-md-4 d-flex">
          <div
            className="rounded-4 p-3 text-center w-100"
            style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
          >
            <h6 className="fw-bold text-start mb-2" style={{ fontSize: "14px", color: "#1a1a1a" }}>
              Información del Perfil
            </h6>

            {/* FOTO */}
            <div className="mx-auto mb-2 position-relative" style={{ width: "150px", height: "150px" }}>
              <div
                className="d-flex align-items-center justify-content-center shadow-sm overflow-hidden"
                style={{
                  width: "150px", height: "150px", borderRadius: "50%",
                  background: usuario.foto ? "#e5e7eb" : GRADIENTE_DORADO,
                  border: `3px solid ${DORADO_CLARO}`,
                  boxShadow: "0 4px 16px rgba(140,107,63,0.35)",
                }}
              >
                {usuario.foto ? (
                  <img src={usuario.foto} alt="perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#fff", fontSize: "40px", fontWeight: "bold" }}>
                    {usuario.nombre.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Botón cámara superpuesto */}
              <label
                title="Cambiar foto"
                style={{
                  position: "absolute", bottom: "2px", right: "2px",
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: GRADIENTE_DORADO, border: "2.5px solid #fffdf8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 2px 8px rgba(140,107,63,0.5)",
                }}
              >
                <Camera size={16} color="#fff" />
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={subirImagen} />
              </label>
            </div>

            <h6 className="fw-bold mb-0" style={{ color: "#1a1a1a" }}>{usuario.nombre}</h6>
            <p className="text-muted small mb-2">{usuario.correo}</p>

            {/* ROL */}
            <span
              className="badge rounded-pill px-2 py-1 mb-2"
              style={{ background: GRADIENTE_DORADO, color: "#fff", fontSize: "11px", boxShadow: "0 3px 10px rgba(140,107,63,0.4)" }}
            >
              {usuario.rol}
            </span>

            {/* CAMBIAR FOTO */}
            <label
              className="btn btn-sm rounded-pill w-100 mb-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{ ...btnOutline(), cursor: "pointer" }}
            >
              <Camera size={14} color={DORADO_OSCURO} />
              Cambiar foto
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={subirImagen} />
            </label>

            <small className="text-muted d-block" style={{ fontSize: "11px" }}>JPG, PNG • Máx 5MB</small>

            <hr className="my-2" style={{ borderColor: DORADO_CLARO }} />

            {/* ESTADO */}
            <div className="text-start" style={{ fontSize: "12px" }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong>Estado</strong>
                <span style={{ color: "#1f9d55", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1f9d55", display: "inline-block" }} />
                  Activo
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <strong>Último acceso</strong>
                <span style={{ color: DORADO_OSCURO, fontWeight: 600 }}>Hace 2h</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONFIGURACIÓN */}
        <div className="col-md-8 d-flex">
          <div
            className="rounded-4 p-3 w-100"
            style={{ backgroundColor: "#fffdf8", border: `1px solid ${DORADO_CLARO}`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
          >
            <h6 className="fw-bold mb-2" style={{ fontSize: "14px", color: "#1a1a1a" }}>
              Configuración de Cuenta
            </h6>

            {/* TABS */}
            <div className="d-flex gap-2 mb-3">
              <button
                className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 fw-semibold"
                onClick={() => setTab("info")}
                style={btnOutline(tab === "info")}
              >
                <Info size={14} color={DORADO_OSCURO} /> Información
              </button>
              <button
                className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 fw-semibold"
                onClick={() => setTab("seguridad")}
                style={btnOutline(tab === "seguridad")}
              >
                <Shield size={14} color={DORADO_OSCURO} /> Seguridad
              </button>
            </div>

            {tab === "info" ? (
              <>
                {/* NOMBRE */}
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Nombre completo</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white" style={{ borderColor: "#d1d5db" }}>
                      <User size={14} color={DORADO_OSCURO} />
                    </span>
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
                  <label className="form-label small fw-semibold">Correo electrónico</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white" style={{ borderColor: "#d1d5db" }}>
                      <Mail size={14} color={DORADO_OSCURO} />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      style={{ backgroundColor: "#f3f4f6" }}
                      value={usuario.correo}
                      readOnly
                    />
                  </div>
                  <small className="d-block mt-1" style={{ fontSize: "10px", color: DORADO_OSCURO }}>
                    El correo no se puede modificar
                  </small>
                </div>

                {/* ROL */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Rol del sistema</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white" style={{ borderColor: "#d1d5db" }}>
                      <Shield size={14} color={DORADO_OSCURO} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      style={{ backgroundColor: "#f3f4f6" }}
                      value={usuario.rol}
                      readOnly
                    />
                  </div>
                </div>

                {/* BOTONES */}
                <div className="d-flex justify-content-end gap-2 pt-2" style={{ borderTop: `1px solid ${DORADO_CLARO}` }}>
                  <button
                    className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 fw-semibold"
                    onClick={cancelar}
                    style={btnOutline()}
                  >
                    <X size={14} color={DORADO_OSCURO} /> Cancelar
                  </button>
                  <button
                    className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 fw-semibold"
                    onClick={guardarCambios}
                    style={btnOutline()}
                  >
                    <Check size={14} color={DORADO_OSCURO} /> Guardar cambios
                  </button>
                </div>
              </>
            ) : (
              <div className="text-muted small" style={{ padding: "16px 0" }}>
                Próximamente: opciones de seguridad (cambio de contraseña, verificación en dos pasos, sesiones activas).
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default PerfilAdmin;