const ConfigJson = require("./config.json");
const axios = require("axios");

const messages = [
  {
    role: "user",
    content: `eres un asistente llamada elisa, dispuesto a hacer lo que el usuario pregunte o quiera que seas`,
  },
];

module.exports = async (req, res) => {
  try {
    // Asegúrate de que req.body.text exista antes de acceder al contenido
    if (!req.body || !req.body.text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    messages.push({
      role: "user",
      content: req.body.text,
    });

    const response = await axios.post("http://localhost:11434/api/chat", {
      messages,
      model: ConfigJson.model,
    });

    const data = response.data;
    let fullResponse = "";

    data.forEach((msg) => {
      if (msg.message.role === "assistant") {
        fullResponse += msg.message.content;
      }
    });

    messages.push({'role': 'assistant', 'content': fullResponse});

    res.json({
      response: fullResponse,
    });
  } catch (error) {
    console.error(error); // Log the error to the console for debugging purposes
    return res.status(500).json({ error: "An error occurred" });
  }
};
