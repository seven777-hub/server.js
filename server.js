import express from "express";
import mercadopago from "mercadopago";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

app.post("/pix", async (req, res) => {
  try {
    const payment = await mercadopago.payment.create({
      transaction_amount: 5,
      description: "Documento DocFácil Pro",
      payment_method_id: "pix",
      payer: {
        email: "cliente@email.com"
      }
    });

    res.json({
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
      qr_code_base64:
        payment.body.point_of_interaction.transaction_data.qr_code_base64,
      payment_id: payment.body.id
    });
  } catch (e) {
    res.status(500).json({ erro: "Erro ao gerar Pix" });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor Pix DocFácil ativo ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Pix rodando"));
