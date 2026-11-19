const {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  agregarEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} = require("../services/empleados.service");

const responderError = (res, error) => {
  res.status(error.status || 500).json({ error: error.message });
};

const leerId = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "ID de empleado inválido" });
    return null;
  }
  return id;
};

// =====================================
// GET  (Admin y Contadora, definido en la ruta)
// =====================================

const getEmpleados = async (req, res) => {
  try {
    res.json(await obtenerEmpleados());
  } catch (error) {
    responderError(res, error);
  }
};

const getEmpleado = async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;

  try {
    res.json(await obtenerEmpleadoPorId(id));
  } catch (error) {
    responderError(res, error);
  }
};

// =====================================
// POST  (solo Admin)
// =====================================

const postEmpleado = async (req, res) => {
  try {
    res.status(201).json(await agregarEmpleado(req.body));
  } catch (error) {
    responderError(res, error);
  }
};

// =====================================
// PUT  (solo Admin)
// =====================================

const putEmpleado = async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;

  try {
    res.json(await actualizarEmpleado(id, req.body, { parcial: false }));
  } catch (error) {
    responderError(res, error);
  }
};

// =====================================
// PATCH  (solo Admin, cualquier campo)
// =====================================

const patchEmpleado = async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;

  try {
    res.json(await actualizarEmpleado(id, req.body || {}, { parcial: true }));
  } catch (error) {
    responderError(res, error);
  }
};

// =====================================
// DELETE  (solo Admin)
// =====================================

const deleteEmpleado = async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;

  try {
    await eliminarEmpleado(id);
    res.json({ success: true, message: "Empleado eliminado" });
  } catch (error) {
    responderError(res, error);
  }
};

module.exports = {
  getEmpleados,
  getEmpleado,
  postEmpleado,
  putEmpleado,
  patchEmpleado,
  deleteEmpleado,
};