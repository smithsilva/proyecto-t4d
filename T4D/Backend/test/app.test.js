const request = require("supertest");
const app = require("../src/app");

describe("Pruebas unitarias del sistema T4D", () => {
  test("Validación inicial de lógica del servidor", () => {
    const suma = 2 + 3;
    expect(suma).toBe(5);
  });

  test("La API rechaza peticiones sin API key (401)", async () => {
    const res = await request(app).get("/productos");
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/API key/i);
  });
});