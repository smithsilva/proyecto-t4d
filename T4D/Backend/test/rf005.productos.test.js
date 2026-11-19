// RF-005 — Gestión de productos y existencias
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");
const cloudinary = require("../src/config/cloudinary");
const { ROLES, headers, resultado } = require("./helpers");

beforeEach(() => {
  pool.query.mockReset();
  cloudinary.uploader.upload_stream.mockReset();
  cloudinary.uploader.destroy.mockClear();
});

// ¿Alguna consulta tocó esa tabla?
const consultoTabla = (tabla) => pool.query.mock.calls.some(([sql]) => sql.includes(tabla));

describe("RF-005 · GET /productos", () => {
  test("CP-PROD-01: cualquier rol autenticado puede listar productos (200)", async () => {
    const lista = [{ id_producto: 1, nombre_producto: "Chaleco Nivel III" }];
    pool.query.mockResolvedValueOnce(resultado(lista));
    const res = await request(app).get("/productos").set(headers(ROLES.GERENTE));
    expect(res.status).toBe(200);
    expect(res.body).toEqual(lista);
  });

  test("CP-PROD-02: solo lista productos activos, con categoría, proveedor y sucursal", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    await request(app).get("/productos").set(headers(ROLES.ADMIN));
    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/WHERE p\.activo = true/);
    expect(sql).toMatch(/LEFT JOIN categorias/);
    expect(sql).toMatch(/LEFT JOIN proveedores/);
    expect(sql).toMatch(/LEFT JOIN sucursales/);
  });

  test("CP-PROD-03: error de base de datos responde 500", async () => {
    pool.query.mockRejectedValueOnce(new Error("fallo BD"));
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
  ])("CP-PROD-04: %s no puede crear productos (403)", async (_n, rol) => {
    const res = await request(app).post("/productos").set(headers(rol)).send(nuevo);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("No tienes permisos para esta acción");
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-PROD-05: Admin crea el producto y se generan el movimiento y el historial de precio (201)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([nuevo])) // 1. INSERT productos
      .mockResolvedValueOnce(resultado([nuevo])) // 2. SELECT producto completo
      .mockResolvedValueOnce(resultado([{ id_movimiento: 1 }])) // 3. INSERT movimiento
      .mockResolvedValueOnce(resultado([], 1)); // 4. INSERT historial_precios

    const res = await request(app).post("/productos").set(headers(ROLES.ADMIN)).send(nuevo);

    expect(res.status).toBe(201);

    // 1. el producto se crea activo
    const [sqlProd, valProd] = pool.query.mock.calls[0];
    expect(sqlProd).toMatch(/^INSERT INTO "productos"/);
    expect(valProd).toContain(true);
    expect(valProd).toContain("Chaleco Nivel IIIA");

    // 3. movimiento de "stock inicial" a nombre del usuario del token (id 10)
    const [sqlMov, valMov] = pool.query.mock.calls[2];
    expect(sqlMov).toMatch(/^INSERT INTO "movimientos_inventario"/);
    expect(valMov).toEqual([7, 10, "entrada", 20, "Stock inicial al crear producto"]);

    // 4. primer registro del historial: precio anterior 0 → precio nuevo
    const [sqlHist, valHist] = pool.query.mock.calls[3];
    expect(sqlHist).toMatch(/INSERT INTO historial_precios/);
    expect(valHist.slice(0, 4)).toEqual([7, 0, 350000, "Creación de producto"]);
  });

  test("CP-PROD-06: producto con stock 0 no genera movimiento de inventario", async () => {
    const sinStock = { ...nuevo, stock_actual: 0 };
    pool.query
      .mockResolvedValueOnce(resultado([sinStock]))
      .mockResolvedValueOnce(resultado([sinStock]))
      .mockResolvedValueOnce(resultado([], 1)); // historial

    const res = await request(app).post("/productos").set(headers(ROLES.ADMIN)).send(sinStock);

    expect(res.status).toBe(201);
    expect(consultoTabla("movimientos_inventario")).toBe(false);
    expect(consultoTabla("historial_precios")).toBe(true);
  });

  test("CP-PROD-07: si falla el historial de precios, el producto igual se crea (201)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([nuevo]))
      .mockResolvedValueOnce(resultado([nuevo]))
      .mockResolvedValueOnce(resultado([{ id_movimiento: 1 }]))
      .mockRejectedValueOnce(new Error("fallo historial"));

    const res = await request(app).post("/productos").set(headers(ROLES.ADMIN)).send(nuevo);
    expect(res.status).toBe(201);
  });

  test("CP-PROD-08: error al insertar el producto responde 500", async () => {
    pool.query.mockRejectedValueOnce(new Error("violación de restricción"));
    const res = await request(app).post("/productos").set(headers(ROLES.ADMIN)).send(nuevo);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("violación de restricción");
  });
});

describe("RF-005 · PATCH /productos/:id/stock (ajuste de stock)", () => {
  // Orden de consultas: 1. stock actual · 2. UPDATE · 3. SELECT completo · 4. movimiento (si cambió)
  const prepararStock = (stockActual, { conMovimiento = true } = {}) => {
    pool.query
      .mockResolvedValueOnce(resultado([{ stock_actual: stockActual }]))
      .mockResolvedValueOnce(resultado([{ id_producto: 1 }]))
      .mockResolvedValueOnce(resultado([{ id_producto: 1 }]));
    if (conMovimiento) pool.query.mockResolvedValueOnce(resultado([{ id_movimiento: 1 }]));
  };

  test("CP-PROD-09: Mecánico aumenta el stock → se registra una ENTRADA", async () => {
    prepararStock(10);
    const res = await request(app).patch("/productos/1/stock").set(headers(ROLES.MECANICO)).send({ stock: 15 });

    expect(res.status).toBe(200);
    const [sqlUpd, valUpd] = pool.query.mock.calls[1];
    expect(sqlUpd).toMatch(/SET "stock_actual" = \$1/);
    expect(valUpd).toEqual([15, "1"]);

    const [sqlMov, valMov] = pool.query.mock.calls[3];
    expect(sqlMov).toMatch(/^INSERT INTO "movimientos_inventario"/);
    expect(valMov).toEqual(["1", 10, "entrada", 5, "Ajuste de stock"]);
  });

  test("CP-PROD-10: Mecánico reduce el stock → se registra una SALIDA", async () => {
    prepararStock(10);
    const res = await request(app).patch("/productos/1/stock").set(headers(ROLES.MECANICO)).send({ stock: 4 });

    expect(res.status).toBe(200);
    expect(pool.query.mock.calls[3][1]).toEqual(["1", 10, "salida", 6, "Ajuste de stock"]);
  });

  test("CP-PROD-11: si el stock no cambia, no se registra movimiento", async () => {
    prepararStock(10, { conMovimiento: false });
    const res = await request(app).patch("/productos/1/stock").set(headers(ROLES.ADMIN)).send({ stock: 10 });

    expect(res.status).toBe(200);
    expect(consultoTabla("movimientos_inventario")).toBe(false);
  });

  test("CP-PROD-12: sin el campo 'stock' responde 400", async () => {
    const res = await request(app).patch("/productos/1/stock").set(headers(ROLES.MECANICO)).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/campo 'stock'/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test.each([
    ["Gerente", ROLES.GERENTE],
    ["Contadora", ROLES.CONTADORA],
  ])("CP-PROD-13: %s no puede ajustar stock (403)", async (_n, rol) => {
    const res = await request(app).patch("/productos/1/stock").set(headers(rol)).send({ stock: 5 });
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-PROD-14: ajustar el stock de un producto que no existe responde 500", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    const res = await request(app).patch("/productos/999/stock").set(headers(ROLES.ADMIN)).send({ stock: 5 });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Producto no encontrado");
  });
});

describe("RF-005 · Edición (solo Admin)", () => {
  test.each([
    ["PUT", "put"],
    ["PATCH", "patch"],
  ])("CP-PROD-15: Mecánico no puede editar un producto (%s → 403)", async (_n, metodo) => {
    const res = await request(app)[metodo]("/productos/1").set(headers(ROLES.MECANICO)).send({ nombre_producto: "X" });
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-PROD-16: Admin edita un producto (PUT → 200)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ id_producto: 1 }])) // UPDATE
      .mockResolvedValueOnce(resultado([{ id_producto: 1, nombre_producto: "Nuevo nombre" }])); // SELECT completo

    const res = await request(app).put("/productos/1").set(headers(ROLES.ADMIN)).send({ nombre_producto: "Nuevo nombre" });

    expect(res.status).toBe(200);
    expect(res.body[0].nombre_producto).toBe("Nuevo nombre");
    expect(pool.query.mock.calls[0][0]).toMatch(/^UPDATE "productos" SET "nombre_producto" = \$1 WHERE "id_producto" = \$2/);
    expect(pool.query.mock.calls[0][1]).toEqual(["Nuevo nombre", "1"]);
  });

  test("CP-PROD-17: editar el stock desde el formulario registra el movimiento", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ stock_actual: 10 }])) // stock anterior
      .mockResolvedValueOnce(resultado([{ id_producto: 1 }])) // UPDATE
      .mockResolvedValueOnce(resultado([{ id_producto: 1 }])) // SELECT completo
      .mockResolvedValueOnce(resultado([{ id_movimiento: 1 }])); // movimiento

    const res = await request(app).put("/productos/1").set(headers(ROLES.ADMIN)).send({ stock_actual: 4 });

    expect(res.status).toBe(200);
    expect(pool.query.mock.calls[3][1]).toEqual([
      "1", 10, "salida", 6, "Ajuste de stock desde edición de producto",
    ]);
  });

  test("CP-PROD-18: al cambiar la imagen se borra la anterior de Cloudinary", async () => {
    const vieja = "https://res.cloudinary.com/demo/image/upload/v1/productos/vieja.png";
    const nueva = "https://res.cloudinary.com/demo/image/upload/v2/productos/nueva.png";
    pool.query
      .mockResolvedValueOnce(resultado([{ imagen: vieja }])) // imagen anterior
      .mockResolvedValueOnce(resultado([{ id_producto: 1 }])) // UPDATE
      .mockResolvedValueOnce(resultado([{ id_producto: 1, imagen: nueva }])); // SELECT completo

    const res = await request(app).patch("/productos/1").set(headers(ROLES.ADMIN)).send({ imagen: nueva });

    expect(res.status).toBe(200);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("productos/vieja", { resource_type: "image" });
  });

  test("CP-PROD-19: si la imagen no cambia, no se borra nada de Cloudinary", async () => {
    const igual = "https://res.cloudinary.com/demo/image/upload/v1/productos/misma.png";
    pool.query
      .mockResolvedValueOnce(resultado([{ imagen: igual }]))
      .mockResolvedValueOnce(resultado([{ id_producto: 1 }]))
      .mockResolvedValueOnce(resultado([{ id_producto: 1 }]));

    await request(app).patch("/productos/1").set(headers(ROLES.ADMIN)).send({ imagen: igual });
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
  });
});

describe("RF-005 · DELETE /productos/:id (solo Admin)", () => {
  test.each([
    ["Gerente", ROLES.GERENTE],
    ["Contadora", ROLES.CONTADORA],
    ["Mecánico", ROLES.MECANICO],
  ])("CP-PROD-20: %s no puede eliminar productos (403)", async (_n, rol) => {
    const res = await request(app).delete("/productos/1").set(headers(rol));
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-PROD-21: Admin elimina un producto sin movimientos (200)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ imagen: null }])) // lee la imagen
      .mockResolvedValueOnce(resultado([], 1)); // DELETE

    const res = await request(app).delete("/productos/1").set(headers(ROLES.ADMIN));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Producto eliminado", desactivado: false });
    expect(pool.query.mock.calls[1][0]).toMatch(/^DELETE FROM productos WHERE id_producto = \$1/);
  });

  test("CP-PROD-22: al eliminar un producto se borra también su imagen de Cloudinary", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ imagen: "https://res.cloudinary.com/demo/image/upload/v1/productos/a.png" }]))
      .mockResolvedValueOnce(resultado([], 1));

    await request(app).delete("/productos/1").set(headers(ROLES.ADMIN));
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("productos/a", { resource_type: "image" });
  });

  test("CP-PROD-23: producto con movimientos asociados se DESACTIVA en lugar de borrarse", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ imagen: "https://res.cloudinary.com/demo/image/upload/v1/productos/a.png" }]))
      .mockRejectedValueOnce(Object.assign(new Error("violates foreign key"), { code: "23503" })) // DELETE falla
      .mockResolvedValueOnce(resultado([], 1)); // UPDATE activo = false

    const res = await request(app).delete("/productos/1").set(headers(ROLES.ADMIN));

    expect(res.status).toBe(200);
    expect(res.body.desactivado).toBe(true);
    expect(res.body.message).toMatch(/fue desactivado/);
    expect(pool.query.mock.calls[2][0]).toMatch(/UPDATE productos SET activo = false WHERE id_producto = \$1/);
    // El producto sigue existiendo, así que su imagen NO se borra
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
  });

  test("CP-PROD-24: otro error de base de datos al eliminar responde 500", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ imagen: null }]))
      .mockRejectedValueOnce(new Error("fallo BD"));
    const res = await request(app).delete("/productos/1").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
  });
});

describe("RF-005 · POST /productos/imagen (Cloudinary)", () => {
  const png = Buffer.from("imagen-falsa");

  test("CP-PROD-25: sin archivo responde 400", async () => {
    const res = await request(app).post("/productos/imagen").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No se envió ninguna imagen");
  });

  test("CP-PROD-26: un archivo que no es imagen responde 400", async () => {
    const res = await request(app)
      .post("/productos/imagen").set(headers(ROLES.ADMIN))
      .attach("imagen", Buffer.from("hola"), { filename: "nota.txt", contentType: "text/plain" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Solo se permiten imágenes");
  });

  test("CP-PROD-27: una imagen mayor a 5 MB responde 400", async () => {
    const grande = Buffer.alloc(5 * 1024 * 1024 + 1);
    const res = await request(app)
      .post("/productos/imagen").set(headers(ROLES.ADMIN))
      .attach("imagen", grande, { filename: "grande.png", contentType: "image/png" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("La imagen supera el máximo de 5 MB");
  });

  test("CP-PROD-28: imagen válida se sube y devuelve la URL (201)", async () => {
    cloudinary.uploader.upload_stream.mockImplementation((_opciones, cb) => ({
      end: () => cb(null, { secure_url: "https://res.cloudinary.com/demo/image/upload/v1/productos/a.png", public_id: "productos/a" }),
    }));
    const res = await request(app)
      .post("/productos/imagen").set(headers(ROLES.MECANICO))
      .attach("imagen", png, { filename: "a.png", contentType: "image/png" });

    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/^https:\/\/res\.cloudinary\.com/);
    expect(res.body.public_id).toBe("productos/a");
    expect(cloudinary.uploader.upload_stream.mock.calls[0][0]).toMatchObject({ folder: "productos", resource_type: "image" });
  });

  test("CP-PROD-29: si Cloudinary falla responde 500", async () => {
    cloudinary.uploader.upload_stream.mockImplementation((_opciones, cb) => ({
      end: () => cb(new Error("Cloudinary no disponible")),
    }));
    const res = await request(app)
      .post("/productos/imagen").set(headers(ROLES.ADMIN))
      .attach("imagen", png, { filename: "a.png", contentType: "image/png" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Cloudinary no disponible");
  });

  test("CP-PROD-30: Gerente no puede subir imágenes (403)", async () => {
    const res = await request(app)
      .post("/productos/imagen").set(headers(ROLES.GERENTE))
      .attach("imagen", png, { filename: "a.png", contentType: "image/png" });
    expect(res.status).toBe(403);
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });
});