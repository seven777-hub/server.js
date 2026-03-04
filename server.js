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
// MODEL DOCUMENTO
// =========================
const documentoSchema = new mongoose.Schema({
  usuarioEmail: String,
  nomeCliente: String,
  cpfOuCnpj: String,
  tipoDocumento: String,
  descricao: String,
  valor: Number,
  status: {
    type: String,
    default: "pendente"
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

const Documento = mongoose.model("Documento", documentoSchema);

// =========================
// CONFIGURAÇÃO ADMIN
// =========================
const ADMIN_EMAIL = "luh.fer015@gmail.com";
const ADMIN_PASSWORD = "123456";

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

// LOGIN
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

// REGISTRO
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

// LISTAR USUÁRIOS (ADMIN)
app.get("/admin/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// LIBERAR USUÁRIO (ADMIN)
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
// CRIAR DOCUMENTO
// =========================
app.post("/documentos", async (req, res) => {
  try {
    const {
      usuarioEmail,
      nomeCliente,
      cpfOuCnpj,
      tipoDocumento,
      descricao,
      valor
    } = req.body;

    const novoDocumento = await Documento.create({
      usuarioEmail,
      nomeCliente,
      cpfOuCnpj,
      tipoDocumento,
      descricao,
      valor
    });

    res.json({ ok: true, documento: novoDocumento });

  } catch (error) {
    res.status(500).json({ ok: false, error });
  }
});

// =========================
// LISTAR DOCUMENTOS DO USUÁRIO
// =========================
app.get("/documentos/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const documentos = await Documento.find({ usuarioEmail: email });

    res.json(documentos);

  } catch (error) {
    res.status(500).json({ ok: false, error });
  }
});

// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
// =========================
// CALCULADORA ORÇAMENTO
// =========================
app.post("/calcular/orcamento", async (req, res) => {
  try {
    const {
      usuarioEmail,
      horas,
      valorHora,
      material,
      deslocamento,
      margem,
      imposto
    } = req.body;

    const maoDeObra = horas * valorHora;
    const custoBase = maoDeObra + material + deslocamento;
    const lucro = custoBase * (margem / 100);
    const subtotal = custoBase + lucro;
    const valorImposto = subtotal * (imposto / 100);
    const total = subtotal + valorImposto;

    const novoCalculo = new Calculo({
      usuarioEmail,
      tipo: "orcamento",
      dados: req.body,
      resultado: {
        maoDeObra,
        custoBase,
        lucro,
        valorImposto,
        total
      }
    });

    await novoCalculo.save();

    res.json({
      ok: true,
      resultado: {
        maoDeObra,
        custoBase,
        lucro,
        valorImposto,
        total
      }
    });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});


// =========================
// CALCULADORA UBER / ENTREGADOR
// =========================
app.post("/calcular/uber", async (req, res) => {
  try {
    const {
      usuarioEmail,
      kmRodado,
      consumoKmPorLitro,
      precoCombustivel,
      valorRecebido,
      taxaApp,
      custoManutencaoPorKm
    } = req.body;

    const litrosUsados = kmRodado / consumoKmPorLitro;
    const custoCombustivel = litrosUsados * precoCombustivel;
    const custoManutencao = kmRodado * custoManutencaoPorKm;
    const valorTaxa = valorRecebido * (taxaApp / 100);

    const custoTotal = custoCombustivel + custoManutencao + valorTaxa;
    const lucroLiquido = valorRecebido - custoTotal;

    const novoCalculo = new Calculo({
      usuarioEmail,
      tipo: "uber",
      dados: req.body,
      resultado: {
        litrosUsados,
        custoCombustivel,
        custoManutencao,
        valorTaxa,
        custoTotal,
        lucroLiquido
      }
    });

    await novoCalculo.save();

    res.json({
      ok: true,
      resultado: {
        litrosUsados,
        custoCombustivel,
        custoManutencao,
        valorTaxa,
        custoTotal,
        lucroLiquido
      }
    });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});
