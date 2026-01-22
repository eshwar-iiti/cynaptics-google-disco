window.addEventListener("message", (e) => {
  if (!e.data || e.data.type !== "RUN_LLM_APP") return;

  const { html, script } = e.data.payload;

  document.open();
document.write(html);
document.close();

try {
  new Function(script)();

  document.dispatchEvent(
    new Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true
    })
  );

  window.dispatchEvent(new Event("load"));

} catch (err) {
  console.error("LLM runtime error:", err);
  document.body.innerHTML += `
    <pre style="color:red; white-space:pre-wrap;">
${err}
    </pre>
  `;
}
});
