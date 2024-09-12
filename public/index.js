// let allSpeaks = 'hola para mantener la conversacion, en el idioma que te hable ademas de eso cada vez que yo te envie algo antes dire [yo:] para guardar el contexto de dicha conversacion y ademas para que sepas lo que haz dicho entonces se mantendra la nomezclatura [tu:] para tus respuestas, pero tus respuestas no deben usar las nomezclaturas, sino que deben ser respuestas cortas y breves, evita usar ** ningun asterisco porfavor';
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

const textArea = document.querySelector("#codeArea");
// Configuración del reconocimiento de voz
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "es";
let isSpeak = false;

btnSelectLang.addEventListener("click", () => {
  console.log(selectLang.value);
  recognition.lang = selectLang.value;
  langSelecter.innerText = selectLang.value;
});
deleteAllspeak.addEventListener("click", () => {
  allSpeaks = "";
  console.log("limppio");
  console.log(allSpeaks);
});
// Evento de clic en el botón para empezar a grabar
startBtn.addEventListener("click", () => {
  if (!isSpeak) {
    speechSynthesis.cancel();
    recognition.start();
    console.log("Reconocimiento de voz iniciado...");
    isSpeak = true;
    startBtn.innerHTML = "Stop Recording";
    startBtn.style.backgroundColor = "orange";
  } else {
    recognition.stop();
    speak();
    console.log(" Deteniendo el Reconocimiento de voz...");
    isSpeak = false;
    startBtn.innerHTML = "User Speak NOW!";
    startBtn.style.backgroundColor = "greenyellow";
  }
});
stopAiSpeak.addEventListener("click", () => {
  speechSynthesis.cancel();
});

// Evento que se dispara cuando se detecta una pausa en el discurso
recognition.addEventListener("result", (event) => {
  const transcript = Array.from(event.results)
    .map((result) => {
      result[0].transcript;
    })
    .join("");
  transcription.textContent = transcript;
});

// Evento que se dispara cuando el reconocimiento de voz se detiene
recognition.addEventListener("end", () => {
  console.log("Reconocimiento de voz detenido.");
});

async function speak() {
  const userText = transcription.innerText + " " + textArea.value;
  console.log(userText);
  allSpeaks += `[user: ${userText}]`;
  // Limite de caracteres (1000 o 2000)
  const charLimit = 5500; // o 2000

  if (allSpeaks.length > charLimit) {
    // Eliminar caracteres más antiguos
    allSpeaks = allSpeaks.slice(-charLimit);
  }

  // const data = await fetch("http://localhost:5000/rapiapi", {
  // const data = await fetch("https://api.speaknow.x10.bz/rapiapi", {
  const data = await fetch(window.location.origin + "/speakNow", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: userText }),
  });
  const res = await data.json();
  console.log(res);
  let aiResponse = res.response;

  // let aiResponse2 = aiResponse.split('tu:');
  // if (aiResponse2.length > 0) {
  //     aiResponse = aiResponse2[1]
  // }
  // console.log('************************************************')
  // console.log(aiResponse)
  allSpeaks += `[asistente: ${aiResponse}]`;
  aires.innerText = aiResponse;
  const utterance = new SpeechSynthesisUtterance(aiResponse);
  //    const voices = speechSynthesis.getVoices();
  //    console.log(voices)
  // utterance.voice = voices[0];
  utterance.rate = 1;
  utterance.lang = recognition.lang;
  // console.log(utterance)
  utterance.addEventListener("end", () => {
    console.log("Síntesis de voz completada.");

    textArea.value = "";
  });

  // console.log(allSpeaks);
  // console.log(typeof allSpeaks);
  speechSynthesis.speak(utterance);
}
