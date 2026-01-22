const cards = document.getElementById("cards");
const status = document.getElementById("status");

const API_BASE = "http://127.0.0.1:8000";


function createCard(tab) {
  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <div class="card-header">
      <div>
        <div class="card-title">${tab.title}</div>
        <div class="card-url">${tab.link}</div>
      </div>
    </div>

    <div class="card-actions">
      <button data-action="summarize">Summarize</button>
      <button data-action="quiz">Make Quiz</button>
      <button data-action="flashcards">Flashcards</button>
    </div>

    <div class="card-output">Ready</div>
  `;

  div.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => runAction(btn.dataset.action, tab, div);
  });

  return div;
}


async function runAction(action, tab, card) {
  const output = card.querySelector(".card-output");
  output.textContent = "Processing…";

  let endpoint = "";
  if (action === "summarize") endpoint = "/study/summarize";
  if (action === "quiz") endpoint = "/study/quiz";
  if (action === "flashcards") endpoint = "/study/flashcards";

  try {
    const res = await fetch(API_BASE + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: tab.content })
    });

    const data = await res.json();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    output.textContent = "Backend error.";
  }
}


function requestExtraction() {
  status.textContent = "Analyzing your open tabs…";
  chrome.runtime.sendMessage({ type: "START_EXTRACTION" });
}

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type !== "EXTRACTION_COMPLETE") return;

  status.textContent = `Found ${msg.tabs.length} tabs`;
  cards.innerHTML = "";

  msg.tabs.forEach(tab => {
    const card = createCard(tab);
    cards.appendChild(card);
  });
});


requestExtraction();

const genBtn = document.getElementById("genBtn");
const genPrompt = document.getElementById("genPrompt");
const appPreview = document.getElementById("appPreview");

genBtn.addEventListener("click", async () => {
  const prompt = genPrompt.value.trim();
  if (!prompt) return;

  genBtn.disabled = true;
  genBtn.textContent = "Generating...";

  try {
      const res = await fetch("http://127.0.0.1:8000/generic/genapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt })
      });
    // const res = await fetch(
    //   chrome.runtime.getURL("response_1769022171377.json")
    // );
    const data = await res.json();

    appPreview.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "80vh";
    iframe.style.border = "none";

    iframe.src = chrome.runtime.getURL("sandbox.html");

    iframe.onload = () => {
      iframe.contentWindow.postMessage(
        {
          type: "RUN_LLM_APP",
          payload: {
            html: data.html,
            script: data.script
          }
        },
        "*"
      );
    };

    appPreview.appendChild(iframe);

  } catch (err) {
    console.error("Failed to load app:", err);
    alert("Failed to generate app");
  } finally {
    genBtn.disabled = false;
    genBtn.textContent = "Generate App";
  }
});
