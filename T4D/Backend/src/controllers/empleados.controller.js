const {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  agregarEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
} = require("../services/empleados.service");

const ROL_ADMIN = 1;

// Campos que la Contadora SÍ puede modificar
const CAMPOS_CONTADORA = ["tipo_contrato", "fecha_terminacion"];

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
// GET
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
// POST  (solo Admin, definido en la ruta)
// =====================================

const postEmpleado = async (req, res) => {
  try {
    const empleado = await agregarEmpleado(req.body);
    res.status(201).json(empleado);
  } catch (error) {
    responderError(res, error);
  }
};

// =====================================
// PUT  (solo Admin, definido en la ruta)
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
// PATCH  (Admin: cualquier campo · Contadora: solo tipo_contrato y fecha_terminacion)
// =====================================

const patchEmpleado = async (req, res) => {
  const id = leerId(req, res);
  if (id === null) return;

  const body = req.body || {};

  if (req.usuario.id_rol !== ROL_ADMIN) {
    const noPermitidos = Object.keys(body).filter((c) => !CAMPOS_CONTADORA.includes(c));
    if (noPermitidos.length) {
      return res.status(403).json({
        error: `Solo puedes modificar: ${CAMPOS_CONTADORA.join(", ")}`,
      });
    }
  }

  try {
    res.json(await actualizarEmpleado(id, body, { parcial: true }));
  } catch (error) {
    responderError(res, error);
  }
};

// =====================================
// DELETE  (solo Admin, definido en la ruta)
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