const ConfigJson = require("./config.json");

const messages = [
  {
    role: "user",
    content: `eres un asistente llamada elisa, dispuesto a hacer lo que el usuario pregunte o quiera que seas`,
  },
];

module.exports = async (req, res) => {
  // Validar si el cuerpo de la solicitud es vacío
  if (!req.body || !req.body.text) {
    return res.status(400).json({ error: "No se proporcionó texto para enviar." });
  }

  const userMessage = req.body.text;
  try {
    messages.push({
      role: "user",
      content: userMessage,
    });

    const response = await fetch(ConfigJson.urlServer, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ConfigJson.apykey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ConfigJson.model,
        messages: {},
      }),
    });

    const data = await response.json();

    // Validar si la respuesta tiene un estado satisfactorio
    if (response.status >= 200 && response.status < 300) {
      res.json({ response: data.choices[0].message.content });
    } else {
      throw new Error(`Error al procesar la solicitud. Código de estado: ${response.status}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Ha ocurrido un error en el servidor." });
  }
};
