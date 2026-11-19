// Configuración global de Jest (se ejecuta antes de cada archivo de prueba).
// Las conexiones externas se reemplazan por "mocks": las pruebas NO tocan
// tu base de datos real, ni envían correos, ni suben imágenes.

process.env.DOTENV_CONFIG_QUIET = "true";
process.env.JWT_SECRET = "secreto_de_pruebas";
process.env.X_API_KEY = "api-key-de-pruebas";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.EMAIL_USER = "pruebas@t4d.test";

// Postgres: pool.query pasa a ser una función simulada
jest.mock("../src/config/db", () => ({
  query: jest.fn(),
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

// Silencia los console.log / console.error para que la salida quede limpia
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});