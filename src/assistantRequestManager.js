import { assistantApi } from "./api";
import { getUserStorageKey, STORAGE_KEYS } from "./utils";

// Keeps assistant requests alive while the SPA changes pages. The module lives
// for the lifetime of the browser tab, so an unmounted Assistant component does
// not orphan an in-flight request.
const pendingRequests = new Map();
const cancelledRequests = new Set();

function storageKey(userId) {
  return getUserStorageKey(STORAGE_KEYS.assistantChat, userId || "guest");
}

function readMessages(userId) {
  try {
    const key = storageKey(userId);
    const raw = key ? localStorage.getItem(key) : null;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


function runFallback(fallback) {
  try {
    return String(fallback?.() || "I’m sorry, I could not produce a reliable answer right now. Please try your question again.");
  } catch {
    return "I’m sorry, I could not produce a reliable answer right now. Please try your question again.";
  }
}

function writeMessages(userId, messages) {
  try {
    const key = storageKey(userId);
    if (!key) return false;
    localStorage.setItem(key, JSON.stringify(messages.slice(-32)));
    return true;
  } catch {
    return false;
  }
}

export function persistPendingMessage({ userId, requestId, question, conversation }) {
  const messages = readMessages(userId);
  const index = messages.findIndex((item) => item?.requestId === requestId);
  const hasUserMessage = messages.some((item) => item?.requestId === requestId && item?.role === "user");
  const pendingMessage = {
    role: "assistant",
    id: `assistant-${requestId}`,
    requestId,
    question,
    conversation: Array.isArray(conversation) ? conversation.slice(-10) : [],
    status: "pending",
    text: "Thinking…",
    source: "garden-knowledge",
  };
  if (!hasUserMessage) {
    messages.push({
      role: "user",
      id: `user-${requestId}`,
      requestId,
      text: question,
    });
  }
  if (index >= 0) messages[index] = { ...messages[index], ...pendingMessage };
  else messages.push(pendingMessage);
  writeMessages(userId, messages);
}

function persistResult(userId, requestId, result) {
  const messages = readMessages(userId);
  const index = messages.findIndex((item) => item?.requestId === requestId && item?.status === "pending");
  const assistantMessage = {
    role: "assistant",
    id: `assistant-${requestId}`,
    requestId,
    text: String(result?.answer || "I could not produce an answer yet. Please try again."),
    source: result?.source === "ai" ? "ai" : "garden-knowledge",
  };
  if (index >= 0) messages[index] = assistantMessage;
  else messages.push(assistantMessage);
  writeMessages(userId, messages);
}

export function startAssistantRequest({ userId, requestId, question, conversation, fallback }) {
  const key = `${userId || "guest"}:${requestId}`;
  const existing = pendingRequests.get(key);
  if (existing) return existing;

  persistPendingMessage({ userId, requestId, question, conversation });

  cancelledRequests.delete(key);
  const promise = (async () => {
    try {
      const result = await assistantApi.chat(question, { conversation });
      return {
        answer: String(result?.answer || runFallback(fallback)),
        source: result?.source === "ai" ? "ai" : "garden-knowledge",
      };
    } catch {
      return {
        answer: runFallback(fallback),
        source: "garden-knowledge",
      };
    }
  })();

  pendingRequests.set(key, promise);
  promise
    .then((result) => {
      if (!cancelledRequests.has(key)) persistResult(userId, requestId, result);
    })
    .finally(() => {
      pendingRequests.delete(key);
      cancelledRequests.delete(key);
    });

  return promise;
}

export function hasPendingRequest(userId, requestId) {
  return pendingRequests.has(`${userId || "guest"}:${requestId}`);
}

export function cancelAssistantRequest(userId, requestId) {
  // We intentionally do not abort normal in-flight requests: leaving the page
  // must not lose the answer. This only removes a locally pending record when
  // the user explicitly clears the conversation before completion.
  const key = `${userId || "guest"}:${requestId}`;
  cancelledRequests.add(key);
  pendingRequests.delete(key);
  const messages = readMessages(userId).filter((item) => item?.requestId !== requestId);
  writeMessages(userId, messages);
}
