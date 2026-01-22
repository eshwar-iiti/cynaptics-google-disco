(() => {
  function extractCleanText() {
    const clone = document.body.cloneNode(true);

    const killSelectors = [
      "script",
      "style",
      "noscript",
      "template",
      "svg",
      "canvas",
      "nav",
      "footer",
      "aside",
      "button",
      "input",
      "select",
      "form",
      "dialog",
      "[role='navigation']",
      "[aria-hidden='true']"
    ];

    killSelectors.forEach(sel =>
      clone.querySelectorAll(sel).forEach(el => el.remove())
    );

    const root =
      clone.querySelector("article") ||
      clone.querySelector("main") ||
      clone;

    const seenBlocks = new Set();
    const blocks = [];

    root.querySelectorAll("h1,h2,h3,h4,p,li,pre,code").forEach(el => {
      let text = el.innerText.replace(/\s+/g, " ").trim();
      if (text.length < 40) return;

      if (
        (text.includes("{") && text.includes("}") && text.includes(":")) ||
        text.includes("display:") ||
        text.includes("clickstream") ||
        text.includes("metrics") ||
        text.includes("videoUrl") ||
        text.includes("schemaId") ||
        text.includes("mimeType")
      ) return;

      if (seenBlocks.has(text)) return;
      seenBlocks.add(text);

      blocks.push(text);
    });

    return blocks.join("\n\n");
  }

  function dedupeSentences(text) {
    const seen = new Set();
    const sentences = text.split(/(?<=[.!?])\s+/);
    const output = [];

    for (let s of sentences) {
      s = s.trim();
      if (s.length < 30) continue;
      if (/[{[\]}":]{4,}/.test(s)) continue;

      if (!seen.has(s)) {
        seen.add(s);
        output.push(s);
      }
    }

    return output.join(" ");
  }

  function finalCleanup(text) {
    return text
      .replace(/\b(cookie|privacy|subscribe|sign up|log in)\b/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function getContent() {
    let text = extractCleanText();
    text = dedupeSentences(text);
    text = finalCleanup(text);
    return text.slice(0, 12000);
  }

  return getContent();
})();
