import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// CONFIG
// ===============================
const ADMIN_PASSWORD = "123456";

// lista de e-mails liberados
let usuariosLiberados = [
  "luh.fer015@gmail.com"
];

// ===============================
// ROTAS
// ===============================

// status do servidor
app.get("/", (req, res) => {
  res.send("Servidor DocFácil rodando 🚀");
});

// verificar acesso do usuário
app.post("/check-access", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ autorizado: false });
  }

  const autorizado = usuariosLiberados.includes(email);
  res.json({ autorizado });
});

// painel admin - listar usuários
app.post("/admin/list", (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ erro: "Senha inválida" });
  }

  res.json({ usuariosLiberados });
});

// painel admin - liberar usuário
app.post("/admin/add", (req, res) => {
  const { password, email } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ erro: "Senha inválida" });
  }

  if (!usuariosLiberados.includes(email)) {
    usuariosLiberados.push(email);
  }

  res.json({ sucesso: true, usuariosLiberados });
});

// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
