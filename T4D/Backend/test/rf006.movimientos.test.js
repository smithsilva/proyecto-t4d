
// RF-006 — Registrar y consultar movimientos de inventario
const request = require("supertest");
const app = require("../src/app");
const supabase = require("../src/config/supabase");
const { ROLES, headers, consulta, simularTablas } = require("./helpers");

beforeEach(() => supabase.from.mockReset());

const movimientos = [
  { id_movimiento: 2, tipo_movimiento: "salida", cantidad: 3, observacion: "Ajuste de stock" },
  { id_movimiento: 1, tipo_movimiento: "entrada", cantidad: 20, observacion: "Stock inicial al crear producto" },
];

describe("RF-006 · GET /movimientos", () => {
  test.each([
    ["Administrador", ROLES.ADMIN],
    ["Gerente", ROLES.GERENTE],
  ])("CP-MOV-01: %s puede consultar el historial (200)", async (_n, rol) => {
    const q = consulta({ data: movimientos, error: null });
    simularTablas(supabase, { movimientos_inventario: q });
    const res = await request(app).get("/movimientos").set(headers(rol));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    // Se ordena del más reciente al más antiguo
    expect(q.order).toHaveBeenCalledWith("fecha_movimiento", { ascending: false });
  });

  test.each([
    ["Contadora", ROLES.CONTADORA],
    ["Mecánico", ROLES.MECANICO],
  ])("CP-MOV-02: %s NO puede consultar movimientos (403)", async (_n, rol) => {
    const res = await request(app).get("/movimientos").set(headers(rol));
    expect(res.status).toBe(403);
  });

  test("CP-MOV-03: sin token responde 401", async () => {
    const res = await request(app).get("/movimientos").set({ "x-api-key": "api-key-de-pruebas" });
    expect(res.status).toBe(401);
  });

  test("CP-MOV-04: error de base de datos responde 500", async () => {
    simularTablas(supabase, { movimientos_inventario: consulta({ data: null, error: { message: "fallo BD" } }) });
    const res = await request(app).get("/movimientos").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("fallo BD");
  });
});

describe("RF-006 · POST /movimientos", () => {
  const nuevo = { id_producto: 1, id_usuario: 10, tipo_movimiento: "entrada", cantidad: 5, observacion: "Compra" };

  test("CP-MOV-05: Admin registra un movimiento (201)", async () => {
    const q = consulta({ data: [{ id_movimiento: 9, ...nuevo }], error: null });
    simularTablas(supabase, { movimientos_inventario: q });
    const res = await request(app).post("/movimientos").set(headers(ROLES.ADMIN)).send(nuevo);
    expect(res.status).toBe(201);
    expect(q.insert).toHaveBeenCalledWith([nuevo]);
    expect(res.body[0].id_movimiento).toBe(9);
  });

  test("CP-MOV-06: Gerente no puede crear movimientos (403)", async () => {
    const res = await request(app).post("/movimientos").set(headers(ROLES.GERENTE)).send(nuevo);
    expect(res.status).toBe(403);
  });

  test("CP-MOV-07: error de base de datos al insertar responde 500", async () => {
    simularTablas(supabase, { movimientos_inventario: consulta({ data: null, error: { message: "violación de restricción" } }) });
    const res = await request(app).post("/movimientos").set(headers(ROLES.ADMIN)).send(nuevo);
    expect(res.status).toBe(500);
  });
});