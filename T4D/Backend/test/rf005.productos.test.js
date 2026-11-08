// RF-005 — Gestión de productos y existencias
const request = require("supertest");
const app = require("../src/app");
const supabase = require("../src/config/supabase");
const cloudinary = require("../src/config/cloudinary");
const { ROLES, headers, consulta, simularTablas } = require("./helpers");

beforeEach(() => {
  supabase.from.mockReset();
  cloudinary.uploader.upload_stream.mockReset();
});

describe("RF-005 · GET /productos", () => {
  test("CP-PROD-01: cualquier rol autenticado puede listar productos (200)", async () => {
    const lista = [{ id_producto: 1, nombre_producto: "Chaleco Nivel III" }];
    simularTablas(supabase, { productos: consulta({ data: lista, error: null }) });
    const res = await request(app).get("/productos").set(headers(ROLES.GERENTE));
    expect(res.status).toBe(200);
    expect(res.body).toEqual(lista);
  });

  test("CP-PROD-02: error de base de datos responde 500", async () => {
    simularTablas(supabase, { productos: consulta({ data: null, error: { message: "fallo BD" } }) });
    const res = await request(app).get("/productos").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("fallo BD");
  });
});

describe("RF-005 · POST /productos (crear)", () => {
  const nuevo = { id_producto: 7, nombre_producto: "Chaleco Nivel IIIA", stock_actual: 20, precio_actual: 350000 };

  test.each([
    ["Mecánico", ROLES.MECANICO],
    ["Gerente", ROLES.GERENTE],
    ["Contadora", ROLES.CONTADORA],
  ])("CP-PROD-03: %s no puede crear productos en este endpoint (403)", async (_n, rol) => {
    const res = await request(app).post("/productos").set(headers(rol)).send(nuevo);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("No tienes permisos para esta acción");
  });

  test("CP-PROD-04: Admin crea el producto y se generan el movimiento y el historial de precio", async () => {
    const productos = consulta({ data: [nuevo], error: null });
    const movimientos = consulta({ data: [{ id_movimiento: 1 }], error: null });
    const historial = consulta({ data: null, error: null });
    simularTablas(supabase, { productos, movimientos_inventario: movimientos, historial_precios: historial });

    const res = await request(app).post("/productos").set(headers(ROLES.ADMIN)).send(nuevo);

    expect(res.status).toBe(201);
    expect(productos.insert).toHaveBeenCalledWith([expect.objectContaining({ activo: true, nombre_producto: "Chaleco Nivel IIIA" })]);
    expect(movimientos.insert).toHaveBeenCalledWith([
      expect.objectContaining({ id_producto: 7, tipo_movimiento: "entrada", cantidad: 20, observacion: "Stock inicial al crear producto" }),
    ]);
    expect(historial.insert).toHaveBeenCalledWith([
      expect.objectContaining({ id_producto: 7, precio_anterior: 0, precio_nuevo: 350000 }),
    ]);
  });

  test("CP-PROD-05: producto con stock 0 no genera movimiento de inventario", async () => {
    const sinStock = { ...nuevo, stock_actual: 0 };
    const movimientos = consulta({ data: [], error: null });
    simularTablas(supabase, {
      productos: consulta({ data: [sinStock], error: null }),
      movimientos_inventario: movimientos,
      historial_precios: consulta({ data: null, error: null }),
    });
    const res = await request(app).post("/productos").set(headers(ROLES.ADMIN)).send(sinStock);
    expect(res.status).toBe(201);
    expect(movimientos.insert).not.toHaveBeenCalled();
  });
});

describe("RF-005 · PATCH /productos/:id/stock (ajuste de stock)", () => {
  const prepararStock = (stockActual) => {
    const movimientos = consulta({ data: [{}], error: null });
    simularTablas(supabase, {
      productos: consulta({ data: { stock_actual: stockActual }, error: null }),
      movimientos_inventario: movimientos,
    });
    return movimientos;
  };

  test("CP-PROD-06: Mecánico aumenta el stock → se registra una ENTRADA", async () => {
    const movimientos = prepararStock(10);
    const res = await request(app).patch("/productos/1/stock").set(headers(ROLES.MECANICO)).send({ stock: 15 });
    expect(res.status).toBe(200);
    expect(movimientos.insert).toHaveBeenCalledWith([
      expect.objectContaining({ tipo_movimiento: "entrada", cantidad: 5, observacion: "Ajuste de stock" }),
    ]);
  });

  test("CP-PROD-07: Mecánico reduce el stock → se registra una SALIDA", async () => {
    const movimientos = prepararStock(10);
    const res = await request(app).patch("/productos/1/stock").set(headers(ROLES.MECANICO)).send({ stock: 4 });
    expect(res.status).toBe(200);
    expect(movimientos.insert).toHaveBeenCalledWith([
      expect.objectContaining({ tipo_movimiento: "salida", cantidad: 6 }),
    ]);
  });

  test("CP-PROD-08: si el stock no cambia, no se registra movimiento", async () => {
    const movimientos = prepararStock(10);
    const res = await request(app).patch("/productos/1/stock").set(headers(ROLES.ADMIN)).send({ stock: 10 });
    expect(res.status).toBe(200);
    expect(movimientos.insert).not.toHaveBeenCalled();
  });

  test("CP-PROD-09: sin el campo 'stock' responde 400", async () => {
    const res = await request(app).patch("/productos/1/stock").set(headers(ROLES.MECANICO)).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/campo 'stock'/);
  });

  test.each([
    ["Gerente", ROLES.GERENTE],
    ["Contadora", ROLES.CONTADORA],
  ])("CP-PROD-10: %s no puede ajustar stock (403)", async (_n, rol) => {
    const res = await request(app).patch("/productos/1/stock").set(headers(rol)).send({ stock: 5 });
    expect(res.status).toBe(403);
  });
});

describe("RF-005 · Edición y eliminación (solo Admin)", () => {
  test("CP-PROD-11: Mecánico no puede editar un producto (PUT → 403)", async () => {
    const res = await request(app).put("/productos/1").set(headers(ROLES.MECANICO)).send({ nombre_producto: "X" });
    expect(res.status).toBe(403);
  });

  test("CP-PROD-12: Admin edita un producto (PUT → 200)", async () => {
    simularTablas(supabase, { productos: consulta({ data: [{ id_producto: 1, nombre_producto: "Nuevo nombre" }], error: null }) });
    const res = await request(app).put("/productos/1").set(headers(ROLES.ADMIN)).send({ nombre_producto: "Nuevo nombre" });
    expect(res.status).toBe(200);
    expect(res.body[0].nombre_producto).toBe("Nuevo nombre");
  });

  test("CP-PROD-13: Gerente no puede eliminar productos (403)", async () => {
    const res = await request(app).delete("/productos/1").set(headers(ROLES.GERENTE));
    expect(res.status).toBe(403);
  });

  test("CP-PROD-14: Admin elimina un producto sin movimientos (200)", async () => {
    supabase.from
      .mockReturnValueOnce(consulta({ data: { imagen: null }, error: null })) // lee la imagen
      .mockReturnValueOnce(consulta({ error: null })); // delete
    const res = await request(app).delete("/productos/1").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Producto eliminado", desactivado: false });
  });

  test("CP-PROD-15: producto con movimientos asociados se DESACTIVA en lugar de borrarse", async () => {
    supabase.from
      .mockReturnValueOnce(consulta({ data: { imagen: null }, error: null }))
      .mockReturnValueOnce(consulta({ error: { code: "23503" } })) // violación de llave foránea
      .mockReturnValueOnce(consulta({ error: null })); // update activo=false
    const res = await request(app).delete("/productos/1").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(200);
    expect(res.body.desactivado).toBe(true);
    expect(res.body.message).toMatch(/fue desactivado/);
  });
});

describe("RF-005 · POST /productos/imagen (Cloudinary)", () => {
  const png = Buffer.from("imagen-falsa");

  test("CP-PROD-16: sin archivo responde 400", async () => {
    const res = await request(app).post("/productos/imagen").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No se envió ninguna imagen");
  });

  test("CP-PROD-17: un archivo que no es imagen responde 400", async () => {
    const res = await request(app)
      .post("/productos/imagen").set(headers(ROLES.ADMIN))
      .attach("imagen", Buffer.from("hola"), { filename: "nota.txt", contentType: "text/plain" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Solo se permiten imágenes");
  });

  test("CP-PROD-18: una imagen mayor a 5 MB responde 400", async () => {
    const grande = Buffer.alloc(5 * 1024 * 1024 + 1);
    const res = await request(app)
      .post("/productos/imagen").set(headers(ROLES.ADMIN))
      .attach("imagen", grande, { filename: "grande.png", contentType: "image/png" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La imagen supera el máximo de 5 MB");
  });

  test("CP-PROD-19: imagen válida se sube y devuelve la URL (201)", async () => {
    cloudinary.uploader.upload_stream.mockImplementation((_op, cb) => ({
      end: () => cb(null, { secure_url: "https://res.cloudinary.com/demo/image/upload/v1/productos/a.png", public_id: "productos/a" }),
    }));
    const res = await request(app)
      .post("/productos/imagen").set(headers(ROLES.MECANICO))
      .attach("imagen", png, { filename: "a.png", contentType: "image/png" });
    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/^https:\/\/res\.cloudinary\.com/);
    expect(res.body.public_id).toBe("productos/a");
  });

  test("CP-PROD-20: Gerente no puede subir imágenes (403)", async () => {
    const res = await request(app)
      .post("/productos/imagen").set(headers(ROLES.GERENTE))
      .attach("imagen", png, { filename: "a.png", contentType: "image/png" });
    expect(res.status).toBe(403);
  });
});