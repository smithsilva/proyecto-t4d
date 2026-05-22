import { useState } from "react";
import Swal from "sweetalert2";

function Register({ setVista }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const manejarRegistro = (e) => {
    e.preventDefault();

    if (!nombre || !correo || !password || !confirmar) {
      Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Completa todos los campos",
      });
      return;
    }

    if (password.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Contraseña débil",
        text: "Debe tener mínimo 8 caracteres",
      });
      return;
    }

    if (password !== confirmar) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
      });
      return;
    }

    const nuevoUsuario = {
      nombre,
      correo,
      password,
    };

    localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));

    Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text: "Ahora puedes iniciar sesión",
    });

    setVista("login");
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-4">
      
      <div className="bg-white p-4 rounded-4 shadow" style={{ width: "380px" }}>
        
        
        <div className="text-center mb-3">
          <div
            className="fw-bold d-inline-block px-3 py-2 rounded-3"
            style={{ backgroundColor: "#a3e635" }}
          >
            T4D
          </div>
        </div>

        
        <h6 className="text-center fw-bold">
          TECHNOLOGY FOR DEFENSE SAS.
        </h6>
        <p className="text-center text-muted small">
          Sistema de Control de Inventario de Partes de Vehículos Blindados
        </p>

        {/* BOTONES */}
        <div className="d-flex bg-light rounded-pill p-1 mb-3">
          <button
            className="btn flex-fill text-muted"
            onClick={() => setVista("home")}
          >
            Iniciar Sesión
          </button>
          <button
            className="btn flex-fill rounded-pill"
            style={{ backgroundColor: "#a3e635" }}
          >
            Registrarse
          </button>
        </div>

       
        <form onSubmit={manejarRegistro}>
          
          <div className="mb-2">
            <label className="form-label small">Nombre completo</label>
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="form-label small">Correo electrónico</label>
            <input
              type="email"
              className="form-control rounded-pill"
              placeholder="usuario@empresa.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="form-label small">Contraseña</label>
            <input
              type="password"
              className="form-control rounded-pill"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="form-label small">Confirmar contraseña</label>
            <input
              type="password"
              className="form-control rounded-pill"
              placeholder="Repite tu contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 mt-3 rounded-pill"
            style={{ backgroundColor: "#a3e635" }}
          >
            Crear cuenta
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">
            Al registrarte, aceptas nuestros términos y condiciones
          </small>
        </div>

      </div>
    </div>
  );
}

export default Register;