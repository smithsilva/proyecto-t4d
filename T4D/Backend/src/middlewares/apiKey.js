const validarApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
 if (!apiKey || apiKey !== process.env.X_API_KEY) {
    return res.status(401).json({ error: "API key inválida o ausente" });
  }
  next();
};

module.exports = validarApiKey;