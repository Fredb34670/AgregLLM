// content.js - Version native Firefox simple

console.log("AgregLLM: Script de capture chargé dans la page.");

browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "capture") {
    console.log("Ordre de capture reçu.");
    const title = document.querySelector('h1')?.innerText || document.title || "Sans titre";
    const data = {
      title: title,
      url: window.location.href,
      llm: "ChatGPT",
      date: new Date().toISOString()
    };
    return Promise.resolve({ data: data });
  }
});
