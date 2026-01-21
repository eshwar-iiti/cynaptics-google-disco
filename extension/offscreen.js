chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "EXTRACT_PDF") return;

  extractPDF(msg.url)
    .then(text => {
      sendResponse({ text });
    })
    .catch(error => {
      sendResponse({ text: "PDF extraction error: " + error.message });
    });

  return true; // keep message channel open
});

async function extractPDF(url) {
  console.log("Offscreen: Fetching PDF", url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000); // 25s guard

  try {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let fullText = "";
    const MAX_PAGES = 50;

    for (let i = 1; i <= pdf.numPages && i <= MAX_PAGES; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map(item => item.str)
        .join(" ");

      fullText += pageText + "\n\n";

      if (fullText.length > 20000) break;
    }

    return fullText.slice(0, 20000);
  } catch (err) {
    console.error("Offscreen PDF error:", err);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
