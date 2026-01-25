import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const MP_TOKEN = process.env.MP_TOKEN;

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
            email: "cliente@docfacil.com"
          }
        })
      }
    );

    const dados = await resposta.json();

    const copiaCola =
      dados?.point_of_interaction?.transaction_data?.qr_code;

    if (!copiaCola) {
      return res.json({
        erro: "Pix criado, mas código não retornou",
        dados
      });
    }

    res.json({
      pix_copia_cola: copiaCola
    });

  } catch (e) {
    res.status(500).json({ erro: "Erro ao gerar Pix" });
  }
});

app.listen(process.env.PORT || 3000);
