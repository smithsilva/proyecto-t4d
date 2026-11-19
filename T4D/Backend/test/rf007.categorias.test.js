// RF-007 — Gestionar categorías de blindaje
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");
const { ROLES, headers, resultado } = require("./helpers");

beforeEach(() => pool.query.mockReset());

describe("RF-007 · Categorías de blindaje", () => {
  test("CP-CAT-01: cualquier rol autenticado puede listar categorías (200)", async () => {
    const lista = [{ id_categoria: 1, nombre_categoria: "Nivel IIIA", activo: true }];
    pool.query.mockResolvedValueOnce(resultado(lista));

    const res = await request(app).get("/categorias").set(headers(ROLES.CONTADORA));

    expect(res.status).toBe(200);
    expect(res.body).toEqual(lista);
    expect(pool.query.mock.calls[0][0]).toMatch(/FROM categorias ORDER BY id_categoria ASC/);
  });

  test("CP-CAT-02: Admin crea una categoría (201)", async () => {
    const nueva = { nombre_categoria: "Nivel IV", descripcion: "Alta protección", activo: true };
    pool.query.mockResolvedValueOnce(resultado([{ id_categoria: 5, ...nueva }]));

    const res = await request(app).post("/categorias").set(headers(ROLES.ADMIN)).send(nueva);

    expect(res.status).toBe(201);
    expect(res.body[0].id_categoria).toBe(5);
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/^INSERT INTO "categorias" \("nombre_categoria", "descripcion", "activo"\)/);
    expect(valores).toEqual(["Nivel IV", "Alta protección", true]);
  });

  test.each([
    ["Gerente", ROLES.GERENTE],
    ["Contadora", ROLES.CONTADORA],
    ["Mecánico", ROLES.MECANICO],
  ])("CP-CAT-03: %s no puede crear categorías (403)", async (_n, rol) => {
    const res = await request(app).post("/categorias").set(headers(rol)).send({ nombre_categoria: "X" });
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-CAT-04: Admin edita una categoría (PUT → 200)", async () => {
    pool.query.mockResolvedValueOnce(resultado([{ id_categoria: 1, nombre_categoria: "Nivel II" }]));

    const res = await request(app).put("/categorias/1").set(headers(ROLES.ADMIN)).send({ nombre_categoria: "Nivel II" });

    expect(res.status).toBe(200);
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/^UPDATE "categorias" SET "nombre_categoria" = \$1 WHERE "id_categoria" = \$2/);
    expect(valores).toEqual(["Nivel II", "1"]);
  });

  test("CP-CAT-05: Admin cambia el estado Activa/Inactiva (PATCH → 200)", async () => {
    pool.query.mockResolvedValueOnce(resultado([{ id_categoria: 1, activo: false }]));

    const res = await request(app).patch("/categorias/1").set(headers(ROLES.ADMIN)).send({ activo: false });

    expect(res.status).toBe(200);
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/SET "activo" = \$1 WHERE "id_categoria" = \$2/);
    expect(valores).toEqual([false, "1"]);
  });

  test.each([
    ["PUT", "put"],
    ["PATCH", "patch"],
  ])("CP-CAT-06: Gerente no puede editar categorías (%s → 403)", async (_n, metodo) => {
    const res = await request(app)[metodo]("/categorias/1").set(headers(ROLES.GERENTE)).send({ activo: false });
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-CAT-07: Admin elimina una categoría (200)", async () => {
    pool.query.mockResolvedValueOnce(resultado([], 1));

    const res = await request(app).delete("/categorias/1").set(headers(ROLES.ADMIN));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categoría eliminada");
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/^DELETE FROM categorias WHERE id_categoria = \$1/);
    expect(valores).toEqual(["1"]);
  });

  test("CP-CAT-08: eliminar una categoría en uso devuelve error 500", async () => {
    pool.query.mockRejectedValueOnce(Object.assign(new Error("categoría en uso"), { code: "23503" }));

    const res = await request(app).delete("/categorias/1").set(headers(ROLES.ADMIN));

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("categoría en uso");
  });

  test("CP-CAT-09: Mecánico no puede eliminar categorías (403)", async () => {
    const res = await request(app).delete("/categorias/1").set(headers(ROLES.MECANICO));
    expect(res.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });
});