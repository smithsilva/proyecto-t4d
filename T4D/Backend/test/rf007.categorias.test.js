// RF-007 — Gestionar categorías de blindaje
const request = require("supertest");
const app = require("../src/app");
const supabase = require("../src/config/supabase");
const { ROLES, headers, consulta, simularTablas } = require("./helpers");

beforeEach(() => supabase.from.mockReset());

describe("RF-007 · Categorías de blindaje", () => {
  test("CP-CAT-01: cualquier rol autenticado puede listar categorías (200)", async () => {
    const lista = [{ id_categoria: 1, nombre_categoria: "Nivel IIIA", activo: true }];
    simularTablas(supabase, { categorias: consulta({ data: lista, error: null }) });
    const res = await request(app).get("/categorias").set(headers(ROLES.CONTADORA));
    expect(res.status).toBe(200);
    expect(res.body).toEqual(lista);
  });

  test("CP-CAT-02: Admin crea una categoría (201)", async () => {
    const nueva = { nombre_categoria: "Nivel IV", descripcion: "Alta protección", activo: true };
    const q = consulta({ data: [{ id_categoria: 5, ...nueva }], error: null });
    simularTablas(supabase, { categorias: q });
    const res = await request(app).post("/categorias").set(headers(ROLES.ADMIN)).send(nueva);
    expect(res.status).toBe(201);
    expect(q.insert).toHaveBeenCalledWith([nueva]);
  });

  test.each([
    ["Gerente", ROLES.GERENTE],
    ["Contadora", ROLES.CONTADORA],
    ["Mecánico", ROLES.MECANICO],
  ])("CP-CAT-03: %s no puede crear categorías (403)", async (_n, rol) => {
    const res = await request(app).post("/categorias").set(headers(rol)).send({ nombre_categoria: "X" });
    expect(res.status).toBe(403);
  });

  test("CP-CAT-04: Admin edita una categoría completa (PUT → 200)", async () => {
    const q = consulta({ data: [{ id_categoria: 1, nombre_categoria: "Nivel II" }], error: null });
    simularTablas(supabase, { categorias: q });
    const res = await request(app).put("/categorias/1").set(headers(ROLES.ADMIN)).send({ nombre_categoria: "Nivel II" });
    expect(res.status).toBe(200);
    expect(q.eq).toHaveBeenCalledWith("id_categoria", "1");
  });

  test("CP-CAT-05: Admin cambia el estado Activa/Inactiva (PATCH → 200)", async () => {
    const q = consulta({ data: [{ id_categoria: 1, activo: false }], error: null });
    simularTablas(supabase, { categorias: q });
    const res = await request(app).patch("/categorias/1").set(headers(ROLES.ADMIN)).send({ activo: false });
    expect(res.status).toBe(200);
    expect(q.update).toHaveBeenCalledWith({ activo: false });
  });

  test("CP-CAT-06: Admin elimina una categoría (200)", async () => {
    simularTablas(supabase, { categorias: consulta({ error: null }) });
    const res = await request(app).delete("/categorias/1").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categoría eliminada");
  });

  test("CP-CAT-07: eliminar una categoría en uso devuelve error 500", async () => {
    simularTablas(supabase, { categorias: consulta({ error: { code: "23503", message: "categoría en uso" } }) });
    const res = await request(app).delete("/categorias/1").set(headers(ROLES.ADMIN));
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("categoría en uso");
  });

  test("CP-CAT-08: Mecánico no puede eliminar categorías (403)", async () => {
    const res = await request(app).delete("/categorias/1").set(headers(ROLES.MECANICO));
    expect(res.status).toBe(403);
  });
});