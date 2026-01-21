export function createTabCard(tab, onAction) {
  const card = document.createElement("div");
  card.className = "tab-card";

  card.innerHTML = `
    <div class="tab-title">${tab.title}</div>
    <div class="tab-link">${tab.link}</div>

    <div class="tab-actions">
      <button data-action="summarize">Summarize</button>
      <button data-action="quiz">Make Quiz</button>
      <button data-action="flashcards">Flashcards</button>
    </div>

    <div class="output"></div>
  `;

  card.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => onAction(btn.dataset.action, tab, card);
  });

  return card;
}
