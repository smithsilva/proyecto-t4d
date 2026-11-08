// RF-017 — Enviar y consultar notificaciones
const request = require("supertest");
const app = require("../src/app");
const supabase = require("../src/config/supabase");
const { ROLES, headers, tokenDe, consulta, simularTablas } = require("./helpers");

beforeEach(() => supabase.from.mockReset());

describe("RF-017 · GET /notificaciones (bandeja por rol)", () => {
  test.each([
    [ROLES.ADMIN, "Admin"],
    [ROLES.CONTADORA, "Contadora"],
    [ROLES.GERENTE, "Gerente"],
    [ROLES.MECANICO, "Mecanico"],
  ])("CP-NOT-01: el rol %i solo recibe las notificaciones destinadas a '%s'", async (idRol, nombre) => {
    const q = consulta({ data: [{ id_notificacion: 1, rol_destino: nombre, leido: false }], error: null });
    simularTablas(supabase, { notificaciones: q });
    const res = await request(app).get("/notificaciones").set(headers(idRol));
    expect(res.status).toBe(200);
    expect(q.eq).toHaveBeenCalledWith("rol_destino", nombre);
  });

  test("CP-NOT-02: un rol desconocido en el token responde 400", async () => {
    const res = await request(app)
      .get("/notificaciones")
      .set({ "x-api-key": "api-key-de-pruebas", Authorization: `Bearer ${tokenDe(99)}` });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Rol no reconocido");
  });

  test("CP-NOT-03: sin token no se puede consultar (401)", async () => {
    const res = await request(app).get("/notificaciones").set({ "x-api-key": "api-key-de-pruebas" });
    expect(res.status).toBe(401);
  });
});

describe("RF-017 · PATCH /notificaciones/:id/leida", () => {
  test("CP-NOT-04: marca una notificación como leída (200)", async () => {
    const q = consulta({ data: { id_notificacion: 3, leido: true }, error: null });
    simularTablas(supabase, { notificaciones: q });
    const res = await request(app).patch("/notificaciones/3/leida").set(headers(ROLES.MECANICO));
    expect(res.status).toBe(200);
    expect(q.update).toHaveBeenCalledWith({ leido: true });
    expect(q.eq).toHaveBeenCalledWith("id_notificacion", "3");
    expect(res.body.leido).toBe(true);
  });

  test("CP-NOT-05: error de base de datos responde 500", async () => {
    simularTablas(supabase, { notificaciones: consulta({ data: null, error: { message: "fallo BD" } }) });
    const res = await request(app).patch("/notificaciones/3/leida").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
  });
});

describe("RF-017 · POST /notificaciones (enviar mensaje)", () => {
  test("CP-NOT-06: sin título o descripción responde 400", async () => {
    const res = await request(app).post("/notificaciones").set(headers(ROLES.ADMIN)).send({ titulo: "Aviso" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("titulo y descripcion son obligatorios");
  });

  test("CP-NOT-07: Admin envía un mensaje y se crea una notificación por cada rol (201)", async () => {
    const q = consulta({ data: [{}, {}, {}, {}], error: null });
    simularTablas(supabase, { notificaciones: q });
    const res = await request(app)
      .post("/notificaciones").set(headers(ROLES.ADMIN))
      .send({ titulo: "Mantenimiento", descripcion: "El sistema se actualizará a las 8 pm" });

    expect(res.status).toBe(201);
    const filas = q.insert.mock.calls[0][0];
    expect(filas.map((f) => f.rol_destino)).toEqual(["Admin", "Gerente", "Contadora", "Mecanico"]);
    filas.forEach((f) => {
      expect(f.titulo).toBe("Mantenimiento");
      expect(f.leido).toBe(false); // llegan "sin leer"
    });
  });
});