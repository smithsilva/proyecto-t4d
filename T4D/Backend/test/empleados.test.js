// Módulo de empleados — Admin: CRUD completo · Contadora: ver + editar tipo_contrato y fecha_terminacion
const request = require("supertest");
const app = require("../src/app");
const supabase = require("../src/config/supabase");
const { ROLES, headers, consulta, simularTablas } = require("./helpers");

beforeEach(() => supabase.from.mockReset());

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

describe("Empleados · lectura", () => {
  test.each([
    ["Admin", ROLES.ADMIN],
    ["Contadora", ROLES.CONTADORA],
  ])("CP-EMP-01: %s puede listar empleados (200)", async (_n, rol) => {
    simularTablas(supabase, { empleados: consulta({ data: [empleado], error: null }) });
    const res = await request(app).get("/empleados").set(headers(rol));
    expect(res.status).toBe(200);
    expect(res.body).toEqual([empleado]);
  });

  test.each([
    ["Gerente", ROLES.GERENTE],
    ["Mecánico", ROLES.MECANICO],
  ])("CP-EMP-02: %s no puede ver empleados (403)", async (_n, rol) => {
    const res = await request(app).get("/empleados").set(headers(rol));
    expect(res.status).toBe(403);
  });

  test("CP-EMP-03: consultar un empleado por id (200)", async () => {
    simularTablas(supabase, { empleados: consulta({ data: empleado, error: null }) });
    const res = await request(app).get("/empleados/8").set(headers(ROLES.CONTADORA));
    expect(res.status).toBe(200);
    expect(res.body.id_empleado).toBe(8);
  });

  test("CP-EMP-04: id inválido devuelve 400", async () => {
    const res = await request(app).get("/empleados/abc").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(400);
  });

  test("CP-EMP-05: sin token devuelve 401", async () => {
    const res = await request(app).get("/empleados").set({ "x-api-key": process.env.X_API_KEY });
    expect(res.status).toBe(401);
  });
});

describe("Empleados · crear (solo Admin)", () => {
  test("CP-EMP-06: Admin crea un empleado (201)", async () => {
    const q = consulta({ data: [{ id_empleado: 11, ...nuevo }], error: null });
    simularTablas(supabase, { empleados: q });
    const res = await request(app).post("/empleados").set(headers(ROLES.ADMIN)).send(nuevo);
    expect(res.status).toBe(201);
    expect(res.body.id_empleado).toBe(11);
    expect(q.insert).toHaveBeenCalledWith([
      { ...nuevo, fecha_terminacion: null },
    ]);
  });

  test("CP-EMP-07: ignora campos que no son de la tabla", async () => {
    const q = consulta({ data: [{ id_empleado: 11, ...nuevo }], error: null });
    simularTablas(supabase, { empleados: q });
    await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ ...nuevo, id_empleado: 999, admin: true });
    const enviado = q.insert.mock.calls[0][0][0];
    expect(enviado.id_empleado).toBeUndefined();
    expect(enviado.admin).toBeUndefined();
  });

  test("CP-EMP-08: Contadora no puede crear (403)", async () => {
    const res = await request(app).post("/empleados").set(headers(ROLES.CONTADORA)).send(nuevo);
    expect(res.status).toBe(403);
  });

  test("CP-EMP-09: faltan campos obligatorios (400)", async () => {
    const res = await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ cedula: "100000009" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Faltan campos obligatorios/);
  });

  test("CP-EMP-10: salario negativo (400)", async () => {
    const res = await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ ...nuevo, salario: -5 });
    expect(res.status).toBe(400);
  });

  test("CP-EMP-11: cédula con letras (400)", async () => {
    const res = await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ ...nuevo, cedula: "12ab" });
    expect(res.status).toBe(400);
  });

  test("CP-EMP-12: terminación anterior a la contratación (400)", async () => {
    const res = await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ ...nuevo, fecha_terminacion: "2023-01-01" });
    expect(res.status).toBe(400);
  });

  test("CP-EMP-13: cédula duplicada (409)", async () => {
    simularTablas(supabase, {
      empleados: consulta({ data: null, error: { code: "23505", message: "duplicate key" } }),
    });
    const res = await request(app).post("/empleados").set(headers(ROLES.ADMIN)).send(nuevo);
    expect(res.status).toBe(409);
  });

  test("CP-EMP-14: rol inexistente (400)", async () => {
    simularTablas(supabase, {
      empleados: consulta({ data: null, error: { code: "23503", message: "fk" } }),
    });
    const res = await request(app)
      .post("/empleados")
      .set(headers(ROLES.ADMIN))
      .send({ ...nuevo, id_rol: 99 });
    expect(res.status).toBe(400);
  });
});

describe("Empleados · editar", () => {
  test("CP-EMP-15: Admin edita un empleado completo (PUT → 200)", async () => {
    const q = consulta({ data: [{ id_empleado: 8, ...nuevo }], error: null });
    simularTablas(supabase, { empleados: q });
    const res = await request(app).put("/empleados/8").set(headers(ROLES.ADMIN)).send(nuevo);
    expect(res.status).toBe(200);
    expect(q.eq).toHaveBeenCalledWith("id_empleado", 8);
  });

  test("CP-EMP-16: Contadora no puede usar PUT (403)", async () => {
    const res = await request(app).put("/empleados/8").set(headers(ROLES.CONTADORA)).send(nuevo);
    expect(res.status).toBe(403);
  });

  test("CP-EMP-17: Contadora cambia el tipo de contrato (PATCH → 200)", async () => {
    const q = consulta({ data: [{ ...empleado, tipo_contrato: "Temporal" }], error: null });
    simularTablas(supabase, { empleados: q });
    const res = await request(app)
      .patch("/empleados/8")
      .set(headers(ROLES.CONTADORA))
      .send({ tipo_contrato: "Temporal" });
    expect(res.status).toBe(200);
    expect(q.update).toHaveBeenCalledWith({ tipo_contrato: "Temporal" });
  });

  test("CP-EMP-18: Contadora registra la fecha de terminación (PATCH → 200)", async () => {
    const consultaActual = consulta({ data: { fecha_contratacion: "2024-01-15" }, error: null });
    const consultaUpdate = consulta({
      data: [{ ...empleado, fecha_terminacion: "2026-12-31" }],
      error: null,
    });
    supabase.from.mockReturnValueOnce(consultaActual).mockReturnValueOnce(consultaUpdate);

    const res = await request(app)
      .patch("/empleados/8")
      .set(headers(ROLES.CONTADORA))
      .send({ fecha_terminacion: "2026-12-31" });
    expect(res.status).toBe(200);
    expect(consultaUpdate.update).toHaveBeenCalledWith({ fecha_terminacion: "2026-12-31" });
  });

  test("CP-EMP-19: terminación anterior a la contratación guardada (400)", async () => {
    supabase.from.mockReturnValueOnce(
      consulta({ data: { fecha_contratacion: "2024-01-15" }, error: null })
    );
    const res = await request(app)
      .patch("/empleados/8")
      .set(headers(ROLES.CONTADORA))
      .send({ fecha_terminacion: "2023-12-31" });
    expect(res.status).toBe(400);
  });

  test.each(["salario", "cargo", "nombre_completo", "cedula", "id_rol"])(
    "CP-EMP-20: Contadora NO puede modificar %s (403)",
    async (campo) => {
      const res = await request(app)
        .patch("/empleados/8")
        .set(headers(ROLES.CONTADORA))
        .send({ [campo]: "1" });
      expect(res.status).toBe(403);
      expect(supabase.from).not.toHaveBeenCalled();
    }
  );

  test("CP-EMP-21: Admin puede modificar cualquier campo por PATCH (200)", async () => {
    const q = consulta({ data: [{ ...empleado, salario: 5000000 }], error: null });
    simularTablas(supabase, { empleados: q });
    const res = await request(app)
      .patch("/empleados/8")
      .set(headers(ROLES.ADMIN))
      .send({ salario: 5000000 });
    expect(res.status).toBe(200);
    expect(q.update).toHaveBeenCalledWith({ salario: 5000000 });
  });

  test("CP-EMP-22: PATCH sin campos válidos (400)", async () => {
    const res = await request(app).patch("/empleados/8").set(headers(ROLES.ADMIN)).send({});
    expect(res.status).toBe(400);
  });

  test("CP-EMP-23: quitar la fecha de terminación (null) reactiva al empleado", async () => {
    const q = consulta({ data: [empleado], error: null });
    simularTablas(supabase, { empleados: q });
    const res = await request(app)
      .patch("/empleados/8")
      .set(headers(ROLES.CONTADORA))
      .send({ fecha_terminacion: null });
    expect(res.status).toBe(200);
    expect(q.update).toHaveBeenCalledWith({ fecha_terminacion: null });
  });

  test("CP-EMP-24: editar un empleado que no existe (404)", async () => {
    simularTablas(supabase, { empleados: consulta({ data: [], error: null }) });
    const res = await request(app)
      .patch("/empleados/999")
      .set(headers(ROLES.ADMIN))
      .send({ cargo: "X" });
    expect(res.status).toBe(404);
  });
});

describe("Empleados · eliminar (solo Admin)", () => {
  test("CP-EMP-25: Admin elimina un empleado (200)", async () => {
    simularTablas(supabase, { empleados: consulta({ data: [empleado], error: null }) });
    const res = await request(app).delete("/empleados/8").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Empleado eliminado");
  });

  test("CP-EMP-26: Contadora no puede eliminar (403)", async () => {
    const res = await request(app).delete("/empleados/8").set(headers(ROLES.CONTADORA));
    expect(res.status).toBe(403);
  });

  test("CP-EMP-27: eliminar un empleado que no existe (404)", async () => {
    simularTablas(supabase, { empleados: consulta({ data: [], error: null }) });
    const res = await request(app).delete("/empleados/999").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(404);
  });
});