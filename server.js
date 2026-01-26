import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const MP_TOKEN = process.env.MP_TOKEN;

if (!MP_TOKEN) {
  console.error("MP_TOKEN não definido");
}

app.get("/", (req, res) => {
  res.send("Servidor DocFácil rodando 🚀");
});

app.post("/pix", async (req, res) => {
  try {
    const { valor, nome } = req.body;

    if (!valor) {
      return res.status(400).json({ erro: "Valor não informado" });
    }

    const resposta = await fetch(
      "https://api.mercadopago.com/v1/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_amount: Number(valor),
          description: "Documento DocFácil",
          payment_method_id: "pix",
          payer: {
            email: "cliente@docfacil.com",
            first_name: nome || "Cliente"
          }
        })
      }
    );

    const dados = await resposta.json();

    const copiaCola =
      dados?.point_of_interaction?.transaction_data?.qr_code;

    const qrBase64 =
      dados?.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!copiaCola) {
      return res.status(500).json({
        erro: "Pix criado, mas QR Code não retornou",
        dados
      });
    }

    res.json({
      copiaCola,
      qrBase64
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao gerar Pix" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
