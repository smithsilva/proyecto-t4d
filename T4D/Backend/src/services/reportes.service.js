const pool = require('../config/db');

// ─── MANTENIMIENTO ────────────────────────────────────────────────────────

exports.getResumenVentas = async () => {
  const { rows: data } = await pool.query('SELECT total FROM mantenimiento');

  const totales = data.map(v => parseFloat(v.total) || 0);
  const suma = totales.reduce((a, b) => a + b, 0);
  return {
    total_servicios: totales.length,
    ingresos_totales: suma,
    ticket_promedio: totales.length ? suma / totales.length : 0,
    servicio_maximo: totales.length ? Math.max(...totales) : 0,
    servicio_minimo: totales.length ? Math.min(...totales) : 0,
  };
};

exports.getVentasPorSucursal = async () => {
  const { rows: data } = await pool.query(`
    SELECT m.total, s.nombre_sucursal
    FROM mantenimiento m
    LEFT JOIN sucursales s ON s.id_sucursal = m.id_sucursal
  `);

  const mapa = {};
  data.forEach(v => {
    const nombre = v.nombre_sucursal || 'Sin sucursal';
    if (!mapa[nombre]) mapa[nombre] = { sucursal: nombre, total_servicios: 0, ingresos: 0 };
    mapa[nombre].total_servicios += 1;
    mapa[nombre].ingresos += parseFloat(v.total) || 0;
  });
  return Object.values(mapa).sort((a, b) => b.ingresos - a.ingresos);
};

exports.getVentasPorMetodoPago = async () => {
  const { rows: data } = await pool.query(`
    SELECT m.total, mp.nombre_metodo
    FROM mantenimiento m
    LEFT JOIN metodos_pago mp ON mp.id_metodo_pago = m.id_metodo_pago
  `);

  const mapa = {};
  data.forEach(v => {
    const metodo = v.nombre_metodo || 'Sin método';
    if (!mapa[metodo]) mapa[metodo] = { metodo_pago: metodo, cantidad: 0, total: 0 };
    mapa[metodo].cantidad += 1;
    mapa[metodo].total += parseFloat(v.total) || 0;
  });
  return Object.values(mapa).sort((a, b) => b.total - a.total);
};

// ─── INVENTARIO ────────────────────────────────────────────────────────────

exports.getStockBajo = async () => {
  const { rows } = await pool.query(`
    SELECT id_producto, nombre_producto, stock_actual
    FROM productos
    WHERE activo = true AND stock_actual <= 5
    ORDER BY stock_actual ASC
  `);
  return rows;
};

exports.getMovimientosInventario = async () => {
  const { rows: data } = await pool.query(`
    SELECT m.id_movimiento, m.tipo_movimiento, m.cantidad, m.fecha_movimiento, m.observacion,
           p.nombre_producto, u.username
    FROM movimientos_inventario m
    LEFT JOIN productos p ON p.id_producto = m.id_producto
    LEFT JOIN usuarios u ON u.id_usuario = m.id_usuario
    ORDER BY m.fecha_movimiento DESC
    LIMIT 100
  `);

  return data.map(m => ({
    id: m.id_movimiento,
    producto: m.nombre_producto || '—',
    tipo: m.tipo_movimiento,
    cantidad: m.cantidad,
    fecha: m.fecha_movimiento,
    usuario: m.username || '—',
    observacion: m.observacion || '—',
  }));
};

exports.getValorizacionInventario = async () => {
  const { rows: data } = await pool.query(`
    SELECT id_producto, nombre_producto, stock_actual, precio_actual
    FROM productos
    WHERE activo = true
  `);

  return data
    .map(p => ({
      id: p.id_producto,
      nombre: p.nombre_producto,
      stock_actual: p.stock_actual,
      precio_actual: p.precio_actual,
      valorizacion: (p.stock_actual || 0) * (p.precio_actual || 0),
    }))
    .sort((a, b) => b.valorizacion - a.valorizacion);
};

// ─── CLIENTES ──────────────────────────────────────────────────────────────

exports.getTopClientes = async () => {
  const { rows: data } = await pool.query(`
    SELECT m.total, c.id_cliente, c.nombre_completo
    FROM mantenimiento m
    LEFT JOIN clientes c ON c.id_cliente = m.id_cliente
  `);

  const mapa = {};
  data.forEach(v => {
    const id = v.id_cliente;
    const nombre = v.nombre_completo || 'Sin cliente';
    if (!id) return;
    if (!mapa[id]) mapa[id] = { id, nombre, total_servicios: 0, total_gastado: 0 };
    mapa[id].total_servicios += 1;
    mapa[id].total_gastado += parseFloat(v.total) || 0;
  });
  return Object.values(mapa)
    .sort((a, b) => b.total_gastado - a.total_gastado)
    .slice(0, 10);
};

// ─── EMPLEADOS ─────────────────────────────────────────────────────────────

exports.getRendimientoEmpleados = async () => {
  const { rows: data } = await pool.query(`
    SELECT m.total, e.cedula, e.nombre_completo
    FROM mantenimiento m
    LEFT JOIN empleados e ON e.cedula = m.id_empleado_cajero
  `);

  const mapa = {};
  data.forEach(v => {
    const cedula = v.cedula;
    const nombre = v.nombre_completo || 'Sin empleado';
    if (!cedula) return;
    if (!mapa[cedula]) mapa[cedula] = { cedula, nombre, servicios_realizados: 0, total_generado: 0 };
    mapa[cedula].servicios_realizados += 1;
    mapa[cedula].total_generado += parseFloat(v.total) || 0;
  });
  return Object.values(mapa)
    .map(e => ({
      ...e,
      promedio_servicio: e.servicios_realizados ? e.total_generado / e.servicios_realizados : 0,
    }))
    .sort((a, b) => b.total_generado - a.total_generado);
};

// ─── FINANCIERO ────────────────────────────────────────────────────────────

exports.getBalancePeriodo = async () => {
  const { rows: data } = await pool.query(`
    SELECT valor, tipo_movimiento, fecha_movimiento
    FROM movimientos_contables
    ORDER BY fecha_movimiento DESC
  `);

  const mapa = {};
  data.forEach(v => {
    if (!v.fecha_movimiento) return;
    // fecha_movimiento puede venir como Date (timestamp) o como texto (date)
    const fechaTxt = v.fecha_movimiento instanceof Date
      ? v.fecha_movimiento.toISOString()
      : String(v.fecha_movimiento);
    const periodo = fechaTxt.slice(0, 7);
    if (!mapa[periodo]) mapa[periodo] = { periodo, ingresos: 0, egresos: 0, cantidad_movimientos: 0 };
    mapa[periodo].cantidad_movimientos += 1;
    // Tu tabla usa 'Ingreso' y 'Egreso' con mayúscula
    if (v.tipo_movimiento === 'Ingreso') {
      mapa[periodo].ingresos += parseFloat(v.valor) || 0;
    } else if (v.tipo_movimiento === 'Egreso') {
      mapa[periodo].egresos += parseFloat(v.valor) || 0;
    }
  });
  return Object.values(mapa)
    .sort((a, b) => b.periodo.localeCompare(a.periodo))
    .slice(0, 12);
};

// ─── PRODUCTOS MÁS USADOS ─────────────────────────────────────────────────

exports.getMasVendidos = async () => {
  const { rows: data } = await pool.query(`
    SELECT d.cantidad, p.id_producto, p.nombre_producto, p.precio_actual
    FROM detalle_asignacion d
    LEFT JOIN productos p ON p.id_producto = d.id_producto
  `);

  const mapa = {};
  data.forEach(d => {
    const id = d.id_producto;
    const nombre = d.nombre_producto || 'Sin nombre';
    if (!id) return;
    if (!mapa[id]) mapa[id] = { id, nombre, unidades_usadas: 0, ingresos_generados: 0 };
    mapa[id].unidades_usadas += d.cantidad || 0;
    mapa[id].ingresos_generados += (d.cantidad || 0) * (parseFloat(d.precio_actual) || 0);
  });
  return Object.values(mapa)
    .sort((a, b) => b.unidades_usadas - a.unidades_usadas)
    .slice(0, 10);
};
