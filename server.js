import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const MP_TOKEN = process.env.MP_TOKEN;

app.get("/", (req, res) => {
  res.send("Servidor Pix online");
});

app.post("/pix", async (req, res) => {
  try {
    const resposta = await fetch(
      "https://api.mercadopago.com/v1/payments",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_amount: 5,
          description: "Documento DocFácil Pro",
          payment_method_id: "pix",
          payer: {
            email: "teste@docfacil.com"
          }
        })
      }
    );

    const dados = await resposta.json();

    const qrBase64 =
      dados?.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!qrBase64) {
      return res.json({
        erro: "Pix criado, mas QR não retornou",
        dados
      });
    }

    res.json({ qr_code_base64: qrBase64 });

  } catch (e) {
    res.status(500).json({
      erro: "Erro ao gerar Pix",
      detalhe: e.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando"));
