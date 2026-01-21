(() => {
  // This script exists ONLY to prevent normal content extraction
  // on Chrome's built-in PDF viewer.

  const isPdfViewer =
    document.querySelector('embed[type="application/pdf"]') ||
    document.contentType === "application/pdf" ||
    location.href.toLowerCase().endsWith(".pdf");

  if (!isPdfViewer) return;

  // Intentionally do nothing.
  // PDF extraction is handled via offscreen document by background.js.
})();
