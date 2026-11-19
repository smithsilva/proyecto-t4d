// RF-001 — Inicio de sesión con verificación en dos pasos y control de acceso
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const pool = require("../src/config/db");
const transporter = require("../src/config/nodemailer");
const { ROLES, tokenDe, headers, resultado } = require("./helpers");

const API = { "x-api-key": process.env.X_API_KEY };

// La contraseña "Clave123" guardada cifrada, como en la tabla usuarios (columna password_hash)
const HASH = bcrypt.hashSync("Clave123", 4);

const usuarioBD = {
  id_usuario: 1,
  email: "admin@t4d.com",
  username: "admin",
  id_rol: ROLES.ADMIN,
  activo: true,
  codigo: "123456",
  password_hash: HASH,
  reset_code: null,
  reset_code_expires: null,
};

const loginCon = (cuerpo) => request(app).post("/auth/login").set(API).send(cuerpo);

beforeEach(() => {
  pool.query.mockReset();
  transporter.sendMail.mockClear();
});

describe("RF-001 · POST /auth/login", () => {
  test("CP-AUTH-01: rechaza el login si faltan campos (400)", async () => {
    const res = await loginCon({ email: "admin@t4d.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Faltan campos/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-AUTH-02: contraseña incorrecta no concede acceso (401)", async () => {
    pool.query.mockResolvedValueOnce(resultado([usuarioBD]));
    const res = await loginCon({ email: "admin@t4d.com", password: "mala", codigo: "123456" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Correo o contraseña incorrectos");
    expect(res.body.token).toBeUndefined();
  });

  test("CP-AUTH-03: un correo que no existe da el MISMO mensaje que una clave mala (401)", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    const res = await loginCon({ email: "nadie@t4d.com", password: "Clave123", codigo: "123456" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Correo o contraseña incorrectos");
  });

  test("CP-AUTH-04: usuario sin contraseña guardada no puede entrar (401)", async () => {
    pool.query.mockResolvedValueOnce(resultado([{ ...usuarioBD, password_hash: null }]));
    const res = await loginCon({ email: "admin@t4d.com", password: "Clave123", codigo: "123456" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Correo o contraseña incorrectos");
  });

  test("CP-AUTH-05: usuario desactivado no puede iniciar sesión (401)", async () => {
    pool.query.mockResolvedValueOnce(resultado([{ ...usuarioBD, activo: false }]));
    const res = await loginCon({ email: "admin@t4d.com", password: "Clave123", codigo: "123456" });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Cuenta deshabilitada/);
  });

  test("CP-AUTH-06: código de verificación incorrecto no concede acceso (401)", async () => {
    pool.query.mockResolvedValueOnce(resultado([usuarioBD]));
    const res = await loginCon({ email: "admin@t4d.com", password: "Clave123", codigo: "000000" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Código de verificación incorrecto");
  });

  test("CP-AUTH-07: login correcto devuelve token con el rol y NO expone datos sensibles (200)", async () => {
    pool.query.mockResolvedValueOnce(resultado([usuarioBD]));
    const res = await loginCon({ email: "admin@t4d.com", password: "Clave123", codigo: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Inicio de sesión exitoso");

    // Nada sensible viaja al navegador
    expect(res.body.usuario.codigo).toBeUndefined();
    expect(res.body.usuario.password_hash).toBeUndefined();
    expect(res.body.usuario.reset_code).toBeUndefined();
    expect(res.body.usuario.reset_code_expires).toBeUndefined();

    const decodificado = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decodificado.id_rol).toBe(ROLES.ADMIN);
    expect(decodificado.email).toBe("admin@t4d.com");
    expect(decodificado.id_usuario).toBe(1);
  });

  test("CP-AUTH-08: el correo se busca sin distinguir mayúsculas y minúsculas", async () => {
    pool.query.mockResolvedValueOnce(resultado([usuarioBD]));
    await loginCon({ email: "ADMIN@T4D.COM", password: "Clave123", codigo: "123456" });
    const [sql, valores] = pool.query.mock.calls[0];
    expect(sql).toMatch(/LOWER\(email\) = LOWER\(\$1\)/);
    expect(valores).toEqual(["ADMIN@T4D.COM"]);
  });
});

describe("RF-001 · Ninguna funcionalidad es accesible sin iniciar sesión", () => {
  test("CP-AUTH-09: sin API key responde 401", async () => {
    const res = await request(app).get("/categorias");
    expect(res.status).toBe(401);
  });

  test("CP-AUTH-10: con API key pero sin token responde 401", async () => {
    const res = await request(app).get("/categorias").set(API);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token no proporcionado");
  });

  test("CP-AUTH-11: esquema distinto a Bearer responde 401", async () => {
    const res = await request(app).get("/categorias").set({ ...API, Authorization: "Basic abc123" });
    expect(res.status).toBe(401);
  });

  test("CP-AUTH-12: token con firma inválida responde 403", async () => {
    const falso = jwt.sign({ id_rol: 1 }, "otra_clave");
    const res = await request(app).get("/categorias").set({ ...API, Authorization: `Bearer ${falso}` });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Token inválido");
  });

  test("CP-AUTH-13: token expirado responde 401", async () => {
    const vencido = tokenDe(ROLES.ADMIN, { expiresIn: -10 });
    const res = await request(app).get("/categorias").set({ ...API, Authorization: `Bearer ${vencido}` });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/expirado/);
  });

  test("CP-AUTH-14: token válido permite el acceso (200)", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    const res = await request(app).get("/categorias").set(headers(ROLES.MECANICO));
    expect(res.status).toBe(200);
  });

  test("CP-AUTH-15: 'bearer' en minúsculas también es aceptado (200)", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    const res = await request(app)
      .get("/categorias")
      .set({ ...API, Authorization: `bearer ${tokenDe(ROLES.ADMIN)}` });
    expect(res.status).toBe(200);
  });
});

describe("RF-001 · Recuperación de contraseña", () => {
  test("CP-AUTH-16: forgot-password sin correo responde 400", async () => {
    const res = await request(app).post("/auth/forgot-password").set(API).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("El correo es requerido");
  });

  test("CP-AUTH-17: correo inexistente responde igual y NO envía correo", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    const res = await request(app).post("/auth/forgot-password").set(API).send({ email: "nadie@t4d.com" });
    expect(res.status).toBe(200);
    expect(res.body.mensaje).toMatch(/Si el correo existe/);
    expect(transporter.sendMail).not.toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledTimes(1); // solo la búsqueda, no guarda ningún código
  });

  test("CP-AUTH-18: correo existente guarda el código y envía el enlace", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([usuarioBD])) // SELECT usuario
      .mockResolvedValueOnce(resultado([], 1)); // UPDATE reset_code

    const res = await request(app).post("/auth/forgot-password").set(API).send({ email: "admin@t4d.com" });

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toMatch(/Si el correo existe/);

    // Se guarda un token aleatorio de 64 caracteres que vence en ~15 minutos
    const [sql, valores] = pool.query.mock.calls[1];
    expect(sql).toMatch(/UPDATE usuarios SET reset_code = \$1, reset_code_expires = \$2/);
    expect(valores[0]).toMatch(/^[0-9a-f]{64}$/);
    const minutos = (new Date(valores[1]).getTime() - Date.now()) / 60000;
    expect(minutos).toBeGreaterThan(14);
    expect(minutos).toBeLessThanOrEqual(15);
    expect(valores[2]).toBe(1);

    // El correo lleva el enlace con ese mismo token
    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    const correo = transporter.sendMail.mock.calls[0][0];
    expect(correo.to).toBe("admin@t4d.com");
    expect(correo.html).toContain(`${process.env.FRONTEND_URL}/reset-password?token=${valores[0]}`);
  });

  test("CP-AUTH-19: si no se puede guardar el código, no se envía correo (500)", async () => {
    pool.query
      .mockResolvedValueOnce(resultado([usuarioBD]))
      .mockRejectedValueOnce(new Error("fallo BD"));

    const res = await request(app).post("/auth/forgot-password").set(API).send({ email: "admin@t4d.com" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error al procesar la solicitud");
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  test("CP-AUTH-20: reset-password sin campos responde 400", async () => {
    const res = await request(app).post("/auth/reset-password").set(API).send({ token: "abc" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Faltan campos/);
  });

  test("CP-AUTH-21: reset-password con contraseña de menos de 6 caracteres responde 400", async () => {
    const res = await request(app).post("/auth/reset-password").set(API).send({ token: "abc", nuevaPassword: "123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/al menos 6 caracteres/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("CP-AUTH-22: reset-password con token inválido responde 400", async () => {
    pool.query.mockResolvedValueOnce(resultado([]));
    const res = await request(app).post("/auth/reset-password").set(API).send({ token: "falso", nuevaPassword: "Nueva123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Enlace inválido o expirado");
  });

  test("CP-AUTH-23: reset-password con enlace vencido responde 400 y no cambia la clave", async () => {
    const ayer = new Date(Date.now() - 24 * 3600 * 1000);
    pool.query.mockResolvedValueOnce(resultado([{ id_usuario: 1, reset_code_expires: ayer }]));
    const res = await request(app).post("/auth/reset-password").set(API).send({ token: "viejo", nuevaPassword: "Nueva123" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Enlace inválido o expirado");
    expect(pool.query).toHaveBeenCalledTimes(1); // no hizo UPDATE
  });

  test("CP-AUTH-24: reset-password correcto guarda la clave CIFRADA y anula el enlace (200)", async () => {
    const enDiezMinutos = new Date(Date.now() + 10 * 60 * 1000);
    pool.query
      .mockResolvedValueOnce(resultado([{ id_usuario: 1, reset_code_expires: enDiezMinutos }]))
      .mockResolvedValueOnce(resultado([], 1));

    const res = await request(app).post("/auth/reset-password").set(API).send({ token: "vigente", nuevaPassword: "Nueva123" });

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toBe("Contraseña actualizada correctamente");

    const [sql, valores] = pool.query.mock.calls[1];
    expect(valores[0]).not.toBe("Nueva123"); // nunca se guarda en texto plano
    expect(bcrypt.compareSync("Nueva123", valores[0])).toBe(true);
    expect(valores[1]).toBe(1);
    expect(sql).toMatch(/reset_code = NULL, reset_code_expires = NULL/); // el enlace sirve una sola vez
  });
});