// Módulo de empleados (PostgreSQL)
//   Admin     → CRUD completo
//   Contadora → solo puede VER
//   Gerente / Mecánico → sin acceso
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");
const { ROLES, headers, resultado } = require("./helpers");

beforeEach(() => pool.query.mockReset());

const empleado = {
  id_empleado: 8,
  cedula: "100000001",
  nombre_completo: "NICOL SMITH ZUÑIGA SILVA",
  cargo: "Gerente General",
  salario: 4500000,
  fecha_contratacion: "2024-01-15",
  fecha_terminacion: null,
  tipo_contrato: "Indefinido",
  id_rol: 3,
  roles: { id_rol: 3, nombre_rol: "Gerente" },
};

const nuevo = {
  cedula: "100000009",
  nombre_completo: "PERSONA DE PRUEBA",
  cargo: "Auxiliar",
  salario: 2000000,
  fecha_contratacion: "2024-06-01",
  tipo_contrato: "Temporal",
  id_rol: 4,
};

// ─────────────────────────────────────────────
describe("Empleados · lectura", () => {
  test.each([
    ["Admin", ROLES.ADMIN],
    ["Contadora", ROLES.CONTADORA],
  ])("CP-EMP-01: %s puede listar empleados (200)", async (_n, rol) => {
    pool.query.mockResolvedValueOnce(resultado([empleado]));
    const res = await request(app).get("/empleados").set(headers(rol));
    expect(res.status).toBe(200);
    expect(res.body).toEqual([empleado]);
  });

  test("CP-EMP-02: la consulta trae el rol con un JOIN a la tabla roles", async () => {
    pool.query.mockResolvedValueOnce(resultado([empleado]));
    await request(app).get("/empleados").set(headers(ROLES.ADMIN));
    const sql = pool.query.mock.calls[0][0];
    expect(sql).toMatch(/LEFT JOIN roles/);
    expect(sql).toMatch(/ORDER BY e\.id_empleado/);
  });

  test.each([
    ["Gerente", ROLES.GERENTE],
    ["Mecánico", ROLES.MECANICO],
  ])("CP-EMP-03: %s no puede ver empleados (403)", async (_n, rol) => {
    const res = await request(app).get("/empleados").set(headers(rol));
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-EMP-04: consultar un empleado por id (200)", async () => {
    pool.query.mockResolvedValueOnce(resultado([empleado]));
    const res = await request(app).get("/empleados/8").set(headers(ROLES.CONTADORA));
    expect(res.status).toBe(200);
    expect(res.body.id_empleado).toBe(8);
    expect(pool.query.mock.calls[0][1]).toEqual([8]);
  });

  test("CP-EMP-05: empleado inexistente (404)", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    const res = await request(app).get("/empleados/999").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(404);
  });

  test("CP-EMP-06: id inválido (400)", async () => {
    const res = await request(app).get("/empleados/abc").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-EMP-07: sin token (401)", async () => {
    const res = await request(app).get("/empleados").set({ "x-api-key": process.env.X_API_KEY });
    expect(res.status).toBe(401);
  });

  test("CP-EMP-08: sin API key (401)", async () => {
    const res = await request(app).get("/empleados");
    expect(res.status).toBe(401);
  });

  test("CP-EMP-09: si falta la tabla o la columna id_rol, el error explica qué hacer (500)", async () => {
    pool.query.mockRejectedValueOnce({ code: "42703", message: 'column "id_rol" does not exist' });
    const res = await request(app).get("/empleados").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/ejecuta el SQL de empleados/);
  });
});

// ─────────────────────────────────────────────
describe("Empleados · crear (solo Admin)", () => {
  test("CP-EMP-10: Admin crea un empleado (201)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ id_empleado: 11, ...nuevo, fecha_terminacion: null }])) // INSERT
      .mockResolvedValueOnce(resultado([{ id_empleado: 11, ...nuevo, roles: { id_rol: 4, nombre_rol: "Mecanico" } }])); // SELECT con rol

    const res = await request(app).post("/empleados").set(headers(ROLES.ADMIN)).send(nuevo);

    expect(res.status).toBe(201);
    expect(res.body.id_empleado).toBe(11);
    expect(res.body.roles.nombre_rol).toBe("Mecanico");

    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/^INSERT INTO "empleados"/);
    expect(valores).toContain("100000009");
    expect(valores).toContain(2000000);
  });

  test("CP-EMP-11: ignora campos que no son de la tabla (id_empleado, admin...)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ id_empleado: 11, ...nuevo }]))
      .mockResolvedValueOnce(resultado([{ id_empleado: 11, ...nuevo }]));

    await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ ...nuevo, id_empleado: 999, admin: true });

    const sql = pool.query.mock.calls[0][0];
    expect(sql).not.toMatch(/"id_empleado"/);
    expect(sql).not.toMatch(/"admin"/);
  });

  test.each([
    ["Contadora", ROLES.CONTADORA],
    ["Gerente", ROLES.GERENTE],
    ["Mecánico", ROLES.MECANICO],
  ])("CP-EMP-12: %s no puede crear (403)", async (_n, rol) => {
    const res = await request(app).post("/empleados").set(headers(rol)).send(nuevo);
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-EMP-13: faltan campos obligatorios (400)", async () => {
    const res = await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ cedula: "100000009" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Faltan campos obligatorios/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-EMP-14: salario negativo (400)", async () => {
    const res = await request(app).post("/empleados").set(headers(ROLES.ADMIN)).send({ ...nuevo, salario: -5 });
    expect(res.status).toBe(400);
  });

  test("CP-EMP-15: cédula con letras (400)", async () => {
    const res = await request(app).post("/empleados").set(headers(ROLES.ADMIN)).send({ ...nuevo, cedula: "12ab" });
    expect(res.status).toBe(400);
  });

  test("CP-EMP-16: fecha inexistente, por ejemplo 30 de febrero (400)", async () => {
    const res = await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ ...nuevo, fecha_contratacion: "2024-02-30" });
    expect(res.status).toBe(400);
  });

  test("CP-EMP-17: terminación anterior a la contratación (400)", async () => {
    const res = await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ ...nuevo, fecha_terminacion: "2023-01-01" });
    expect(res.status).toBe(400);
  });

  test("CP-EMP-18: cédula duplicada (409)", async () => {
    pool.query.mockRejectedValueOnce({ code: "23505", message: "duplicate key" });
    const res = await request(app).post("/empleados").set(headers(ROLES.ADMIN)).send(nuevo);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/cédula/);
  });

  test("CP-EMP-19: rol inexistente (400)", async () => {
    pool.query.mockRejectedValueOnce({ code: "23503", message: "foreign key" });
    const res = await request(app).post("/empleados").set(headers(ROLES.ADMIN)).send({ ...nuevo, id_rol: 99 });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
describe("Empleados · editar (solo Admin)", () => {
  test("CP-EMP-20: Admin edita un empleado completo (PUT → 200)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ id_empleado: 8, ...nuevo }])) // UPDATE
      .mockResolvedValueOnce(resultado([{ id_empleado: 8, ...nuevo, roles: null }])); // SELECT

    const res = await request(app).put("/empleados/8").set(headers(ROLES.ADMIN)).send(nuevo);

    expect(res.status).toBe(200);
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/^UPDATE "empleados" SET/);
    expect(valores[valores.length - 1]).toBe(8); // WHERE id_empleado = 8
  });

  test.each([
    ["PUT", "put"],
    ["PATCH", "patch"],
  ])("CP-EMP-21: Contadora no puede editar (%s → 403)", async (_n, metodo) => {
    const res = await request(app)[metodo]("/empleados/8").set(headers(ROLES.CONTADORA)).send({ cargo: "X" });
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-EMP-22: Admin cambia solo el salario (PATCH → 200)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ ...empleado, salario: 5000000 }]))
      .mockResolvedValueOnce(resultado([{ ...empleado, salario: 5000000 }]));

    const res = await request(app).patch("/empleados/8").set(headers(ROLES.ADMIN)).send({ salario: 5000000 });

    expect(res.status).toBe(200);
    expect(res.body.salario).toBe(5000000);
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/SET "salario" = \$1 WHERE "id_empleado" = \$2/);
    expect(valores).toEqual([5000000, 8]);
  });

  test("CP-EMP-23: Admin registra la fecha de terminación (compara con la contratación guardada)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([{ fecha_contratacion: "2024-01-15" }])) // consulta la contratación
      .mockResolvedValueOnce(resultado([{ ...empleado, fecha_terminacion: "2026-12-31" }])) // UPDATE
      .mockResolvedValueOnce(resultado([{ ...empleado, fecha_terminacion: "2026-12-31" }])); // SELECT

    const res = await request(app)
      .patch("/empleados/8")
      .set(headers(ROLES.ADMIN))
      .send({ fecha_terminacion: "2026-12-31" });

    expect(res.status).toBe(200);
    expect(res.body.fecha_terminacion).toBe("2026-12-31");
  });

  test("CP-EMP-24: terminación anterior a la contratación guardada (400)", async () => {
    pool.query.mockResolvedValueOnce(resultado([{ fecha_contratacion: "2024-01-15" }]));
    const res = await request(app)
      .patch("/empleados/8")
      .set(headers(ROLES.ADMIN))
      .send({ fecha_terminacion: "2023-12-31" });
    expect(res.status).toBe(400);
  });

  test("CP-EMP-25: quitar la fecha de terminación (null) reactiva al empleado", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([empleado]))
      .mockResolvedValueOnce(resultado([empleado]));
    const res = await request(app)
      .patch("/empleados/8")
      .set(headers(ROLES.ADMIN))
      .send({ fecha_terminacion: null });
    expect(res.status).toBe(200);
    expect(pool.query.mock.calls[0][1]).toEqual([null, 8]);
  });

  test("CP-EMP-26: PATCH sin campos válidos (400)", async () => {
    const res = await request(app).patch("/empleados/8").set(headers(ROLES.ADMIN)).send({ cualquiera: 1 });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-EMP-27: editar un empleado que no existe (404)", async () => {
    pool.query.mockResolvedValueOnce(resultado([])); // UPDATE no afecta filas
    const res = await request(app).patch("/empleados/999").set(headers(ROLES.ADMIN)).send({ cargo: "X" });
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────
describe("Empleados · eliminar (solo Admin)", () => {
  test("CP-EMP-28: Admin elimina un empleado (200)", async () => {
    pool.query.mockResolvedValueOnce(resultado([], 1));
    const res = await request(app).delete("/empleados/8").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Empleado eliminado");
    expect(pool.query.mock.calls[0][0]).toMatch(/^DELETE FROM empleados WHERE id_empleado = \$1/);
  });

  test.each([
    ["Contadora", ROLES.CONTADORA],
    ["Gerente", ROLES.GERENTE],
    ["Mecánico", ROLES.MECANICO],
  ])("CP-EMP-29: %s no puede eliminar (403)", async (_n, rol) => {
    const res = await request(app).delete("/empleados/8").set(headers(rol));
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-EMP-30: eliminar un empleado que no existe (404)", async () => {
    pool.query.mockResolvedValueOnce(resultado([], 0));
    const res = await request(app).delete("/empleados/999").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(404);
  });
});