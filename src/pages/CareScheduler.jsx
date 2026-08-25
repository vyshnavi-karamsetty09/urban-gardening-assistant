import { useEffect, useState } from "react";
import { getSavedTasks, saveTasks } from "../utils";
import "./SimpleTools.css";

function CareScheduler() {
  const [tasks, setTasks] = useState(() => getSavedTasks());
  useEffect(() => saveTasks(tasks), [tasks]);
  const toggle = (id) => setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  const addTask = () => setTasks((current) => [...current, { id: Date.now(), title: "Check plant moisture", description: "Feel the top layer of soil before watering.", time: "6:00 PM", completed: false, type: "water" }]);
  return <main className="tool-page"><header className="tool-header"><div><p className="tool-eyebrow">DAILY CARE</p><h1>Care Scheduler ✓</h1><p>Keep watering, feeding and pruning tasks in one simple checklist.</p></div><button className="tool-primary" onClick={addTask}>+ Add Task</button></header><section className="tool-card"><div className="tool-card-head"><div><h2>Today's care plan</h2><p>{tasks.filter(t => !t.completed).length} pending task(s)</p></div></div><div className="scheduler-list">{tasks.map(task => <label className={`scheduler-item ${task.completed ? "done" : ""}`} key={task.id}><input type="checkbox" checked={task.completed} onChange={() => toggle(task.id)} /><span className="scheduler-icon">{task.type === "water" ? "💧" : task.type === "fertilizer" ? "🌱" : "✂"}</span><span><strong>{task.title}</strong><small>{task.description}</small></span><time>{task.time}</time></label>)}</div></section></main>;
}
export default CareScheduler;
