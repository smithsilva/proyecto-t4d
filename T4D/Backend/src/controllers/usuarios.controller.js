const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { insertar, actualizar } = require("../utils/sql");

const SELECT_USUARIO = `
  SELECT u.*,
    CASE WHEN r.id_rol IS NULL THEN NULL ELSE json_build_object(
      'id_rol', r.id_rol,
      'nombre_rol', r.nombre_rol,
      'descripcion', r.descripcion,
      'nivel_acceso', r.nivel_acceso
    ) END AS roles
  FROM usuarios u
  LEFT JOIN roles r ON r.id_rol = u.id_rol`;

// Nunca devolver el hash de la clave ni el token de recuperación
const limpiar = (u) => {
  const { password_hash, reset_code, reset_code_expires, ...resto } = u;
  return resto;
};

const CAMPOS_PERMITIDOS = ["username", "email", "id_rol", "activo", "codigo"];

const soloPermitidos = (body) => {
  const out = {};
  for (const campo of CAMPOS_PERMITIDOS) {
    if (body[campo] !== undefined) out[campo] = body[campo];
  }
  return out;
};

// ======================================
// OBTENER USUARIOS
// ======================================
const obtenerUsuarios = async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT_USUARIO} ORDER BY u.id_usuario ASC`);
    res.json(rows.map(limpiar));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================================
// CREAR USUARIO
// ======================================
const crearUsuario = async (req, res) => {
  try {
    const { username, email, password, id_rol, codigo } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan campos: email o password" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const data = await insertar("usuarios", {
      username,
      email,
      id_rol,
      codigo,
      password_hash,
    });

    res.status(201).json({ success: true, data: data.map(limpiar) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Ya existe un usuario con ese correo" });
    }
    res.status(500).json({ error: error.message });
  }
};

// ======================================
// EDITAR USUARIO
// ======================================
const editarUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await actualizar("usuarios", "id_usuario", id, soloPermitidos(req.body));
    res.json({ success: true, data: data.map(limpiar) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ======================================
// ELIMINAR USUARIO
// ======================================
const eliminarUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM usuarios WHERE id_usuario = $1", [id]);
    res.json({ success: true, message: "Usuario eliminado" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ======================================
// PATCH (versión simple)
// ======================================
const actualizarParcialUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await actualizar("usuarios", "id_usuario", id, soloPermitidos(req.body));
    res.json({ success: true, data: data.map(limpiar) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ======================================
// PATCH USUARIO (actualización parcial, devuelve el rol)
// ======================================
const patchUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const camposActualizar = soloPermitidos(req.body);

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json({
        error: "No se enviaron campos válidos para actualizar",
      });
    }

    const actualizado = await actualizar("usuarios", "id_usuario", id, camposActualizar);

    if (actualizado.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const { rows } = await pool.query(`${SELECT_USUARIO} WHERE u.id_usuario = $1`, [id]);

    res.json({ success: true, data: rows.map(limpiar) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  editarUsuario,
  patchUsuario,
  actualizarParcialUsuario,
  eliminarUsuario,
};
