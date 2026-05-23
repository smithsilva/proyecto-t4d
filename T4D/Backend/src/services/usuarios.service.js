const db = require('../config/db');

// Obtener todos los usuarios
const obtenerUsuarios = async () => {
    const [rows] = await db.query('SELECT * FROM usuarios');
    return rows;
};

// Obtener usuario por ID
const obtenerUsuarioPorId = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [id]
    );

    return rows[0];
};

// Crear usuario
const crearUsuario = async (usuario) => {
    const { nombre, email, password, rol_id } = usuario;

    const [result] = await db.query(
        `INSERT INTO usuarios 
        (nombre, email, password, rol_id)
        VALUES (?, ?, ?, ?)`,
        [nombre, email, password, rol_id]
    );

    return result;
};

// Actualizar usuario
const actualizarUsuario = async (id, usuario) => {
    const { nombre, email, password, rol_id } = usuario;

    const [result] = await db.query(
        `UPDATE usuarios 
        SET nombre = ?, email = ?, password = ?, rol_id = ?
        WHERE id = ?`,
        [nombre, email, password, rol_id, id]
    );

    return result;
};

// Eliminar usuario
const eliminarUsuario = async (id) => {
    const [result] = await db.query(
        'DELETE FROM usuarios WHERE id = ?',
        [id]
    );

    return result;
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};