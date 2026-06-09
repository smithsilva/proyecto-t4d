const express = require('express');
const router = express.Router();


const ctrl = require('../controllers/reportes.controller');

// ─── VENTAS ────────────────────────────────────────────────────────────────
router.get('/ventas/resumen',         ctrl.resumenVentas);
router.get('/ventas/por-sucursal',    ctrl.ventasPorSucursal);
router.get('/ventas/por-metodo-pago', ctrl.ventasPorMetodoPago);

// ─── INVENTARIO ────────────────────────────────────────────────────────────
router.get('/inventario/stock-bajo',   ctrl.stockBajo);
router.get('/inventario/movimientos',  ctrl.movimientosInventario);
router.get('/inventario/valorizacion', ctrl.valorizacionInventario);

// ─── CLIENTES ──────────────────────────────────────────────────────────────
router.get('/clientes/top', ctrl.topClientes);

// ─── EMPLEADOS ─────────────────────────────────────────────────────────────
router.get('/empleados/rendimiento', ctrl.rendimientoEmpleados);

// ─── FINANCIERO ────────────────────────────────────────────────────────────
router.get('/financiero/balance', ctrl.balancePeriodo);

// ─── PRODUCTOS ─────────────────────────────────────────────────────────────
router.get('/productos/mas-vendidos', ctrl.masVendidos);

module.exports = router;