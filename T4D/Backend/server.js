require("dotenv").config();

console.log("URL =", process.env.SUPABASE_URL);
console.log("KEY =", process.env.SUPABASE_KEY);

const app = require("./src/app");

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});