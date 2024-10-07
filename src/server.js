const express = require("express");
const app = express();
const { LMStudioClient } = require("@lmstudio/sdk");
const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

app.use(express.static("public")); // serve files from the 'public' folder
app.use(express.json());

let model = null
const genAI = new GoogleGenerativeAI('AIzaSyDu9K4MXP45tl4oKSg1Q7HomYpy4PlI - Oo');
const modelGoogle = genAI.getGenerativeModel({
  model: "gemini-1.5-flex-002",
});
const historyGoogleUser = []
const historyGoogleModel = [{text:''}];
const main =async  () => {
  // await client.llm.unload("my-model");

  const client = new LMStudioClient();
  model = await client.llm.load(
    // "mradermacher/Magot-v1-Gemma2-8k-9B-GGUF/Magot-v1-Gemma2-8k-9B.Q4_K_S.gguf",
    // "lmstudio-community/gemma-2-2b-it-GGUF/gemma-2-2b-it-Q6_K.gguf",
    // "Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2-GGUF/Llama-3.1-8B-Lexi-Uncensored_V2_Q8.gguf",
    // "microsoft/Phi-3-mini-4k-instruct-gguf/Phi-3-mini-4k-instruct-q4.gguf",
    // "NousResearch/Hermes-3-Llama-3.1-8B-GGUF/Hermes-3-Llama-3.1-8B.Q4_K_M.gguf",
    "hugging-quants/Llama-3.2-3B-Instruct-Q8_0-GGUF/llama-3.2-3b-instruct-q8_0.gguf",
    {
      // config: { gpuOffload: "max" },
      noHup: true,
      identifier:
        "lmStudio model",
    }
  );
}

// main()

const predicionsModel = []
predicionsModel.push({
  role: "system",
  content: `eres un asistente llamada elisa, dispuesto a hacer lo que el usuario pregunte o quiera que seas,
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
         model: "llama-3.2-90b-text-preview",
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

app.post('/speakNow3', async (req, res) => { 
  const userMessage = req.body.text;
  historyGoogleUser.push({
    text: userMessage,
  });
  const chat = modelGoogle.startChat({
    history: [
      {
        role: "user",
        parts: historyGoogleUser,
      },
      {
        role: "model",
        parts: historyGoogleModel,
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  //  const chat = modelGoogle.startChat({
  //    history: [
  //      {
  //        role: "user",
  //        parts: [{ text: "Hello, I have 2 dogs in my house." }],
  //      },
  //      {
  //        role: "model",
  //        parts: [{ text: "Great to meet you. What would you like to know?" }],
  //      },
  //    ],
  //    generationConfig: {
  //      maxOutputTokens: 100,
  //    },
  //  });
  const result = await chat.sendMessage(userMessage);
  const response = await result.response;
  const text = response.text();
  historyGoogleModel.push({
    text: text,
  })
  console.log(text);
res.json({ response: text  });
})

app.post('/speakNow4', require('./ollama/controller'))
app.post("/speakNow5", require("./openRouter/controller"));

app.listen(3020, () => {
  console.log("Servidor en ejecución en el puerto 3020");
});
