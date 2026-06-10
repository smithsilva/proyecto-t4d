const API_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/reportes`
  : 'http://localhost:5000/reportes';

// Helper interno
const fetchReporte = async (endpoint) => {
  const res = await fetch(`${API_URL}${endpoint}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.mensaje || `Error en ${endpoint}`);
  return data.data;
};

// ─── VENTAS ────────────────────────────────────────────────────────────────

export const getResumenVentas         = () => fetchReporte('/ventas/resumen');
export const getVentasPorSucursal     = () => fetchReporte('/ventas/por-sucursal');
export const getVentasPorMetodoPago   = () => fetchReporte('/ventas/por-metodo-pago');

// ─── INVENTARIO ────────────────────────────────────────────────────────────

export const getStockBajo             = () => fetchReporte('/inventario/stock-bajo');
export const getMovimientosInventario = () => fetchReporte('/inventario/movimientos');
export const getValorizacionInventario = () => fetchReporte('/inventario/valorizacion');

// ─── CLIENTES ──────────────────────────────────────────────────────────────

export const getTopClientes           = () => fetchReporte('/clientes/top');

// ─── EMPLEADOS ─────────────────────────────────────────────────────────────

export const getRendimientoEmpleados  = () => fetchReporte('/empleados/rendimiento');

// ─── FINANCIERO ────────────────────────────────────────────────────────────

export const getBalancePeriodo        = () => fetchReporte('/financiero/balance');

// ─── PRODUCTOS ─────────────────────────────────────────────────────────────

export const getMasVendidos           = () => fetchReporte('/productos/mas-vendidos');