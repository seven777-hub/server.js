const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ==========================
// CONFIGURAÇÃO
// ==========================
const ADMIN_EMAIL = "luh.fer015@gmail.com";
const ADMIN_PASSWORD = "123456";

// usuários em memória (temporário)
let users = [
  {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
    liberado: true
  }
];

// ==========================
// ROTAS
// ==========================

// TESTE
app.get("/", (req, res) => {
  res.json({ status: "API DocFácil Pro online" });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "Usuário não encontrado"
    });
  }

  if (user.password !== password) {
    return res.status(401).json({
      ok: false,
      message: "Senha incorreta"
    });
  }

  if (!user.liberado) {
    return res.status(403).json({
      ok: false,
      message: "Usuário aguardando liberação"
    });
  }

  return res.json({
    ok: true,
    role: user.role
  });
});

// CADASTRO DE USUÁRIO COMUM
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const existe = users.find(u => u.email === email);
  if (existe) {
    return res.status(400).json({
      ok: false,
      message: "Usuário já cadastrado"
    });
  }

  users.push({
    email,
    password,
    role: "user",
    liberado: false
  });

  res.json({
    ok: true,
    message: "Cadastro feito. Aguarde liberação do admin."
  });
});

// LISTAR USUÁRIOS (ADMIN)
app.get("/admin/users", (req, res) => {
  res.json(users);
});

// LIBERAR USUÁRIO (ADMIN)
app.post("/admin/liberar", (req, res) => {
  const { email } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({
      ok: false,
      message: "Usuário não encontrado"
    });
  }

  user.liberado = true;

  res.json({
    ok: true,
    message: "Usuário liberado"
  });
});

// ==========================
// START
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
