const supabase = require("../config/supabase");

// Trae el empleado junto con su rol (FK empleados.id_rol -> roles.id_rol)
const SELECT = "*, roles ( id_rol, nombre_rol )";

const CAMPOS = [
  "cedula",
  "nombre_completo",
  "cargo",
  "salario",
  "fecha_contratacion",
  "fecha_terminacion",
  "tipo_contrato",
  "id_rol",
];

const REQUERIDOS = [
  "cedula",
  "nombre_completo",
  "cargo",
  "salario",
  "fecha_contratacion",
  "tipo_contrato",
];

// =====================================
// UTILIDADES
// =====================================

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Convierte errores de Supabase/Postgres en errores HTTP entendibles
const traducirError = (error) => {
  if (error.status) return error;

  const mapa = {
    "23505": [409, "Ya existe un empleado con esa cédula"],
    "23503": [400, "El rol seleccionado no existe"],
    "23514": [400, "Algún valor no cumple las reglas de la base de datos (revisa el tipo de contrato y las fechas)"],
    "22P02": [400, "Algún valor tiene un formato inválido"],
    "22007": [400, "Alguna fecha tiene un formato inválido"],
    PGRST116: [404, "Empleado no encontrado"],
  };

  const [status, message] = mapa[error.code] || [500, error.message];
  return httpError(status, message);
};

const esFechaValida = (valor) => {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const d = new Date(valor);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === valor;
};

// Deja solo los campos permitidos, los valida y normaliza.
// parcial = true  → PATCH (solo valida lo que venga)
// parcial = false → POST / PUT (exige los campos obligatorios)
const limpiarEmpleado = (datos = {}, { parcial = false } = {}) => {
  const out = {};

  for (const campo of CAMPOS) {
    if (datos[campo] !== undefined) out[campo] = datos[campo];
  }

  if (!parcial) {
    const faltan = REQUERIDOS.filter(
      (c) => out[c] === undefined || out[c] === null || String(out[c]).trim() === ""
    );
    if (faltan.length) {
      throw httpError(400, `Faltan campos obligatorios: ${faltan.join(", ")}`);
    }
    if (out.fecha_terminacion === undefined) out.fecha_terminacion = null;
    if (out.id_rol === undefined) out.id_rol = null;
  }

  // Textos
  for (const c of ["cedula", "nombre_completo", "cargo", "tipo_contrato"]) {
    if (out[c] !== undefined) {
      out[c] = String(out[c] ?? "").trim();
      if (!out[c]) throw httpError(400, `El campo ${c} no puede estar vacío`);
    }
  }

  if (out.cedula !== undefined && !/^\d{5,15}$/.test(out.cedula)) {
    throw httpError(400, "La cédula debe contener solo números (entre 5 y 15 dígitos)");
  }

  // Salario
  if (out.salario !== undefined) {
    const salario = Number(out.salario);
    if (!Number.isFinite(salario) || salario < 0) {
      throw httpError(400, "El salario debe ser un número mayor o igual a 0");
    }
    out.salario = salario;
  }

  // Fechas
  if (out.fecha_contratacion !== undefined && !esFechaValida(out.fecha_contratacion)) {
    throw httpError(400, "fecha_contratacion debe tener formato AAAA-MM-DD");
  }

  if (out.fecha_terminacion === "" || out.fecha_terminacion === null) {
    out.fecha_terminacion = null;
  } else if (out.fecha_terminacion !== undefined && !esFechaValida(out.fecha_terminacion)) {
    throw httpError(400, "fecha_terminacion debe tener formato AAAA-MM-DD");
  }

  // Rol
  if (out.id_rol === "" || out.id_rol === null) {
    out.id_rol = null;
  } else if (out.id_rol !== undefined) {
    out.id_rol = Number(out.id_rol);
    if (!Number.isInteger(out.id_rol) || out.id_rol <= 0) {
      throw httpError(400, "id_rol inválido");
    }
  }

  // La terminación no puede ser anterior a la contratación
  if (
    out.fecha_contratacion &&
    out.fecha_terminacion &&
    out.fecha_terminacion < out.fecha_contratacion
  ) {
    throw httpError(400, "La fecha de terminación no puede ser anterior a la fecha de contratación");
  }

  if (parcial && Object.keys(out).length === 0) {
    throw httpError(400, "No hay campos válidos para actualizar");
  }

  return out;
};

// =====================================
// GET
// =====================================

const obtenerEmpleados = async () => {
  const { data, error } = await supabase
    .from("empleados")
    .select(SELECT)
    .order("id_empleado", { ascending: true });

  if (error) throw traducirError(error);

  return data;
};

const obtenerEmpleadoPorId = async (id) => {
  const { data, error } = await supabase
    .from("empleados")
    .select(SELECT)
    .eq("id_empleado", id)
    .single();

  if (error) throw traducirError(error);

  return data;
};

// =====================================
// POST
// =====================================

const agregarEmpleado = async (empleado) => {
  const payload = limpiarEmpleado(empleado);

  const { data, error } = await supabase
    .from("empleados")
    .insert([payload])
    .select(SELECT);

  if (error) throw traducirError(error);

  return data[0];
};

// =====================================
// PUT / PATCH
// =====================================

const actualizarEmpleado = async (id, datos, { parcial = false } = {}) => {
  const payload = limpiarEmpleado(datos, { parcial });

  // Si solo llega la fecha de terminación (caso contadora), se compara
  // contra la fecha de contratación que ya está guardada.
  if (payload.fecha_terminacion && !payload.fecha_contratacion) {
    const { data: actual, error: errActual } = await supabase
      .from("empleados")
      .select("fecha_contratacion")
      .eq("id_empleado", id)
      .single();

    if (errActual) throw traducirError(errActual);

    if (actual.fecha_contratacion && payload.fecha_terminacion < actual.fecha_contratacion) {
      throw httpError(400, "La fecha de terminación no puede ser anterior a la fecha de contratación");
    }
  }

  const { data, error } = await supabase
    .from("empleados")
    .update(payload)
    .eq("id_empleado", id)
    .select(SELECT);

  if (error) throw traducirError(error);
  if (!data || data.length === 0) throw httpError(404, "Empleado no encontrado");

  return data[0];
};

// =====================================
// DELETE
// =====================================

const eliminarEmpleado = async (id) => {
  const { data, error } = await supabase
    .from("empleados")
    .delete()
    .eq("id_empleado", id)
    .select();

  if (error) throw traducirError(error);
  if (!data || data.length === 0) throw httpError(404, "Empleado no encontrado");
};

module.exports = {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  agregarEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
};