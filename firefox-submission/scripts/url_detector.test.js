// Fichier de test pour la détection d'URL de ChatGPT

// Simule une fonction d'assertion simple
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// Suite de tests pour isChatGPTConversationURL
function testURLDetector() {
  console.log("Running tests for isChatGPTConversationURL...");

  // Cas qui devraient fonctionner (retourner true)
  const validURLs = [
    "https://chat.openai.com/c/12345678-1234-1234-1234-1234567890ab",
    "https://chat.openai.com/c/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "https://chat.openai.com/c/0987fedc-ba98-7654-3210-fedcba987654"
  ];

  validURLs.forEach(url => {
    assert(isChatGPTConversationURL(url), `Expected ${url} to be a valid ChatGPT URL.`);
    console.log(`  PASS: ${url}`);
  });

  // Cas qui ne devraient pas fonctionner (retourner false)
  const invalidURLs = [
    "https://chat.openai.com/c/abcdefgh-abcd-abcd-abcd-abcdefghijkl", // 'j,k,l' are not hex
    "https://chat.openai.com/c/a-real-uuid-v4-would-be-here-now-yo", // incorrect format
    "https://chat.openai.com/",
    "https://chat.openai.com/auth/login",
    "https://google.com/c/12345678-1234-1234-1234-1234567890ab",
    "https://chat.openai.com/c/",
    "https://chat.openai.com/c/not-a-uuid",
    "https://example.com"
  ];

  invalidURLs.forEach(url => {
    assert(!isChatGPTConversationURL(url), `Expected ${url} to be an invalid ChatGPT URL.`);
    console.log(`  PASS: ${url}`);
  });

  console.log("All tests for isChatGPTConversationURL passed!");
}

// Exécuter les tests (cela échouera car isChatGPTConversationURL n'est pas défini)
try {
  testURLDetector();
} catch (e) {
  console.error("Test failed:", e.message);
}
