const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ROTA TESTE (Render usa essa para verificar se está online)
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Servidor DocFacil rodando corretamente 🚀"
  });
});

// Porta automática do Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
