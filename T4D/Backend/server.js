require("dotenv").config();
console.log("API_KEY:", process.env.API_KEY);
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});