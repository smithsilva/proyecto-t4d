const reportesService = require('../services/reportes.service');

const responder = (res, data) =>
  res.status(200).json({ ok: true, data });

const errorHandler = (res, error) =>
  res.status(500).json({ ok: false, mensaje: error.message });

// ─── VENTAS ────────────────────────────────────────────────────────────────

exports.resumenVentas = async (req, res) => {
  try {
    responder(res, await reportesService.getResumenVentas());
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.ventasPorSucursal = async (req, res) => {
  try {
    responder(res, await reportesService.getVentasPorSucursal());
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.ventasPorMetodoPago = async (req, res) => {
  try {
    responder(res, await reportesService.getVentasPorMetodoPago());
  } catch (error) {
    errorHandler(res, error);
  }
};

// ─── INVENTARIO ────────────────────────────────────────────────────────────

exports.stockBajo = async (req, res) => {
  try {
    responder(res, await reportesService.getStockBajo());
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.movimientosInventario = async (req, res) => {
  try {
    responder(res, await reportesService.getMovimientosInventario());
  } catch (error) {
    errorHandler(res, error);
  }
};

exports.valorizacionInventario = async (req, res) => {
  try {
    responder(res, await reportesService.getValorizacionInventario());
  } catch (error) {
    errorHandler(res, error);
  }
};

// ─── CLIENTES ──────────────────────────────────────────────────────────────

exports.topClientes = async (req, res) => {
  try {
    responder(res, await reportesService.getTopClientes());
  } catch (error) {
    errorHandler(res, error);
  }
};

// ─── EMPLEADOS ─────────────────────────────────────────────────────────────

exports.rendimientoEmpleados = async (req, res) => {
  try {
    responder(res, await reportesService.getRendimientoEmpleados());
  } catch (error) {
    errorHandler(res, error);
  }
};

// ─── FINANCIERO ────────────────────────────────────────────────────────────

exports.balancePeriodo = async (req, res) => {
  try {
    responder(res, await reportesService.getBalancePeriodo());
  } catch (error) {
    errorHandler(res, error);
  }
};

// ─── PRODUCTOS ─────────────────────────────────────────────────────────────

exports.masVendidos = async (req, res) => {
  try {
    responder(res, await reportesService.getMasVendidos());
  } catch (error) {
    errorHandler(res, error);
  }
};