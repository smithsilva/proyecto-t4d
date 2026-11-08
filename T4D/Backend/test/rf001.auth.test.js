// RF-001 — Inicio de sesión con verificación en dos pasos y control de acceso
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const supabase = require("../src/config/supabase");
const transporter = require("../src/config/nodemailer");
const { ROLES, tokenDe, headers, consulta, simularTablas } = require("./helpers");

const API = { "x-api-key": "api-key-de-pruebas" };

const usuarioBD = {
  id_usuario: 1,
  email: "admin@t4d.com",
  username: "admin",
  id_rol: ROLES.ADMIN,
  activo: true,
  codigo: "123456",
};

beforeEach(() => {
  supabase.from.mockReset();
  supabase.auth.signInWithPassword.mockReset();
  supabase.auth.admin.listUsers.mockReset();
  supabase.auth.admin.updateUserById.mockReset();
  transporter.sendMail.mockClear();
});

describe("RF-001 · POST /auth/login", () => {
  test("CP-AUTH-01: rechaza el login si faltan campos (400)", async () => {
    const res = await request(app).post("/auth/login").set(API).send({ email: "admin@t4d.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Faltan campos/);
  });

  test("CP-AUTH-02: contraseña incorrecta no concede acceso (401)", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: null, error: { message: "Invalid" } });
    const res = await request(app)
      .post("/auth/login").set(API)
      .send({ email: "admin@t4d.com", password: "mala", codigo: "123456" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Correo o contraseña incorrectos");
    expect(res.body.token).toBeUndefined();
  });

  test("CP-AUTH-03: usuario desactivado no puede iniciar sesión (401)", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    simularTablas(supabase, { usuarios: consulta({ data: { ...usuarioBD, activo: false }, error: null }) });
    const res = await request(app)
      .post("/auth/login").set(API)
      .send({ email: "admin@t4d.com", password: "Clave123", codigo: "123456" });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Cuenta deshabilitada/);
  });

  test("CP-AUTH-04: código de verificación incorrecto no concede acceso (401)", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    simularTablas(supabase, { usuarios: consulta({ data: usuarioBD, error: null }) });
    const res = await request(app)
      .post("/auth/login").set(API)
      .send({ email: "admin@t4d.com", password: "Clave123", codigo: "000000" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Código de verificación incorrecto");
  });

  test("CP-AUTH-05: login correcto devuelve token con el rol y oculta el código (200)", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null });
    simularTablas(supabase, { usuarios: consulta({ data: usuarioBD, error: null }) });
    const res = await request(app)
      .post("/auth/login").set(API)
      .send({ email: "admin@t4d.com", password: "Clave123", codigo: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Inicio de sesión exitoso");
    expect(res.body.usuario.codigo).toBeUndefined();
    const decodificado = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decodificado.id_rol).toBe(ROLES.ADMIN);
    expect(decodificado.email).toBe("admin@t4d.com");
  });
});

describe("RF-001 · Ninguna funcionalidad es accesible sin iniciar sesión", () => {
  test("CP-AUTH-06: sin API key responde 401", async () => {
    const res = await request(app).get("/categorias");
    expect(res.status).toBe(401);
  });

  test("CP-AUTH-07: con API key pero sin token responde 401", async () => {
    const res = await request(app).get("/categorias").set(API);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token no proporcionado");
  });

  test("CP-AUTH-08: esquema distinto a Bearer responde 401", async () => {
    const res = await request(app).get("/categorias").set({ ...API, Authorization: "Basic abc123" });
    expect(res.status).toBe(401);
  });

  test("CP-AUTH-09: token con firma inválida responde 403", async () => {
    const falso = jwt.sign({ id_rol: 1 }, "otra_clave");
    const res = await request(app).get("/categorias").set({ ...API, Authorization: `Bearer ${falso}` });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Token inválido");
  });

  test("CP-AUTH-10: token expirado responde 401", async () => {
    const vencido = tokenDe(ROLES.ADMIN, { expiresIn: -10 });
    const res = await request(app).get("/categorias").set({ ...API, Authorization: `Bearer ${vencido}` });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/expirado/);
  });

  test("CP-AUTH-11: token válido permite el acceso (200)", async () => {
    simularTablas(supabase, { categorias: consulta({ data: [], error: null }) });
    const res = await request(app).get("/categorias").set(headers(ROLES.MECANICO));
    expect(res.status).toBe(200);
  });
});

describe("Recuperación de contraseña", () => {
  test("CP-AUTH-12: forgot-password sin correo responde 400", async () => {
    const res = await request(app).post("/auth/forgot-password").set(API).send({});
    expect(res.status).toBe(400);
  });

  test("CP-AUTH-13: correo inexistente responde igual y NO envía correo", async () => {
    simularTablas(supabase, { usuarios: consulta({ data: null, error: { message: "no existe" } }) });
    const res = await request(app).post("/auth/forgot-password").set(API).send({ email: "nadie@t4d.com" });
    expect(res.status).toBe(200);
    expect(res.body.mensaje).toMatch(/Si el correo existe/);
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  test("CP-AUTH-14: correo existente envía el enlace de recuperación", async () => {
    simularTablas(supabase, { usuarios: consulta({ data: usuarioBD, error: null }) });
    const res = await request(app).post("/auth/forgot-password").set(API).send({ email: "admin@t4d.com" });
    expect(res.status).toBe(200);
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    expect(transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: "admin@t4d.com" }));
  });

  test("CP-AUTH-15: reset-password con contraseña de menos de 6 caracteres responde 400", async () => {
    const res = await request(app).post("/auth/reset-password").set(API).send({ token: "abc", nuevaPassword: "123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/al menos 6 caracteres/);
  });

  test("CP-AUTH-16: reset-password con token inválido responde 400", async () => {
    simularTablas(supabase, { usuarios: consulta({ data: null, error: { message: "x" } }) });
    const res = await request(app).post("/auth/reset-password").set(API).send({ token: "falso", nuevaPassword: "Nueva123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Enlace inválido o expirado");
  });

  test("CP-AUTH-17: reset-password con enlace vencido responde 400", async () => {
    const ayer = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    simularTablas(supabase, {
      usuarios: consulta({ data: { id_usuario: 1, email: "admin@t4d.com", reset_code_expires: ayer }, error: null }),
    });
    const res = await request(app).post("/auth/reset-password").set(API).send({ token: "viejo", nuevaPassword: "Nueva123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Enlace inválido o expirado");
  });

  test("CP-AUTH-18: reset-password correcto actualiza la contraseña (200)", async () => {
    const manana = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    simularTablas(supabase, {
      usuarios: consulta({ data: { id_usuario: 1, email: "admin@t4d.com", reset_code_expires: manana }, error: null }),
    });
    supabase.auth.admin.listUsers.mockResolvedValue({ data: { users: [{ id: "uuid-1", email: "ADMIN@t4d.com" }] }, error: null });
    supabase.auth.admin.updateUserById.mockResolvedValue({ error: null });

    const res = await request(app).post("/auth/reset-password").set(API).send({ token: "vigente", nuevaPassword: "Nueva123" });
    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe("Contraseña actualizada correctamente");
    expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith("uuid-1", { password: "Nueva123" });
  });
});