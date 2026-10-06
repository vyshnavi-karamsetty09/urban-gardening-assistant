import { useEffect, useRef, useState } from "react";
import PageHeaderBanner from "../components/PageHeaderBanner";
import { getAuthToken } from "../api";
import { cancelAssistantRequest, startAssistantRequest, persistPendingMessage } from "../assistantRequestManager";
import { STORAGE_KEYS, getSavedPlants, getUserStorageKey, readStoredEnvironment, readStorage } from "../utils";
import { getLocalAssistantAnswer } from "../assistantKnowledge";
import "./GardenAssistant.css";

const QUICK_PROMPTS = [
  "💧 How often should I water my mint?",
  "☀️ Is my plant getting enough sunlight?",
  "🌱 What soil should I use for containers?",
  "🐛 I found aphids. What should I check first?",
  "🍃 My leaves are turning yellow. Help me troubleshoot.",
];

const INITIAL_MESSAGE = {
  role: "assistant",
  text: "Hi! I’m your Garden Guide assistant. Tell me the plant name and what you want to fix, grow, or understand. I can help with watering, light, soil, pests, symptoms, feeding, and harvest care.",
  source: "garden-knowledge",
};

function renderAssistantText(text) {
  const lines = String(text || "").split(/\r?\n/);
  const nodes = [];
  let bulletItems = [];

  const flushBullets = () => {
    if (!bulletItems.length) return;
    nodes.push(
      <ul className="assistant-message-list" key={`list-${nodes.length}`}>
        {bulletItems.map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>{item}</li>
        ))}
      </ul>,
    );
    bulletItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBullets();
      nodes.push(<div className="assistant-message-spacer" key={`space-${index}`} />);
      return;
    }

    if (/^(?:•|[-*])\s+/.test(trimmed)) {
      bulletItems.push(trimmed.replace(/^(?:•|[-*])\s+/, ""));
      return;
    }

    flushBullets();
    if (/^\d+[.)]\s+/.test(trimmed)) {
      nodes.push(<div className="assistant-numbered-line" key={`number-${index}`}>{trimmed}</div>);
    } else {
      nodes.push(<p key={`paragraph-${index}`}>{trimmed}</p>);
    }
  });

  flushBullets();
  return nodes;
}



function getAssistantStorageKey(userId) {
  return getUserStorageKey(STORAGE_KEYS.assistantChat, userId || "guest");
}

function readPersistedMessages(userId) {
  try {
    const key = getAssistantStorageKey(userId);
    const raw = key ? localStorage.getItem(key) : null;
    if (!raw) return [INITIAL_MESSAGE];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [INITIAL_MESSAGE];
    const validMessages = parsed
      .filter((message) => message && (message.role === "user" || message.role === "assistant"))
      .slice(-32)
      .map((message) => ({
        role: message.role,
        id: message.id,
        requestId: message.requestId,
        status: message.status,
        question: message.question,
        conversation: Array.isArray(message.conversation) ? message.conversation : undefined,
        text: String(message.text || ""),
        source: message.role === "assistant" ? (message.source || "garden-knowledge") : undefined,
      }))
      .filter((message) => message.text.trim() || message.status === "pending");
    return validMessages.length ? validMessages : [INITIAL_MESSAGE];
  } catch {
    return [INITIAL_MESSAGE];
  }
}
function persistMessages(userId, messages) {
  try {
    const key = getAssistantStorageKey(userId);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(messages.slice(-32)));
  } catch {
    // Chat persistence is best-effort; the current conversation remains in memory.
  }
}

function GardenAssistant({ onPageChange, userId }) {
  const [messages, setMessages] = useState(() => readPersistedMessages(userId));
  const [chatHydrated, setChatHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(readPersistedMessages(userId));
    setChatHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (!chatHydrated) return;
    persistMessages(userId, messages);
  }, [messages, userId, chatHydrated]);

  useEffect(() => {
    if (!chatHydrated) return;
    const pendingMessage = messages.find(
      (message) => message.role === "assistant" && message.status === "pending" && message.requestId && message.question,
    );
    if (!pendingMessage) return;

    const cachedEnvironment = readStoredEnvironment();
    const cachedPlants = getSavedPlants().filter(Boolean).slice(0, 20);
    const localFallback = () => getLocalAssistantAnswer(pendingMessage.question, {
      environment: cachedEnvironment,
      plantNames: cachedPlants.map((plant) => plant.name).filter(Boolean),
      plants: cachedPlants,
      conversation: Array.isArray(pendingMessage.conversation) ? pendingMessage.conversation : [],
      user: readStorage(STORAGE_KEYS.session, {}),
    });

    setIsTyping(true);
    startAssistantRequest({
      userId,
      requestId: pendingMessage.requestId,
      question: pendingMessage.question,
      conversation: pendingMessage.conversation || [],
      fallback: localFallback,
    }).then((result) => {
      setMessages((current) => current.map((message) => (
        message.requestId === pendingMessage.requestId && message.status === "pending"
          ? { role: "assistant", id: `assistant-${pendingMessage.requestId}`, text: result.answer, source: result.source }
          : message
      )));
    }).finally(() => setIsTyping(false));
  }, [chatHydrated, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendQuestion = async (questionText) => {
    const question = (questionText || input).trim();
    if (!question || isTyping) return;

    const instantGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)[!.?,\s]*$/i.test(question);
    const instantThanks = /^(thanks|thank you|thx)[!.?,\s]*$/i.test(question);
    if (instantGreeting || instantThanks) {
      setInput("");
      setMessages((current) => [
        ...current,
        { role: "user", id: `user-${Date.now()}`, text: question },
        {
          role: "assistant",
          id: `assistant-${Date.now()}`,
          text: instantThanks
            ? "You’re welcome! Tell me what you’re growing or what changed, and we’ll work through it together."
            : "Hi! I’m your Garden Guide assistant. Ask me about a plant, gardening problem, your garden setup, or a follow-up question.",
          source: "garden-knowledge",
        },
      ]);
      return;
    }

    if (!getAuthToken()) {
      setMessages((current) => [...current, { role: "user", id: `user-${Date.now()}`, text: question }, { role: "assistant", text: "Your session has expired. Please sign in again.", source: "garden-knowledge" }]);
      return;
    }

    const history = messages
      .slice(-10)
      .map((message) => ({ role: message.role, content: message.text }));
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const cachedEnvironment = readStoredEnvironment();
    const cachedPlants = getSavedPlants().filter(Boolean).slice(0, 20);
    const requestUser = { ...readStorage(STORAGE_KEYS.session, {}) };
    const localFallback = () => getLocalAssistantAnswer(question, {
      environment: cachedEnvironment,
      plantNames: cachedPlants.map((plant) => plant.name).filter(Boolean),
      plants: cachedPlants,
      conversation: history,
      user: requestUser,
    });

    setInput("");
    setIsTyping(true);
    setMessages((current) => [
      ...current,
      { role: "user", id: `user-${requestId}`, text: question },
      {
        role: "assistant",
        id: `assistant-${requestId}`,
        requestId,
        question,
        conversation: history,
        status: "pending",
        text: "Thinking…",
        source: "garden-knowledge",
      },
    ]);

    // Persist the pending request synchronously before the request starts so an
    // immediate page navigation cannot erase the request metadata.
    persistPendingMessage({ userId, requestId, question, conversation: history });

    try {
      const result = await startAssistantRequest({
        userId,
        requestId,
        question,
        conversation: history,
        fallback: localFallback,
      });
      setMessages((current) => current.map((message) => (
        message.requestId === requestId && message.status === "pending"
          ? { role: "assistant", id: `assistant-${requestId}`, text: result.answer, source: result.source }
          : message
      )));
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    messages
      .filter((message) => message.role === "assistant" && message.status === "pending" && message.requestId)
      .forEach((message) => cancelAssistantRequest(userId, message.requestId));
    const next = [INITIAL_MESSAGE];
    setIsTyping(false);
    setMessages(next);
    persistMessages(userId, next);
  };

  return (
    <main className="assistant-page">
      <PageHeaderBanner
        showBackButton={true}
        onPageChange={onPageChange}
        backFallbackPage="dashboard"
        eyebrow="GARDEN GUIDE ASSISTANT"
        title="Garden Assistant"
        titleAccent="🤖"
        subtitle="Ask about plants, watering, sunlight, soil, pests, diseases, pruning, propagation, or your own garden."
        badgeIcon="🌱"
        badgeTitle="Garden guidance"
        badgeSubtitle="AI provider when configured • reliable garden knowledge fallback"
      />

      <section className="assistant-chat-card" aria-label="Garden Assistant chat">
        <div className="assistant-status-bar">
          <div className="bot-profile">
            <div className="bot-avatar">🌱</div>
            <div>
              <div className="bot-name">Garden Guide</div>
              <div className="bot-online-badge">
                <span className="status-pulse-dot healthy"></span>
                <span>Garden AI · uses your saved garden when available</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="clear-chat-btn"
            onClick={clearChat}
            title="Clear this conversation"
          >
            Clear
          </button>
        </div>

        <div className="assistant-messages-list" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`message-row ${message.role}`}>
              {message.role === "assistant" && (
                <div className="msg-avatar assistant">🤖</div>
              )}

              <div>
                <div className={`message-bubble ${message.role}`}>
                  {message.role === "assistant" ? renderAssistantText(message.text) : message.text}
                </div>
                {message.role === "assistant" && (
                  <span className={`assistant-source ${message.source === "ai" ? "ai" : ""}`}>
                    {message.source === "ai" ? "AI garden coach" : "Garden Guide knowledge"}
                  </span>
                )}
              </div>

              {message.role === "user" && (
                <div className="msg-avatar user">🧑‍🌾</div>
              )}
            </div>
          ))}

          {isTyping && !messages.some((message) => message.role === "assistant" && message.status === "pending") && (
            <div className="message-row assistant">
              <div className="msg-avatar assistant">🤖</div>
              <div className="message-bubble assistant typing-bubble">
                <div className="typing-dots" aria-label="Assistant is typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="quick-prompts-bar" aria-label="Suggested questions">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="quick-prompt-chip"
              onClick={() => sendQuestion(prompt)}
              disabled={isTyping}
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          className="assistant-input-area"
          onSubmit={(event) => {
            event.preventDefault();
            sendQuestion();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Garden AI anything about your garden…"
            aria-label="Ask Garden Assistant"
            disabled={isTyping}
          />
          <button
            type="submit"
            className="assistant-send-btn"
            disabled={!input.trim() || isTyping}
          >
            <span>{isTyping ? "Thinking…" : "Send"}</span>
            <span aria-hidden="true">➤</span>
          </button>
        </form>
      </section>
    </main>
  );
}

export default GardenAssistant;
