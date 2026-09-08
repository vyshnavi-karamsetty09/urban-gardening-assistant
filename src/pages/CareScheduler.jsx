import { useEffect, useState } from "react";
import { getSavedTasks, saveTasks, getSavedPlants, generateTasksFromPlants, defaultTasks } from "../utils";
import { getPlantImage } from "../plantData";
import PageHeaderBanner from "../components/PageHeaderBanner";
import "./CareScheduler.css";

const DAYS_OF_WEEK = [
  { key: "Mon", name: "Monday", icon: "🌱" },
  { key: "Tue", name: "Tuesday", icon: "💧" },
  { key: "Wed", name: "Wednesday", icon: "🌿" },
  { key: "Thu", name: "Thursday", icon: "✂️" },
  { key: "Fri", name: "Friday", icon: "🌸" },
  { key: "Sat", name: "Saturday", icon: "🍃" },
  { key: "Sun", name: "Sunday", icon: "☀️" },
];

const TASK_PRESETS = [
  {
    label: "💧 Deep Root Watering",
    type: "water",
    title: "Deep Root Watering",
    time: "07:30 AM",
    priority: "High",
    frequency: "Daily (Morning)",
    why: "Supplies essential hydration directly to deep root tips while preventing wet foliage diseases.",
    how: [
      "Check top 2 inches of soil: if dry, water deeply.",
      "Pour water slowly near root zone until drainage occurs.",
      "Avoid splashing mud onto lower foliage."
    ],
    tools: "Narrow-spout watering can",
    weatherNote: "Perform early morning before high sun causes rapid evaporation."
  },
  {
    label: "🌱 Organic Compost Feed",
    type: "fertilizer",
    title: "Organic Compost Top-Dress",
    time: "10:00 AM",
    priority: "Medium",
    frequency: "Every 2 Weeks",
    why: "Replenishes depleted micro-nutrients and boosts soil microbial activity naturally.",
    how: [
      "Lightly aerate topsoil with a hand cultivator.",
      "Distribute 2 tablespoons of vermicompost around the drip line.",
      "Water immediately to dissolve nutrients into the root zone."
    ],
    tools: "Hand trowel, vermicompost",
    weatherNote: "Feed on overcast days or in the early morning."
  },
  {
    label: "✂️ Herb Shoot Pinching",
    type: "prune",
    title: "Herb Apical Shoot Pinching",
    time: "04:30 PM",
    priority: "Medium",
    frequency: "Weekly",
    why: "Halts apical dominance to stimulate dense lateral branching and doubled leaf yield.",
    how: [
      "Find top central growing tip above the next leaf node pair.",
      "Pinch off the top tip cleanly with fingernails or snips.",
      "Reserve snipped leaves for fresh culinary use."
    ],
    tools: "Clean fingernails or precision snips",
    weatherNote: "Perform in late afternoon."
  },
  {
    label: "🌿 Organic Neem Foliar Mist",
    type: "prune",
    title: "Neem Oil Pest Barrier Spray",
    time: "05:30 PM",
    priority: "High",
    frequency: "Weekly",
    why: "Disrupts pest feeding and egg-laying cycles for aphids, spider mites, and whiteflies.",
    how: [
      "Mix 5ml pure cold-pressed neem oil + 2 drops mild soap into 1L warm water.",
      "Shake vigorously to create a milky emulsion.",
      "Spray undersides of leaves thoroughly until runoff."
    ],
    tools: "Fine mist trigger sprayer, cold-pressed neem oil",
    weatherNote: "Apply strictly at dusk/sunset to prevent sunlight leaf scorching."
  },
  {
    label: "🪣 Skewer Soil Check",
    type: "moisture",
    title: "Root Zone Moisture Test",
    time: "05:00 PM",
    priority: "Low",
    frequency: "Every 5–7 Days",
    why: "Prevents accidental overwatering and deadly anaerobic root rot.",
    how: [
      "Insert a dry wooden chopstick 3–4 inches deep into the container.",
      "Withdraw and inspect: if dark soil clings, roots still have ample moisture.",
      "If clean and dry, prepare to water thoroughly next morning."
    ],
    tools: "Wooden skewer or probe",
    weatherNote: "Ensure pots have unobstructed drainage holes."
  }
];

function CareScheduler() {
  const [tasks, setTasks] = useState(() => getSavedTasks());
  const [activeTab, setActiveTab] = useState("checklist");
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [gardenPlants, setGardenPlants] = useState([]);

  const [newTask, setNewTask] = useState({
    title: "",
    plantName: "",
    type: "water",
    time: "08:00 AM",
    priority: "Medium",
    frequency: "Daily",
    description: "",
    why: "",
    howText: "",
    tools: "Watering can",
    weatherNote: "",
  });

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const plants = getSavedPlants();
    setGardenPlants(plants);
    if (plants.length > 0 && !newTask.plantName) {
      setNewTask((curr) => ({ ...curr, plantName: plants[0].name }));
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (e, id) => {
    e.stopPropagation();
    setTasks((current) => current.filter((task) => task.id !== id));
    showToast("Task removed from care schedule.");
  };

  const handleWaterAll = () => {
    let count = 0;
    setTasks((current) =>
      current.map((task) => {
        if (task.type === "water" && !task.completed) {
          count++;
          return { ...task, completed: true };
        }
        return task;
      })
    );
    showToast(count > 0 ? `💧 Completed all ${count} due watering tasks!` : "All watering tasks were already completed!");
  };

  const handleSyncWithGarden = () => {
    const plants = getSavedPlants();
    if (!plants || plants.length === 0) {
      showToast("No plants in your garden yet! Head to My Garden to add some.");
      return;
    }
    const synced = generateTasksFromPlants(plants);
    setTasks(synced);
    showToast(`🌿 Calibrated care routine generated for ${plants.length} plants in your garden!`);
  };

  const handleResetDefaults = () => {
    setTasks(defaultTasks);
    showToast("Reset to standard botanical care tasks.");
  };

  const applyPreset = (preset) => {
    setNewTask((curr) => ({
      ...curr,
      type: preset.type,
      title: `${preset.title} for ${curr.plantName || "Plant"}`,
      time: preset.time,
      priority: preset.priority,
      frequency: preset.frequency,
      description: preset.why,
      why: preset.why,
      howText: preset.how.join("\n"),
      tools: preset.tools,
      weatherNote: preset.weatherNote,
    }));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const plantObj = gardenPlants.find((p) => p.name === newTask.plantName);
    const howArray = newTask.howText
      ? newTask.howText.split("\n").filter((l) => l.trim().length > 0)
      : ["Inspect plant health and execute task steadily.", "Verify soil moisture balance."];

    const task = {
      id: Date.now(),
      title: newTask.title.trim(),
      plantName: newTask.plantName || "Garden Plant",
      plantType: plantObj ? plantObj.type : "General",
      plantEmoji: plantObj ? plantObj.emoji : "🌱",
      plantImage: plantObj ? plantObj.image : getPlantImage(newTask.plantName || "Tomato"),
      description: newTask.description.trim() || newTask.why.trim() || "Regular garden care routine.",
      type: newTask.type,
      time: newTask.time || "08:00 AM",
      priority: newTask.priority || "Medium",
      frequency: newTask.frequency || "Daily",
      why: newTask.why.trim() || "Regular botanical care strengthens root defense and lush growth.",
      how: howArray,
      tools: newTask.tools.trim() || "Standard garden tools",
      weatherNote: newTask.weatherNote.trim() || "Perform during calm morning or late evening.",
      completed: false,
      icon: newTask.type === "water" ? "💧" : newTask.type === "fertilizer" ? "🌱" : newTask.type === "moisture" ? "🪣" : "✂️",
    };

    setTasks((current) => [task, ...current]);
    setIsModalOpen(false);
    showToast(`Added new task: "${task.title}"`);
    setNewTask({
      title: "",
      plantName: gardenPlants[0]?.name || "",
      type: "water",
      time: "08:00 AM",
      priority: "Medium",
      frequency: "Daily",
      description: "",
      why: "",
      howText: "",
      tools: "Watering can",
      weatherNote: "",
    });
  };

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 100;

  const filteredTasks = tasks.filter((task) => {
    if (filter !== "all" && task.type !== filter) return false;
    if (statusFilter === "pending" && task.completed) return false;
    if (statusFilter === "done" && !task.completed) return false;
    return true;
  });

  return (
    <main className="scheduler-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="scheduler-toast animate-slide-down">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeaderBanner
        eyebrow="BOTANICAL CARE CADENCE & PROTOCOLS"
        title="Care Scheduler"
        titleAccent="✓"
        subtitle="Step-by-step guidance, optimal timing, and customized routines for every plant in your urban garden."
        badgeIcon="🗓️"
        badgeTitle={`${completedCount} of ${totalTasks} Completed`}
        badgeSubtitle={`${totalTasks - completedCount} pending actions • ${progressPercent}% accomplished`}
        extraRight={
          <div className="header-actions-group">
            <button
              type="button"
              className="sync-garden-btn hover-lift"
              onClick={handleSyncWithGarden}
              title="Automatically generate tailored care tasks for your plants in My Garden"
            >
              <span>🌿</span> Sync with My Garden
            </button>
            <button
              type="button"
              className="scheduler-add-btn btn-shimmer"
              onClick={() => setIsModalOpen(true)}
            >
              <span>➕</span> Add Care Task
            </button>
          </div>
        }
      />

      {/* View Mode Navigation Switcher */}
      <div className="scheduler-views-bar">
        <div className="views-switch-buttons">
          <button
            type="button"
            className={`view-switch-tab ${activeTab === "checklist" ? "active" : ""}`}
            onClick={() => setActiveTab("checklist")}
          >
            📋 Daily Care Checklist ({tasks.length})
          </button>
          <button
            type="button"
            className={`view-switch-tab ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            🗓️ 7-Day Care Forecast
          </button>
          <button
            type="button"
            className={`view-switch-tab ${activeTab === "guides" ? "active" : ""}`}
            onClick={() => setActiveTab("guides")}
          >
            📖 Botanical Care Guides 101
          </button>
        </div>

        <div className="views-quick-actions">
          <button
            type="button"
            className="quick-action-pill"
            onClick={handleWaterAll}
            title="Mark all due watering tasks as completed"
          >
            💧 Water All Due
          </button>
          <button
            type="button"
            className="quick-action-pill secondary"
            onClick={handleResetDefaults}
            title="Restore curated sample tasks"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* ================= VIEW 1: DAILY CHECKLIST ================= */}
      {activeTab === "checklist" && (
        <>
          {/* Progress Tracker Card */}
          <section className="scheduler-progress-card hover-lift">
            <div className="progress-card-top">
              <div className="progress-card-title">
                <strong>Today's Botanical Routine</strong>
                <span className="progress-card-badge">
                  {completedCount} of {totalTasks} Completed
                </span>
                {progressPercent === 100 && totalTasks > 0 && (
                  <span className="progress-done-badge">🎉 All tasks finished!</span>
                )}
              </div>
              <span className="progress-percentage">{progressPercent}%</span>
            </div>

            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="progress-status-summary">
              <span>💧 <strong>{tasks.filter((t) => t.type === "water" && !t.completed).length}</strong> watering due</span>
              <span>🌱 <strong>{tasks.filter((t) => t.type === "fertilizer" && !t.completed).length}</strong> feedings due</span>
              <span>✂️ <strong>{tasks.filter((t) => t.type === "prune" && !t.completed).length}</strong> prunings due</span>
              <span>🪣 <strong>{tasks.filter((t) => t.type === "moisture" && !t.completed).length}</strong> soil tests due</span>
            </div>
          </section>

          {/* Category Filters Bar */}
          <div className="scheduler-filters-row">
            <nav className="scheduler-filters" aria-label="Task categories">
              <button
                type="button"
                className={`scheduler-filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All ({tasks.length})
              </button>
              <button
                type="button"
                className={`scheduler-filter-btn ${filter === "water" ? "active" : ""}`}
                onClick={() => setFilter("water")}
              >
                💧 Watering ({tasks.filter((t) => t.type === "water").length})
              </button>
              <button
                type="button"
                className={`scheduler-filter-btn ${filter === "fertilizer" ? "active" : ""}`}
                onClick={() => setFilter("fertilizer")}
              >
                🌱 Feeding ({tasks.filter((t) => t.type === "fertilizer").length})
              </button>
              <button
                type="button"
                className={`scheduler-filter-btn ${filter === "prune" ? "active" : ""}`}
                onClick={() => setFilter("prune")}
              >
                ✂️ Pruning & Pest ({tasks.filter((t) => t.type === "prune").length})
              </button>
              <button
                type="button"
                className={`scheduler-filter-btn ${filter === "moisture" ? "active" : ""}`}
                onClick={() => setFilter("moisture")}
              >
                🪣 Soil & Roots ({tasks.filter((t) => t.type === "moisture").length})
              </button>
            </nav>

            <div className="scheduler-status-toggle">
              <button
                type="button"
                className={`status-toggle-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All Status
              </button>
              <button
                type="button"
                className={`status-toggle-btn ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </button>
              <button
                type="button"
                className={`status-toggle-btn ${statusFilter === "done" ? "active" : ""}`}
                onClick={() => setStatusFilter("done")}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Detailed Task Cards List */}
          <section className="scheduler-tasks-card">
            {filteredTasks.length > 0 ? (
              <div className="scheduler-tasks-list">
                {filteredTasks.map((task, idx) => {
                  const isExpanded = expandedTaskId === task.id;
                  const priorityClass = (task.priority || "medium").toLowerCase();

                  return (
                    <article
                      key={task.id}
                      className={`task-understanding-card ${task.completed ? "done" : ""} animate-fade-in`}
                      style={{ animationDelay: `${(idx % 6) * 50}ms` }}
                    >
                      {/* Main Card Header Row */}
                      <div
                        className="task-card-main-bar"
                        onClick={() => toggleTask(task.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && toggleTask(task.id)}
                      >
                        <div className="task-checkbox-wrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="scheduler-checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            aria-label={`Mark task ${task.title} as completed`}
                          />
                        </div>

                        {/* Plant Thumbnail or Category Icon */}
                        <div className="task-plant-thumbnail">
                          {task.plantImage ? (
                            <img
                              src={task.plantImage}
                              alt={task.plantName || "Plant"}
                              className="thumbnail-img"
                              onError={(e) => {
                                e.target.style.display = "none";
                                if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`thumbnail-fallback ${task.type}`}
                            style={{ display: task.plantImage ? "none" : "flex" }}
                          >
                            <span>{task.plantEmoji || (task.type === "water" ? "💧" : task.type === "fertilizer" ? "🌱" : "✂️")}</span>
                          </div>
                        </div>

                        {/* Task Core Info */}
                        <div className="task-card-info">
                          <div className="task-plant-badge-row">
                            <span className="task-plant-name">
                              {task.plantEmoji} {task.plantName || "Garden Plant"}
                            </span>
                            {task.plantType && (
                              <span className="task-plant-type-pill">{task.plantType}</span>
                            )}
                            <span className={`task-priority-pill ${priorityClass}`}>
                              {task.priority || "Medium"} Priority
                            </span>
                            {task.frequency && (
                              <span className="task-frequency-pill">🔄 {task.frequency}</span>
                            )}
                          </div>

                          <h3 className="task-card-title">{task.title}</h3>
                          <p className="task-card-desc">{task.description}</p>
                        </div>

                        {/* Right Actions: Time & Guide Drawer Trigger */}
                        <div className="task-card-right-group" onClick={(e) => e.stopPropagation()}>
                          <span className="scheduler-task-time">⏰ {task.time}</span>

                          <button
                            type="button"
                            className={`task-drawer-toggle ${isExpanded ? "open" : ""}`}
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            title="Expand botanical step-by-step instructions"
                          >
                            <span>📖 How to do this</span>
                            <span className="toggle-arrow">{isExpanded ? "▲" : "▼"}</span>
                          </button>

                          <button
                            type="button"
                            className="scheduler-delete-btn"
                            onClick={(e) => deleteTask(e, task.id)}
                            title="Delete task"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Expandable Botanical Understanding Drawer */}
                      {isExpanded && (
                        <div className="task-drawer-content animate-slide-down">
                          <div className="drawer-grid">
                            {/* Why this matters */}
                            <div className="drawer-col drawer-why">
                              <h4>
                                <span className="col-icon">🔬</span> Why This Matters
                              </h4>
                              <p>{task.why || "Consistent care prevents stress and keeps root biology thriving."}</p>
                              {task.weatherNote && (
                                <div className="weather-tip-box">
                                  <span className="tip-icon">🌤️</span>
                                  <span><strong>Optimal Condition:</strong> {task.weatherNote}</span>
                                </div>
                              )}
                            </div>

                            {/* Step-by-Step Instructions */}
                            <div className="drawer-col drawer-steps">
                              <h4>
                                <span className="col-icon">📝</span> Step-by-Step Instructions
                              </h4>
                              {Array.isArray(task.how) && task.how.length > 0 ? (
                                <ol className="drawer-step-list">
                                  {task.how.map((step, sIdx) => (
                                    <li key={sIdx}>
                                      <span className="step-num">{sIdx + 1}</span>
                                      <span className="step-text">{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              ) : (
                                <p className="drawer-empty-step">Follow regular watering and plant feeding best practices.</p>
                              )}
                            </div>

                            {/* Tools & Details */}
                            <div className="drawer-col drawer-tools">
                              <h4>
                                <span className="col-icon">🛠️</span> Tools & Tips
                              </h4>
                              <div className="tools-tag-list">
                                {task.tools ? (
                                  task.tools.split(",").map((tool, tIdx) => (
                                    <span key={tIdx} className="tool-tag">
                                      🔧 {tool.trim()}
                                    </span>
                                  ))
                                ) : (
                                  <span className="tool-tag">Standard garden tools</span>
                                )}
                              </div>

                              <div className="drawer-action-row">
                                <button
                                  type="button"
                                  className={`drawer-done-btn ${task.completed ? "btn-undo" : "btn-complete"}`}
                                  onClick={() => toggleTask(task.id)}
                                >
                                  {task.completed ? "↩ Mark as Incomplete" : "✓ Mark Done"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="scheduler-empty">
                <span>🌿</span>
                <h3>No tasks match your current filter</h3>
                <p>Everything in this category is currently completed or clear. Click below to add a new task or sync from your garden!</p>
                <div className="empty-actions">
                  <button
                    type="button"
                    className="empty-sync-btn"
                    onClick={handleSyncWithGarden}
                  >
                    🌿 Sync Schedule from My Garden
                  </button>
                  <button
                    type="button"
                    className="empty-add-btn"
                    onClick={() => setIsModalOpen(true)}
                  >
                    ➕ Add Custom Task
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* ================= VIEW 2: 7-DAY CALENDAR ================= */}
      {activeTab === "calendar" && (
        <section className="weekly-calendar-section animate-fade-in">
          <div className="calendar-header-box">
            <div>
              <h3>Weekly Urban Care Forecast</h3>
              <p>Predictive care schedule to keep your garden thriving all 7 days.</p>
            </div>
            <div className="calendar-legend">
              <span><span className="legend-dot water"></span> 💧 Watering</span>
              <span><span className="legend-dot fertilizer"></span> 🌱 Feeding</span>
              <span><span className="legend-dot prune"></span> ✂️ Pruning</span>
              <span><span className="legend-dot moisture"></span> 🪣 Soil Check</span>
            </div>
          </div>

          <div className="weekly-timeline-grid">
            {DAYS_OF_WEEK.map((day, idx) => {
              const isToday = idx === 0;
              const dayTasks = tasks.filter((t) => {
                if (t.type === "water") return true;
                if (t.type === "fertilizer") return idx === 2 || idx === 5;
                if (t.type === "prune") return idx === 1 || idx === 4;
                return idx === 3 || idx === 6;
              });

              return (
                <div key={day.key} className={`calendar-day-col ${isToday ? "today" : ""}`}>
                  <div className="day-col-header">
                    <span className="day-name">{day.name}</span>
                    <span className="day-badge">{isToday ? "TODAY" : day.icon}</span>
                  </div>

                  <div className="day-col-count">
                    <strong>{dayTasks.length}</strong> tasks scheduled
                  </div>

                  <div className="day-task-items">
                    {dayTasks.slice(0, 4).map((dt) => (
                      <div key={dt.id} className={`mini-task-pill ${dt.type}`}>
                        <span className="mini-icon">
                          {dt.type === "water" ? "💧" : dt.type === "fertilizer" ? "🌱" : dt.type === "moisture" ? "🪣" : "✂️"}
                        </span>
                        <span className="mini-title" title={dt.title}>
                          {dt.plantName ? `${dt.plantName}: ` : ""}{dt.title}
                        </span>
                      </div>
                    ))}
                    {dayTasks.length > 4 && (
                      <div className="mini-task-more">+{dayTasks.length - 4} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= VIEW 3: BOTANICAL GUIDES 101 ================= */}
      {activeTab === "guides" && (
        <section className="botanical-guides-section animate-fade-in">
          <div className="guides-hero">
            <h3>Botanical Care Fundamentals</h3>
            <p>Master the science of urban gardening with practical, research-backed guidelines.</p>
          </div>

          <div className="guides-grid">
            <article className="guide-card">
              <div className="guide-card-icon">💧</div>
              <h4>Watering Masterclass</h4>
              <span className="guide-subtitle">The 2-Inch Knuckle Test & Root Health</span>
              <p>
                Most container plants fail due to <strong>overwatering</strong>, not underwatering. Before pouring water:
              </p>
              <ul>
                <li>Insert your index finger 2 inches into the soil. If it feels cool and moist, do NOT water.</li>
                <li>Always water early in the morning so sun evaporates accidental leaf drops, stopping powdery mildew.</li>
                <li>Water until liquid drains from bottom holes to ensure the deep root ball is fully saturated.</li>
              </ul>
              <div className="guide-badge">Rule: Deep & Infrequent &gt; Shallow & Daily</div>
            </article>

            <article className="guide-card">
              <div className="guide-card-icon">🌱</div>
              <h4>Organic Feeding & N-P-K</h4>
              <span className="guide-subtitle">Nourishing Container Soil Naturally</span>
              <p>
                In pots, nutrients leach out with drainage. Maintain a fertile root ecosystem:
              </p>
              <ul>
                <li><strong>Nitrogen (N):</strong> Fuels lush, green leaves. Vital for mint, spinach, and curry leaves.</li>
                <li><strong>Phosphorus (P):</strong> Stimulates root growth and prolific flower/fruit sets for tomatoes and roses.</li>
                <li><strong>Potassium (K):</strong> Strengthens overall disease resistance and water stress tolerance.</li>
              </ul>
              <div className="guide-badge">Top Tip: Feed only when soil is already damp</div>
            </article>

            <article className="guide-card">
              <div className="guide-card-icon">✂️</div>
              <h4>Pruning & Herb Pinching</h4>
              <span className="guide-subtitle">Unlocking Double Yields Through Apical Cuts</span>
              <p>
                Pruning isn't just about shaping; it directs hormonal energy towards productive growth:
              </p>
              <ul>
                <li><strong>Deadheading:</strong> Snip spent flowers just above a 5-leaflet outward node on roses to trigger new buds.</li>
                <li><strong>Pinching:</strong> Snip the central top shoots of basil and mint to trigger bushy double branches.</li>
                <li>Always wipe shears with alcohol between plants to prevent bacterial transfer.</li>
              </ul>
              <div className="guide-badge">Pro Tip: 45° angle cut slanting away from bud</div>
            </article>

            <article className="guide-card">
              <div className="guide-card-icon">🛡️</div>
              <h4>Organic Pest & Disease Defense</h4>
              <span className="guide-subtitle">Eco-Friendly Solutions for Healthy Balconies</span>
              <p>
                Prevent infestations naturally without synthetic chemical residues:
              </p>
              <ul>
                <li><strong>Neem Oil Emulsion:</strong> 5ml cold-pressed neem + 2 drops mild soap in 1L warm water. Spray at dusk.</li>
                <li><strong>Aphid Management:</strong> Blast undersides of leaves with a sharp water jet in early morning.</li>
                <li><strong>Companion Planting:</strong> Marigolds repel nematodes and mask tomato aroma from whiteflies.</li>
              </ul>
              <div className="guide-badge">Safety: Never spray neem in direct midday sun</div>
            </article>
          </div>
        </section>
      )}

      {/* ================= ADD TASK MODAL ================= */}
      {isModalOpen && (
        <div className="modal-backdrop-blur" onClick={() => setIsModalOpen(false)}>
          <div className="scheduler-modal modal-spring" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h2>Add New Care Task</h2>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="modal-subtext">
              Create an educational task with actionable instructions, dosage, and timing.
            </p>

            {/* Quick Presets */}
            <div className="modal-presets-section">
              <span className="presets-title">⚡ Quick Templates (Click to auto-fill):</span>
              <div className="presets-pill-list">
                {TASK_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    className="preset-btn"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="modal-form">
              <div className="modal-grid-2">
                <div className="modal-field">
                  <label htmlFor="task-plant">Target Plant *</label>
                  <select
                    id="task-plant"
                    value={newTask.plantName}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setNewTask({
                        ...newTask,
                        plantName: selected,
                        title: newTask.title || `Care routine for ${selected}`,
                      });
                    }}
                  >
                    {gardenPlants.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.emoji} {p.name} ({p.type})
                      </option>
                    ))}
                    <option value="General Garden">🌿 General Garden</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label htmlFor="task-type">Task Category *</label>
                  <select
                    id="task-type"
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                  >
                    <option value="water">💧 Deep Root Watering</option>
                    <option value="fertilizer">🌱 Organic Fertilizing</option>
                    <option value="prune">✂️ Pruning & Deadheading</option>
                    <option value="moisture">🪣 Soil Moisture & Roots</option>
                  </select>
                </div>
              </div>

              <div className="modal-field">
                <label htmlFor="task-title">Task Title *</label>
                <input
                  id="task-title"
                  type="text"
                  required
                  placeholder="e.g. Deep Root Watering for Tomato"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="modal-grid-3">
                <div className="modal-field">
                  <label htmlFor="task-time">Time</label>
                  <input
                    id="task-time"
                    type="text"
                    placeholder="e.g. 07:30 AM"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label htmlFor="task-frequency">Frequency</label>
                  <input
                    id="task-frequency"
                    type="text"
                    placeholder="e.g. Daily / Weekly"
                    value={newTask.frequency}
                    onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-field">
                <label htmlFor="task-why">Why is this task needed? (Botanical reason)</label>
                <input
                  id="task-why"
                  type="text"
                  placeholder="e.g. Prevents blossom-end rot and fruit splitting under hot afternoon sun."
                  value={newTask.why}
                  onChange={(e) => setNewTask({ ...newTask, why: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label htmlFor="task-how">Step-by-Step Instructions (One step per line)</label>
                <textarea
                  id="task-how"
                  rows="3"
                  placeholder="1. Check top 2 inches of soil with finger.&#10;2. Pour 400ml at stem base.&#10;3. Keep foliage dry to avoid leaf spot."
                  value={newTask.howText}
                  onChange={(e) => setNewTask({ ...newTask, howText: e.target.value })}
                />
              </div>

              <div className="modal-grid-2">
                <div className="modal-field">
                  <label htmlFor="task-tools">Tools Needed</label>
                  <input
                    id="task-tools"
                    type="text"
                    placeholder="e.g. Narrow-spout watering can, shears"
                    value={newTask.tools}
                    onChange={(e) => setNewTask({ ...newTask, tools: e.target.value })}
                  />
                </div>

                <div className="modal-field">
                  <label htmlFor="task-weather">Weather / Timing Note</label>
                  <input
                    id="task-weather"
                    type="text"
                    placeholder="e.g. Perform before 9:00 AM"
                    value={newTask.weatherNote}
                    onChange={(e) => setNewTask({ ...newTask, weatherNote: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default CareScheduler;

