import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const MP_TOKEN = process.env.MP_TOKEN;

app.post("/pix", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.mercadopago.com/v1/payments",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_amount: 5,
          description: "Documento DocFacil Pro",
          payment_method_id: "pix",
          payer: {
            email: "cliente@docfacil.com"
          }
        })
      }
    );

    const data = await response.json();

    const qrCode =
      data?.point_of_interaction?.transaction_data?.qr_code;

    const qrCodeBase64 =
      data?.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!qrCode) {
      return res.status(400).json({
        error: "Pix criado, mas QR Code não retornou",
        data
      });
    }

    res.json({
      copia_e_cola: qrCode,
      qr_code_base64: qrCodeBase64
    });

  } catch (error) {
    res.status(500).json({
      error: "Erro ao gerar Pix",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor Pix rodando na porta " + PORT);
});
