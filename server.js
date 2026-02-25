import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// CONEXÃO MONGODB
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.log("Erro ao conectar:", err));

// =========================
// MODEL USUÁRIO
// =========================
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  liberado: Boolean
});

const User = mongoose.model("User", userSchema);

// =========================
// CONFIGURAÇÃO ADMIN
// =========================
const ADMIN_EMAIL = "luh.fer015@gmail.com";
const ADMIN_PASSWORD = "123456";

// Criar admin automaticamente se não existir
async function criarAdmin() {
  const adminExiste = await User.findOne({ email: ADMIN_EMAIL });

  if (!adminExiste) {
    await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      liberado: true
    });
    console.log("Admin criado");
  }
}

criarAdmin();

// =========================
// ROTAS
// =========================
app.get("/", (req, res) => {
  res.json({ status: "Servidor DocFácil rodando" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

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

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (await User.findOne({ email })) {
    return res.status(400).json({ ok: false, message: "Usuário já existe" });
  }

  await User.create({
    email,
    password,
    role: "user",
    liberado: false
  });

  res.json({ ok: true });
});

app.get("/admin/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post("/admin/liberar", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ ok: false });
  }

  user.liberado = true;
  await user.save();

  res.json({ ok: true });
});

// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
