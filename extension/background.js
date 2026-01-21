let offscreenCreated = false;

async function createOffscreen() {
  if (offscreenCreated) return;

  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["BLOBS"],
      justification: "PDF text extraction"
    });
  } catch (e) {
    // already created
  }

  offscreenCreated = true;
}

async function extractPDFText(url) {
  await createOffscreen();

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve("PDF extraction timeout");
    }, 30000);

    chrome.runtime.sendMessage(
      { type: "EXTRACT_PDF", url },
      (response) => {
        clearTimeout(timeout);
        resolve(response?.text || "PDF extraction failed");
      }
    );
  });
}

async function isPDF(url) {
  try {
    if (
      url.includes(".pdf") ||
      url.match(/arxiv\.org\/pdf/) ||
      url.match(/\.pdf($|\?|#)/)
    ) {
      return true;
    }

    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type");
    return contentType?.includes("application/pdf");
  } catch {
    return false;
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "START_EXTRACTION") return;

  (async () => {
    const tabsData = [];
    const tabs = await chrome.tabs.query({});

    for (const tab of tabs) {
      if (
        !tab.id ||
        !tab.url ||
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("https://chrome.google.com")
      ) {
        continue;
      }

      let content = "";

      const pdf = await isPDF(tab.url);

      if (pdf) {
        content = await extractPDFText(tab.url);
      } else {
        try {
          const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText
          });
          content = result || "";
        } catch {
          content = "";
        }
      }

      tabsData.push({
        title: tab.title || "Untitled",
        link: tab.url,
        content
      });
    }

    chrome.runtime.sendMessage({
      type: "EXTRACTION_COMPLETE",
      tabs: tabsData
    });
  })();
});
