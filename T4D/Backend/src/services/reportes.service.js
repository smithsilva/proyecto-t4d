const supabase = require('../config/supabase');

// ─── MANTENIMIENTO ────────────────────────────────────────────────────────

exports.getResumenVentas = async () => {
  const { data, error } = await supabase
    .from('mantenimiento')
    .select('total');
  if (error) throw new Error(error.message);

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
  const { data, error } = await supabase
    .from('mantenimiento')
    .select('total, sucursales(nombre_sucursal)'); // ← nombre_sucursal correcto
  if (error) throw new Error(error.message);

  const mapa = {};
  data.forEach(v => {
    const nombre = v.sucursales?.nombre_sucursal || 'Sin sucursal';
    if (!mapa[nombre]) mapa[nombre] = { sucursal: nombre, total_servicios: 0, ingresos: 0 };
    mapa[nombre].total_servicios += 1;
    mapa[nombre].ingresos += parseFloat(v.total) || 0;
  });
  return Object.values(mapa).sort((a, b) => b.ingresos - a.ingresos);
};

exports.getVentasPorMetodoPago = async () => {
  const { data, error } = await supabase
    .from('mantenimiento')
    .select('total, metodos_pago(nombre_metodo)'); // ← nombre_metodo correcto
  if (error) throw new Error(error.message);

  const mapa = {};
  data.forEach(v => {
    const metodo = v.metodos_pago?.nombre_metodo || 'Sin método';
    if (!mapa[metodo]) mapa[metodo] = { metodo_pago: metodo, cantidad: 0, total: 0 };
    mapa[metodo].cantidad += 1;
    mapa[metodo].total += parseFloat(v.total) || 0;
  });
  return Object.values(mapa).sort((a, b) => b.total - a.total);
};

// ─── INVENTARIO ────────────────────────────────────────────────────────────

exports.getStockBajo = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('id_producto, nombre_producto, stock_actual')
    .lte('stock_actual', 5)
    .order('stock_actual', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

exports.getMovimientosInventario = async () => {
  const { data, error } = await supabase
    .from('movimientos_inventario')
    .select('id_movimiento, tipo_movimiento, cantidad, fecha_movimiento, observacion, productos(nombre_producto), usuarios(username)')
    .order('fecha_movimiento', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);

  return data.map(m => ({
    id: m.id_movimiento,
    producto: m.productos?.nombre_producto || '—',
    tipo: m.tipo_movimiento,
    cantidad: m.cantidad,
    fecha: m.fecha_movimiento,
    usuario: m.usuarios?.username || '—',
    observacion: m.observacion || '—',
  }));
};

exports.getValorizacionInventario = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('id_producto, nombre_producto, stock_actual, precio_actual');
  if (error) throw new Error(error.message);

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
  const { data, error } = await supabase
    .from('mantenimiento')
    .select('total, clientes(id_cliente, nombre_completo)');
  if (error) throw new Error(error.message);

  const mapa = {};
  data.forEach(v => {
    const id = v.clientes?.id_cliente;
    const nombre = v.clientes?.nombre_completo || 'Sin cliente';
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
  const { data, error } = await supabase
    .from('mantenimiento')
    .select('total, empleados!id_empleado_cajero(cedula, nombre_completo)');
  if (error) throw new Error(error.message);

  const mapa = {};
  data.forEach(v => {
    const cedula = v.empleados?.cedula;
    const nombre = v.empleados?.nombre_completo || 'Sin empleado';
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
  const { data, error } = await supabase
    .from('movimientos_contables')
    .select('valor, tipo_movimiento, fecha_movimiento')
    .order('fecha_movimiento', { ascending: false });
  if (error) throw new Error(error.message);

  const mapa = {};
  data.forEach(v => {
    if (!v.fecha_movimiento) return;
    const periodo = v.fecha_movimiento.slice(0, 7);
    if (!mapa[periodo]) mapa[periodo] = { periodo, ingresos: 0, egresos: 0, cantidad_movimientos: 0 };
    mapa[periodo].cantidad_movimientos += 1;
    // ← Corregido: tu tabla usa 'Ingreso' y 'Egreso' con mayúscula
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
  const { data, error } = await supabase
    .from('detalle_asignacion')   // ← cambiado
    .select('cantidad, productos(id_producto, nombre_producto, precio_actual)');
  if (error) throw new Error(error.message);

  const mapa = {};
  data.forEach(d => {
    const id = d.productos?.id_producto;
    const nombre = d.productos?.nombre_producto || 'Sin nombre';
    if (!id) return;
    if (!mapa[id]) mapa[id] = { id, nombre, unidades_usadas: 0, ingresos_generados: 0 };
    mapa[id].unidades_usadas += d.cantidad || 0;
    mapa[id].ingresos_generados += (d.cantidad || 0) * (parseFloat(d.productos?.precio_actual) || 0);
  });
  return Object.values(mapa)
    .sort((a, b) => b.unidades_usadas - a.unidades_usadas)
    .slice(0, 10);
};