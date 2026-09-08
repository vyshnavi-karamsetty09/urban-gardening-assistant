import { useState, useRef, useEffect } from "react";
import PageHeaderBanner from "../components/PageHeaderBanner";
import "./GardenAssistant.css";

const answers = {
  water: "💧 Watering rule of thumb: Check the top 1-2 inches of soil before watering. If dry, water deeply at the base until drainage holes drip slightly. Morning watering is best so excess leaf moisture dries during the day!",
  sunlight: "☀️ Sunlight guide: Herbs, tomatoes, and fruiting plants crave 6+ hours of direct sun. Indoor foliage like Snake Plants, ZZ Plants, and Pothos thrive in medium to low indirect light.",
  soil: "🌱 Healthy soil secret: Use a light, well-aerated potting mix containing perlite, coco coir, and vermiculite rather than heavy garden clay. Ensure your container has open drainage holes.",
  fertilizer: "🌿 Feeding tips: Feed with organic compost tea or seaweed liquid fertilizer every 2-3 weeks during spring and summer. Never fertilize dry soil—water first to avoid root burn!",
  disease: "🔍 Plant health advice: Spotting yellowing or mold? Check for proper airflow and avoid wet foliage overnight. You can also run our AI Leaf Scanner from the sidebar for instant organic treatment steps!",
  pest: "🐛 Pest defense: Wipe leaves with a mild neem oil solution (5ml neem + 1 tsp castile soap per liter of water) every 4-5 days to clear spider mites, aphids, and whiteflies naturally.",
};

function GardenAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello, gardener! 🌿 I am your AI Garden Assistant. Ask me anything about watering schedules, sunlight needs, soil, pest solutions, or plant care.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendQuestion = (questionText) => {
    const question = (questionText || input).trim();
    if (!question) return;

    // Add user message
    setMessages((current) => [...current, { role: "user", text: question }]);
    setInput("");
    setIsTyping(true);

    // Simulate thinking delay with realistic response
    setTimeout(() => {
      const lower = question.toLowerCase();
      const key = Object.keys(answers).find((item) => lower.includes(item));
      const answer = key
        ? answers[key]
        : `Great question about "${question}"! For best results, inspect your plant's soil moisture, daily sunlight exposure, and drainage. Feel free to ask specifically about watering, sunlight, soil, fertilizer, or pests!`;

      setMessages((current) => [
        ...current,
        { role: "assistant", text: answer },
      ]);
      setIsTyping(false);
    }, 650);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        text: "Chat cleared! How can I help you with your garden today? 🌿",
      },
    ]);
  };

  const quickPrompts = [
    "💧 How often should I water mint?",
    "☀️ Low-light indoor plants?",
    "🌱 Best potting mix for containers?",
    "🌿 When should I fertilize?",
    "🐛 How to get rid of aphids naturally?",
  ];

  return (
    <main className="assistant-page">
      {/* Header */}
      <PageHeaderBanner
        eyebrow="AI BOTANICAL ADVISOR & CHATBOT"
        title="Garden Assistant"
        titleAccent="🤖"
        subtitle="Get instant expert guidance for your balcony, terrace, and indoor plants anytime."
        badgeIcon="🌱"
        badgeTitle="GreenGuide AI Online"
        badgeSubtitle="Knowledgebase Active • Instant Help"
      />

      {/* Chat Card */}
      <section className="assistant-chat-card">
        {/* Status Bar */}
        <div className="assistant-status-bar">
          <div className="bot-profile">
            <div className="bot-avatar">🌱</div>
            <div>
              <div className="bot-name">GreenGuide AI</div>
              <div className="bot-online-badge">
                <span className="status-pulse-dot healthy"></span>
                <span>Active & Ready to help</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="clear-chat-btn"
            onClick={clearChat}
            title="Clear chat history"
          >
            Clear Conversation
          </button>
        </div>

        {/* Messages list */}
        <div className="assistant-messages-list">
          {messages.map((message, index) => (
            <div key={index} className={`message-row ${message.role}`}>
              {message.role === "assistant" && (
                <div className="msg-avatar assistant">🤖</div>
              )}
              <div className={`message-bubble ${message.role}`}>
                {message.text}
              </div>
              {message.role === "user" && (
                <div className="msg-avatar user">🧑‍🌾</div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="message-row assistant">
              <div className="msg-avatar assistant">🤖</div>
              <div className="message-bubble assistant">
                <div className="typing-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="quick-prompts-bar">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="quick-prompt-chip"
              onClick={() => sendQuestion(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="assistant-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
            placeholder="Ask a question (e.g. Why are my tomato leaves turning yellow?)..."
          />
          <button
            type="button"
            className="assistant-send-btn btn-shimmer"
            onClick={() => sendQuestion()}
          >
            <span>Send</span>
            <span>➤</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default GardenAssistant;
