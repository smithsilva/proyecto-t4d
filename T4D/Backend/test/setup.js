// Configuración global de Jest para T4D (se ejecuta antes de cada archivo de prueba).
// Aquí se reemplazan las conexiones externas (Supabase, Gmail, Cloudinary) por
// "mocks", así las pruebas NO tocan la base de datos real ni envían correos.

process.env.DOTENV_CONFIG_QUIET = "true"; // silencia el mensaje de dotenv
process.env.JWT_SECRET = "secreto_de_pruebas";
process.env.X_API_KEY = "api-key-de-pruebas";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.EMAIL_USER = "pruebas@t4d.test";

jest.mock("../src/config/supabase", () => ({
  from: jest.fn(),
  auth: {
    signInWithPassword: jest.fn(),
    admin: { listUsers: jest.fn(), updateUserById: jest.fn() },
  },
}));

jest.mock("../src/config/nodemailer", () => ({
  sendMail: jest.fn().mockResolvedValue({ accepted: ["ok"] }),
  verify: jest.fn(),
}));

jest.mock("../src/config/cloudinary", () => ({
  config: jest.fn(),
  uploader: {
    upload_stream: jest.fn(),
    destroy: jest.fn().mockResolvedValue({}),
  },
}));

// Silencia los console.log / console.error del backend para que la
// captura de pantalla de la evidencia quede limpia.
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});