// RF-006 — Registrar y consultar movimientos de inventario
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");
const { ROLES, headers, resultado } = require("./helpers");

beforeEach(() => pool.query.mockReset());

const movimientos = [
  { id_movimiento: 2, tipo_movimiento: "salida", cantidad: 3, observacion: "Ajuste de stock" },
  { id_movimiento: 1, tipo_movimiento: "entrada", cantidad: 20, observacion: "Stock inicial al crear producto" },
];

describe("RF-006 · GET /movimientos", () => {
  test.each([
    ["Administrador", ROLES.ADMIN],
    ["Gerente", ROLES.GERENTE],
  ])("CP-MOV-01: %s puede consultar el historial (200)", async (_n, rol) => {
    pool.query.mockResolvedValueOnce(resultado(movimientos));

    const res = await request(app).get("/movimientos").set(headers(rol));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(pool.query.mock.calls[0][0]).toMatch(/FROM movimientos_inventario m/);
  });

  test("CP-MOV-02: se ordena del más reciente al más antiguo y trae producto y usuario", async () => {
    pool.query.mockResolvedValueOnce(resultado(movimientos));
    await request(app).get("/movimientos").set(headers(ROLES.ADMIN));
    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/ORDER BY m\.fecha_movimiento DESC/);
    expect(sql).toMatch(/LEFT JOIN productos p/);
    expect(sql).toMatch(/LEFT JOIN usuarios u/);
  });

  test.each([
    ["Contadora", ROLES.CONTADORA],
    ["Mecánico", ROLES.MECANICO],
  ])("CP-MOV-03: %s NO puede consultar movimientos (403)", async (_n, rol) => {
    const res = await request(app).get("/movimientos").set(headers(rol));
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-MOV-04: sin token responde 401", async () => {
    const res = await request(app).get("/movimientos").set({ "x-api-key": process.env.X_API_KEY });
    expect(res.status).toBe(401);
  });

  test("CP-MOV-05: error de base de datos responde 500", async () => {
    pool.query.mockRejectedValueOnce(new Error("fallo BD"));
    const res = await request(app).get("/movimientos").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("fallo BD");
  });
});

describe("RF-006 · POST /movimientos", () => {
  const nuevo = { id_producto: 1, id_usuario: 10, tipo_movimiento: "entrada", cantidad: 5, observacion: "Compra" };

  test("CP-MOV-06: Admin registra un movimiento (201)", async () => {
    pool.query.mockResolvedValueOnce(resultado([{ id_movimiento: 9, ...nuevo }]));

    const res = await request(app).post("/movimientos").set(headers(ROLES.ADMIN)).send(nuevo);

    expect(res.status).toBe(201);
    expect(res.body[0].id_movimiento).toBe(9);
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/^INSERT INTO "movimientos_inventario"/);
    expect(valores).toEqual([1, 10, "entrada", 5, "Compra"]);
  });

  test("CP-MOV-07: Gerente no puede crear movimientos (403)", async () => {
    const res = await request(app).post("/movimientos").set(headers(ROLES.GERENTE)).send(nuevo);
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-MOV-08: error de base de datos al insertar responde 500", async () => {
    pool.query.mockRejectedValueOnce(new Error("violación de restricción"));
    const res = await request(app).post("/movimientos").set(headers(ROLES.ADMIN)).send(nuevo);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("violación de restricción");
  });
});