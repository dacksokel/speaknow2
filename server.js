const express = require("express");
const app = express();
const { LMStudioClient } = require("@lmstudio/sdk");
const Groq = require("groq-sdk");

app.use(express.static("public")); // serve files from the 'public' folder
app.use(express.json());

let model = null

const main =async  () => {
  // await client.llm.unload("my-model");

  const client = new LMStudioClient();
  model = await client.llm.load(
    // "mradermacher/Magot-v1-Gemma2-8k-9B-GGUF/Magot-v1-Gemma2-8k-9B.Q4_K_S.gguf",
    // "lmstudio-community/gemma-2-2b-it-GGUF/gemma-2-2b-it-Q6_K.gguf",
    // "Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2-GGUF/Llama-3.1-8B-Lexi-Uncensored_V2_Q8.gguf",
    "microsoft/Phi-3-mini-4k-instruct-gguf/Phi-3-mini-4k-instruct-q4.gguf",
    {
      // config: { gpuOffload: "max" },
      noHup: true,
      identifier:
        "mradermacher/Magot-v1-Gemma2-8k-9B-GGUF/Magot-v1-Gemma2-8k-9B.Q4_K_S.gguf",
    }
  );
}

main()

const predicionsModel = []
predicionsModel.push({
  role: "system",
  content: `eres un asistente llamada Elizabeth, dispuesto a hacer lo que el usuario pregunte o quiera que seas,
   ademas debes evitar usar en tus respuesta los asteriscos multiples asi: ***hola*** no hagas eso
    `,
});
app.post("/speakNow", async (req, res) => {
  // aquí iría el código que procesa la solicitud y devuelve la respuesta
const userMessage = req.body.text
  predicionsModel.push({ role: "user", content: userMessage })
  console.log(predicionsModel.length);
  // Predict!
  const prediction = model.respond(predicionsModel);
let responseText = ''
    for await (const text of prediction) {
      responseText += text
    process.stdout.write(text);
    }
    predicionsModel.push({ role: "assistant", content: responseText })
    // await client.llm.unload("my-model");
    res.json({
        response: responseText
    })
});


app.post('/speakNow2', async (req, res) => { 
console.log('speack2');
    const userMessage = req.body.text;
    const groq = new Groq({
      apiKey: "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",
    });

  let response = '';
  console.log(predicionsModel.length);
  predicionsModel.push({ role: "user", content: userMessage })
     const completion = await groq.chat.completions
       .create({
         messages: predicionsModel,
         //  model: "llama-3.1-70b-versatile",
         model: "gemma2-9b-it",
       })
       .then((chatCompletion) => {
         console.log(predicionsModel.length);

         response =
           chatCompletion.choices[0]?.message?.content ||
           "No response from the model.";
         predicionsModel.push({ role: "assistant", content: response });
         res.json({ response });
       });
    
})

app.listen(3020, () => {
  console.log("Servidor en ejecución en el puerto 3000");
});
