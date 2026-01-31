import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* =========================
   CONFIG
========================= */
const ADMIN_EMAIL = "luh.fer015@gmail.com";

/* =========================
   BANCO SIMPLES (MEMÓRIA)
   depois dá pra trocar
========================= */
let users = {
  "luh.fer015@gmail.com": {
    email: "luh.fer015@gmail.com",
    status: "ativo",
    role: "admin"
  }
};

/* =========================
   ROTAS
========================= */

// Health check
app.get("/", (req, res) => {
  res.send("Servidor DocFácil rodando 🚀");
});

// Login
app.post("/login", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-mail obrigatório" });
  }

  // Se não existe, cria como pendente
  if (!users[email]) {
    users[email] = {
      email,
      status: "pendente",
      role: "user"
    };
  }

  const user = users[email];

  if (user.status !== "ativo") {
    return res.json({
      status: "pendente",
      message: "Acesso pendente. Após o pagamento, o acesso é liberado manualmente."
    });
  }

  res.json({
    status: "ativo",
    role: user.role
  });
});

// Painel admin – listar usuários
app.get("/admin/users", (req, res) => {
  res.json(users);
});

// Admin libera usuário
app.post("/admin/liberar", (req, res) => {
  const { adminEmail, email } = req.body;

  if (adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Não autorizado" });
  }

  if (!users[email]) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  users[email].status = "ativo";

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
