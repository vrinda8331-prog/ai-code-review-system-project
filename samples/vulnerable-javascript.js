/**
 * Vulnerable JavaScript Sample Code
 * Contains intentional security flaws and bugs for CodeLens AI analysis testing.
 */

// 1. Critical: Hardcoded Secret
const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const STRIPE_SECRET_KEY = "sk_live_51Abcdef1234567890abcdef123456";

// 2. Insecure PRNG
function generateSessionToken() {
  return "token_" + Math.random().toString(36).substr(2);
}

// 3. Dangerous eval & DOM XSS
function executeUserScript(userInput) {
  // Bug: Loose equality
  if (userInput == null) {
    return;
  }

  // Dangerous DOM XSS
  const container = document.getElementById("user-feed");
  container.innerHTML = "<h3>User Message: " + userInput + "</h3>";

  try {
    // Dangerous Code Injection (CWE-95)
    eval(userInput);
  } catch (err) {
    // Bug: Empty catch block silently suppresses failure
  }

  // Bug: Unreachable code
  return true;
  const unreachableValue = 999;
  console.log("This will never print:", unreachableValue);
}

// 4. Storing sensitive tokens in localStorage
localStorage.setItem("accessToken", STRIPE_SECRET_KEY);
