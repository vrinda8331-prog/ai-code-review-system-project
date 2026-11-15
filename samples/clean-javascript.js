/**
 * Clean & Production-Ready JavaScript Sample
 * Follows defensive programming, strict equality, and structured error handling.
 */

function sanitizeHtml(untrustedString) {
  if (typeof untrustedString !== "string") {
    throw new TypeError("Expected string input");
  }

  return untrustedString
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSafeGreeting(userName, parentContainer) {
  if (!parentContainer || !(parentContainer instanceof HTMLElement)) {
    throw new Error("Invalid parent DOM element provided");
  }

  const safeName = sanitizeHtml(userName || "Guest");
  const greetingElement = document.createElement("p");
  greetingElement.className = "greeting-text";
  greetingElement.textContent = `Welcome back, ${safeName}!`;

  parentContainer.appendChild(greetingElement);
  return greetingElement;
}
