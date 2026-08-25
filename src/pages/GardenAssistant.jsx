import { useState } from "react";
import "./SimpleTools.css";

const answers = {
  water: "Water when the top layer of soil feels dry. Morning is usually a good time because leaves have time to dry.",
  sunlight: "Most edible plants need several hours of direct light, while plants such as Snake Plant and many indoor foliage plants tolerate lower light.",
  soil: "Use a well-draining mix. For containers, combine quality potting mix with material that improves drainage rather than using heavy garden soil alone.",
  fertilizer: "Follow the fertilizer label and avoid overfeeding. During active growth, a balanced fertilizer at the recommended dilution is usually safer than frequent strong doses.",
};

function GardenAssistant() {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi! Ask me about watering, sunlight, soil or fertilizer." }]);
  const [input, setInput] = useState("");
  const send = () => {
    const question = input.trim();
    if (!question) return;
    const lower = question.toLowerCase();
    const key = Object.keys(answers).find((item) => lower.includes(item));
    const answer = key ? answers[key] : "For a more specific answer, tell me the plant name and what you are observing (watering, sunlight, soil, pests or leaves).";
    setMessages((current) => [...current, { role: "user", text: question }, { role: "assistant", text: answer }]);
    setInput("");
  };
  return <main className="tool-page"><header className="tool-header"><div><p className="tool-eyebrow">GARDEN HELP</p><h1>Garden Assistant 🤖</h1><p>A lightweight offline gardening helper for common care questions.</p></div></header><section className="assistant-card"><div className="assistant-messages">{messages.map((message, index) => <div key={index} className={`assistant-message ${message.role}`}>{message.text}</div>)}</div><div className="assistant-input"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="e.g. How often should I water mint?"/><button className="tool-primary" onClick={send}>Send</button></div><div className="quick-prompts">{["How often should I water?", "How much sunlight?", "What soil should I use?"].map(prompt => <button key={prompt} onClick={() => setInput(prompt)}>{prompt}</button>)}</div></section></main>;
}
export default GardenAssistant;
