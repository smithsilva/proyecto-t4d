import { useState } from "react";
import { User, Mail, Shield, Lock, Camera } from "lucide-react";

function PerfilUsuario({ usuario, setUsuario }) {
  const [tab, setTab] = useState("info");
  const [nombreEditado, setNombreEditado] = useState(usuario?.nombre || "");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNuevo, setPasswordNuevo] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const iniciales = usuario?.nombre
    ? usuario.nombre.substring(0, 2).toUpperCase()
    : "??";

  const subirImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
      const actualizado = { ...usuarioActual, foto: reader.result };
      setUsuario(actualizado);
      localStorage.setItem("usuario", JSON.stringify(actualizado));
    };
    reader.readAsDataURL(file);
  };

  const guardarCambios = () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuario"));
    const actualizado = { ...usuarioActual, nombre: nombreEditado };
    setUsuario(actualizado);
    localStorage.setItem("usuario", JSON.stringify(actualizado));
  };

  const cancelar = () => setNombreEditado(usuario?.nombre || "");

  const inputWrapper = {
    display: "flex", alignItems: "center", gap: 8,
    border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "9px 12px", background: "#fff",
  };
  const inputWrapperReadonly = {
    ...inputWrapper, background: "#f9fafb", border: "1px solid #f3f4f6",
  };
  const inputBase = {
    border: "none", background: "transparent", fontSize: 13,
    color: "#111827", outline: "none", width: "100%",
  };
  const inputReadonly = { ...inputBase, color: "#9ca3af" };
  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: "#374151",
    display: "block", marginBottom: 5,
  };
  const btnPrimary = {
    fontSize: 13, padding: "8px 20px", borderRadius: 999,
    border: "none", background: "#111827", color: "#B89B6A",
    cursor: "pointer", fontWeight: 600,
  };
  const btnSecondary = {
    fontSize: 13, padding: "8px 20px", borderRadius: 999,
    border: "1px solid #e5e7eb", background: "#fff",
    color: "#6b7280", cursor: "pointer",
  };

  return (
    <div style={{ padding: "28px 24px", maxWidth: 860, margin: "0 auto", fontFamily: "inherit" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h5 style={{ fontWeight: 700, margin: "0 0 4px", fontSize: 20, color: "#111827" }}>Mi Perfil</h5>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Gestiona tu información personal</p>
        </div>
        <button style={btnSecondary}>Cerrar</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "stretch" }}>

        {/* COLUMNA IZQUIERDA */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16,
          padding: "24px 16px", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 12,
        }}>

          {/* Avatar */}
          <div style={{
            width: 90, height: 90, borderRadius: "50%",
            background: "#111827", display: "flex", alignItems: "center",
            justifyContent: "center", overflow: "hidden", flexShrink: 0,
          }}>
            {usuario?.foto ? (
              <img src={usuario.foto} alt="perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 30, fontWeight: 700, color: "#B89B6A" }}>{iniciales}</span>
            )}
          </div>

          {/* Nombre y rol */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 3px", color: "#111827" }}>{usuario?.nombre}</p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px" }}>{usuario?.correo}</p>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 999, background: "#f5efe4", color: "#7a6340" }}>
              {usuario?.rol}
            </span>
          </div>

          {/* Estado y último acceso */}
          <div style={{ width: "100%", borderTop: "1px solid #f3f4f6", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#6b7280" }}>Estado</span>
              <span style={{ color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                Activo
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#6b7280" }}>Último acceso</span>
              <span style={{ color: "#374151" }}>Hace 2h</span>
            </div>
          </div>

          {/* Spacer para empujar el botón abajo */}
          <div style={{ flex: 1 }} />

          {/* Botón cambiar foto */}
          <label style={{
            width: "100%", textAlign: "center", fontSize: 12, color: "#6b7280",
            padding: "8px 0", border: "1px solid #e5e7eb", borderRadius: 10,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Camera size={14} /> Cambiar foto
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={subirImagen} />
          </label>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>JPG, PNG · máx 5MB</p>

        </div>

        {/* COLUMNA DERECHA */}
        <div style={{
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16,
          padding: "24px", display: "flex", flexDirection: "column",
        }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
            <button
              onClick={() => setTab("info")}
              style={{ fontSize: 13, padding: "7px 18px", borderRadius: 999, fontWeight: 600, cursor: "pointer", border: "none",
                background: tab === "info" ? "#111827" : "#fff",
                color: tab === "info" ? "#B89B6A" : "#6b7280",
                outline: tab === "info" ? "none" : "1px solid #e5e7eb",
              }}
            >
              Información
            </button>
            <button
              onClick={() => setTab("seguridad")}
              style={{ fontSize: 13, padding: "7px 18px", borderRadius: 999, fontWeight: 600, cursor: "pointer", border: "none",
                background: tab === "seguridad" ? "#111827" : "#fff",
                color: tab === "seguridad" ? "#B89B6A" : "#6b7280",
                outline: tab === "seguridad" ? "none" : "1px solid #e5e7eb",
              }}
            >
              Seguridad
            </button>
          </div>

          {/* TAB INFO */}
          {tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

              <div>
                <label style={labelStyle}>Nombre completo</label>
                <div style={inputWrapper}>
                  <User size={15} color="#9ca3af" />
                  <input type="text" style={inputBase} value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <div style={inputWrapperReadonly}>
                  <Mail size={15} color="#9ca3af" />
                  <input type="email" style={inputReadonly} value={usuario?.correo || ""} readOnly />
                </div>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0" }}>El correo no se puede modificar</p>
              </div>

              <div>
                <label style={labelStyle}>Rol</label>
                <div style={inputWrapperReadonly}>
                  <Shield size={15} color="#9ca3af" />
                  <input type="text" style={inputReadonly} value={usuario?.rol || ""} readOnly />
                </div>
              </div>

              <div style={{ flex: 1 }} />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
                <button style={btnSecondary} onClick={cancelar}>Cancelar</button>
                <button style={btnPrimary} onClick={guardarCambios}>Guardar cambios</button>
              </div>

            </div>
          )}

          {/* TAB SEGURIDAD */}
          {tab === "seguridad" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

              <div>
                <label style={labelStyle}>Contraseña actual</label>
                <div style={inputWrapper}>
                  <Lock size={15} color="#9ca3af" />
                  <input type="password" style={inputBase} placeholder="••••••••"
                    value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Nueva contraseña</label>
                <div style={inputWrapper}>
                  <Lock size={15} color="#9ca3af" />
                  <input type="password" style={inputBase} placeholder="••••••••"
                    value={passwordNuevo} onChange={(e) => setPasswordNuevo(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Confirmar nueva contraseña</label>
                <div style={inputWrapper}>
                  <Lock size={15} color="#9ca3af" />
                  <input type="password" style={inputBase} placeholder="••••••••"
                    value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
                </div>
                {passwordNuevo && passwordConfirm && passwordNuevo !== passwordConfirm && (
                  <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0" }}>Las contraseñas no coinciden</p>
                )}
              </div>

              <div style={{ flex: 1 }} />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
                <button style={btnSecondary} onClick={() => { setPasswordActual(""); setPasswordNuevo(""); setPasswordConfirm(""); }}>
                  Cancelar
                </button>
                <button style={btnPrimary}>Actualizar contraseña</button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default PerfilUsuario;