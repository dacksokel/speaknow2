let allSpeaks = "";
const recognition = new webkitSpeechRecognition();
const startBtn = document.querySelector("#start-btn");
const transcription = document.querySelector("#transcription");
const aires = document.querySelector("#airesponse");
const stopAiSpeak = document.querySelector("#stop-btn");
const selectLang = document.querySelector("#langs");
const btnSelectLang = document.querySelector("#btnSelectLang");
const langSelecter = document.querySelector("#langSelecter");
const deleteAllspeak = document.querySelector("#delete-allspeck");

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "es";
let isSpeak = false;
let isListeningForElisa = false;
let elisaTimeout;
let capturedText = "";

btnSelectLang.addEventListener("click", () => {
  recognition.lang = selectLang.value;
  langSelecter.innerText = selectLang.value;
});

deleteAllspeak.addEventListener("click", () => {
  allSpeaks = "";
  console.log("limpio");
});

startBtn.addEventListener("click", () => {
  if (!isSpeak) {
    startRecognition();
  } else {
    stopRecognition();
  }
});

stopAiSpeak.addEventListener("click", () => {
  speechSynthesis.cancel();
});

recognition.addEventListener("result", (event) => {
  if (!isListeningForElisa) return;

  const transcript = Array.from(event.results)
    .map((result) => result[0].transcript)
    .join("");

  const elisaIndex = transcript.toLowerCase().lastIndexOf("elisa");
  if (elisaIndex !== -1) {
    capturedText = transcript.slice(elisaIndex + 5).trim();
  } else {
    capturedText = transcript.trim();
  }
  transcription.textContent = capturedText;
  clearTimeout(elisaTimeout);
  elisaTimeout = setTimeout(processElisaCommand, 3000);
});

recognition.addEventListener("end", () => {
  console.log("Reconocimiento de voz detenido.");
  if (isSpeak && !isListeningForElisa) {
    recognition.start();
  }
});

function processElisaCommand() {
  if (capturedText) {
    console.log("Procesando comando de Elisa:", capturedText);
    pauseListening();
    speak(capturedText);
  } else {
    console.log("No se capturó ningún comando después de 'Elisa'");
    transcription.textContent =
      "No se detectó ningún comando. Di 'Elisa' para empezar de nuevo.";
    resetElisaListening();
  }
}

function resetElisaListening() {
  isListeningForElisa = false;
  capturedText = "";
  clearTimeout(elisaTimeout);
  transcription.textContent = "Di 'Elisa' para empezar...";
}

function startRecognition() {
  speechSynthesis.cancel();
  recognition.start();
  console.log("Reconocimiento de voz iniciado...");
  isSpeak = true;
  startBtn.innerHTML = "Stop Recording";
  startBtn.style.backgroundColor = "orange";
  transcription.textContent = "Di 'Elisa' para empezar...";

  // Agregar evento para detectar "Elisa"
  recognition.onresult = function (event) {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");

    if (transcript.toLowerCase().includes("elisa") && !isListeningForElisa) {
      speechSynthesis.cancel();

      console.log("'Elisa' detectado. Comenzando a escuchar...");
      isListeningForElisa = true;
      capturedText = "";
      transcription.textContent = "Escuchando...";
    }
  };
}

function stopRecognition() {
  recognition.stop();
  console.log("Deteniendo el Reconocimiento de voz...");
  isSpeak = false;
  resetElisaListening();
  startBtn.innerHTML = "User Speak NOW!";
  startBtn.style.backgroundColor = "greenyellow";
  transcription.textContent = "";
}

function pauseListening() {
  isListeningForElisa = false;
  recognition.stop();
}

async function speak(userText) {
  console.log("Texto del usuario:", userText);
  allSpeaks += `[user: ${userText}]`;

  const charLimit = 5500;
  if (allSpeaks.length > charLimit) {
    allSpeaks = allSpeaks.slice(-charLimit);
  }

  const data = await fetch(window.location.origin + "/speakNow4", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: userText }),
  });
  const res = await data.json();
  console.log(res);
  let aiResponse = res.response;

  allSpeaks += `[asistente: ${aiResponse}]`;
  aires.innerText = aiResponse;
  const utterance = new SpeechSynthesisUtterance(aiResponse);
  utterance.rate = 1;
  utterance.lang = recognition.lang;

  utterance.addEventListener("end", () => {
    console.log("Síntesis de voz completada.");
    transcription.textContent = "Di 'Elisa' para empezar de nuevo...";
    startRecognition();
  });

  speechSynthesis.speak(utterance);
}
