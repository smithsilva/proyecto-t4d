const db = require('../config/db');

// Obtener todos los roles
const obtenerRoles = async () => {
    const [rows] = await db.query('SELECT * FROM roles');
    return rows;
};

// Obtener rol por ID
const obtenerRolPorId = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM roles WHERE id = ?',
        [id]
    );

    return rows[0];
};

// Crear rol
const crearRol = async (rol) => {
    const { nombre } = rol;

    const [result] = await db.query(
        'INSERT INTO roles (nombre) VALUES (?)',
        [nombre]
    );

    return result;
};

// Actualizar rol
const actualizarRol = async (id, rol) => {
    const { nombre } = rol;

    const [result] = await db.query(
        'UPDATE roles SET nombre = ? WHERE id = ?',
        [nombre, id]
    );

    return result;
};

// Eliminar rol
const eliminarRol = async (id) => {
    const [result] = await db.query(
        'DELETE FROM roles WHERE id = ?',
        [id]
    );

    return result;
};

module.exports = {
    obtenerRoles,
    obtenerRolPorId,
    crearRol,
    actualizarRol,
    eliminarRol
};