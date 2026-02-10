import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// CONFIGURAÇÃO ADMIN
// =========================
const ADMIN_EMAIL = "luh.fer015@gmail.com";
const ADMIN_PASSWORD = "123456";

// =========================
// BANCO SIMPLES (memória)
// =========================
let users = [
  {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
    liberado: true
  }
];

// =========================
// ROTAS
// =========================
app.get("/", (req, res) => {
  res.json({ status: "Servidor DocFácil rodando" });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ ok: false, message: "Usuário não encontrado" });
  }

  if (user.password !== password) {
    return res.status(401).json({ ok: false, message: "Senha incorreta" });
  }

  if (!user.liberado) {
    return res.status(403).json({ ok: false, message: "Usuário aguardando liberação" });
  }

  res.json({
    ok: true,
    role: user.role
  });
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ ok: false, message: "Usuário já existe" });
  }

  users.push({
    email,
    password,
    role: "user",
    liberado: false
  });

  res.json({ ok: true });
});

app.get("/admin/users", (req, res) => {
  res.json(users);
});

app.post("/admin/liberar", (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ ok: false });
  }

  user.liberado = true;
  res.json({ ok: true });
});

// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
