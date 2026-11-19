// RF-017 — Enviar y consultar notificaciones
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");
const { ROLES, headers, tokenDe, resultado } = require("./helpers");

beforeEach(() => pool.query.mockReset());

describe("RF-017 · GET /notificaciones (bandeja por rol)", () => {
  test.each([
    [ROLES.ADMIN, "Admin"],
    [ROLES.CONTADORA, "Contadora"],
    [ROLES.GERENTE, "Gerente"],
    [ROLES.MECANICO, "Mecanico"],
  ])("CP-NOT-01: el rol %i solo recibe las notificaciones destinadas a '%s'", async (idRol, nombre) => {
    pool.query.mockResolvedValueOnce(
      resultado([{ id_notificacion: 1, rol_destino: nombre, leido: false }])
    );

    const res = await request(app).get("/notificaciones").set(headers(idRol));

    expect(res.status).toBe(200);
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/WHERE rol_destino = \$1/);
    expect(valores).toEqual([nombre]);
  });

  test("CP-NOT-02: las notificaciones salen de la más reciente a la más antigua", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    await request(app).get("/notificaciones").set(headers(ROLES.ADMIN));
    expect(pool.query.mock.calls[0][0]).toMatch(/ORDER BY fecha DESC/);
  });

  test("CP-NOT-03: el rol sale del TOKEN, no se puede pedir la bandeja de otro rol por la URL", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    await request(app)
      .get("/notificaciones?rol_destino=Admin&id_rol=1")
      .set(headers(ROLES.MECANICO));
    expect(pool.query.mock.calls[0][1]).toEqual(["Mecanico"]);
  });

  test("CP-NOT-04: un rol desconocido en el token responde 400", async () => {
    const res = await request(app)
      .get("/notificaciones")
      .set({ "x-api-key": process.env.X_API_KEY, Authorization: `Bearer ${tokenDe(99)}` });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Rol no reconocido");
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-NOT-05: sin token no se puede consultar (401)", async () => {
    const res = await request(app).get("/notificaciones").set({ "x-api-key": process.env.X_API_KEY });
    expect(res.status).toBe(401);
  });

  test("CP-NOT-06: error de base de datos responde 500", async () => {
    pool.query.mockRejectedValueOnce(new Error("fallo BD"));
    const res = await request(app).get("/notificaciones").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("fallo BD");
  });
});

describe("RF-017 · PATCH /notificaciones/:id/leida", () => {
  test("CP-NOT-07: marca una notificación como leída (200)", async () => {
    pool.query.mockResolvedValueOnce(resultado([{ id_notificacion: 3, leido: true }]));

    const res = await request(app).patch("/notificaciones/3/leida").set(headers(ROLES.MECANICO));

    expect(res.status).toBe(200);
    expect(res.body.leido).toBe(true);
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/^UPDATE "notificaciones" SET "leido" = \$1 WHERE "id_notificacion" = \$2/);
    expect(valores).toEqual([true, "3"]);
  });

  test("CP-NOT-08: una notificación que no existe responde 500 con el mensaje", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    const res = await request(app).patch("/notificaciones/999/leida").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Notificación no encontrada");
  });

  test("CP-NOT-09: error de base de datos responde 500", async () => {
    pool.query.mockRejectedValueOnce(new Error("fallo BD"));
    const res = await request(app).patch("/notificaciones/3/leida").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
  });
});

describe("RF-017 · POST /notificaciones (enviar mensaje)", () => {
  test("CP-NOT-10: sin título o descripción responde 400", async () => {
    const res = await request(app).post("/notificaciones").set(headers(ROLES.ADMIN)).send({ titulo: "Aviso" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("titulo y descripcion son obligatorios");
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-NOT-11: Admin envía un mensaje y se crea una notificación por cada rol (201)", async () => {
    pool.query.mockResolvedValueOnce(resultado([{}, {}, {}, {}]));

    const res = await request(app)
      .post("/notificaciones")
      .set(headers(ROLES.ADMIN))
      .send({ titulo: "Mantenimiento", descripcion: "El sistema se actualizará a las 8 pm" });

    expect(res.status).toBe(201);

    // Un solo INSERT con 4 filas. Cada fila tiene 5 columnas:
    // titulo, descripcion, rol_destino, leido, fecha
    const [sql, v] = pool.query.mock.calls[0];
    expect(sql).toMatch(/^INSERT INTO "notificaciones"/);
    expect(v).toHaveLength(20);

    const columna = (i) => [0, 1, 2, 3].map((fila) => v[fila * 5 + i]);
    expect(columna(2)).toEqual(["Admin", "Gerente", "Contadora", "Mecanico"]); // rol_destino
    expect(columna(0)).toEqual(Array(4).fill("Mantenimiento")); // titulo
    expect(columna(1)).toEqual(Array(4).fill("El sistema se actualizará a las 8 pm")); // descripcion
    expect(columna(3)).toEqual([false, false, false, false]); // llegan "sin leer"
  });

  test("CP-NOT-12: error de base de datos al enviar responde 500", async () => {
    pool.query.mockRejectedValueOnce(new Error("fallo BD"));
    const res = await request(app)
      .post("/notificaciones")
      .set(headers(ROLES.ADMIN))
      .send({ titulo: "Aviso", descripcion: "Texto" });
    expect(res.status).toBe(500);
  });
});