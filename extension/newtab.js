const cards = document.getElementById("cards");
const status = document.getElementById("status");

const API_BASE = "http://127.0.0.1:8000";

/* ------------------ UI RENDERING ------------------ */

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

/* ------------------ BACKEND CALLS ------------------ */

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

/* ------------------ EXTRACTION FLOW ------------------ */

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

/* ------------------ INIT ------------------ */

requestExtraction();
