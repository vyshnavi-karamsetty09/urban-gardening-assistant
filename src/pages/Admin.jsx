import { useEffect, useMemo, useState } from "react";
import PageHeaderBanner from "../components/PageHeaderBanner";
import { adminApi, getAuthToken } from "../api";
import { readStorage, STORAGE_KEYS } from "../utils";
import "./Admin.css";

const EMPTY_PLANT = {
  name: "",
  botanicalName: "",
  category: "Herbs",
  difficulty: "Easy",
  sunlight: "4–6 hrs",
  water: "Moderate",
  wateringNeed: "Moderate",
  temp: "20–30°C",
  soil: "Well-draining",
  growthTime: "60 days",
  description: "",
  careTips: "",
  emoji: "🌱",
  imageUrl: "",
  spaces: ["Small", "Medium"],
  climates: ["Tropical", "Subtropical"],
};

function readSession() {
  return readStorage(STORAGE_KEYS.session, null);
}

function Admin({ onPageChange }) {
  const session = readSession();
  const [users, setUsers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [plantForm, setPlantForm] = useState(EMPTY_PLANT);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    window.setTimeout(() => setMessage(null), 3200);
  };

  const loadAdminData = async () => {
    if (!getAuthToken()) return;
    setLoading(true);
    try {
      const [usersResult, plantsResult, reportsResult] = await Promise.all([
        adminApi.users(),
        adminApi.plants(),
        adminApi.reports(),
      ]);
      setUsers(usersResult.users || []);
      setPlants(plantsResult.plants || []);
      setReports(reportsResult.reports || []);
    } catch (error) {
      showMessage(error.message || "Unable to load admin data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredPlants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return plants;
    return plants.filter((plant) =>
      [plant.name, plant.botanicalName, plant.category, plant.climates?.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [plants, search]);

  const handlePlantField = (field, value) => {
    setPlantForm((current) => ({ ...current, [field]: value }));
  };

  const beginEdit = (plant) => {
    setEditingId(plant._id);
    setPlantForm({
      ...EMPTY_PLANT,
      ...plant,
      spaces: Array.isArray(plant.spaces) ? plant.spaces : EMPTY_PLANT.spaces,
      climates: Array.isArray(plant.climates) ? plant.climates : EMPTY_PLANT.climates,
    });
    setActiveTab("plants");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetPlantForm = () => {
    setEditingId(null);
    setPlantForm(EMPTY_PLANT);
  };

  const savePlant = async (event) => {
    event.preventDefault();
    if (!plantForm.name.trim()) {
      showMessage("Plant name is required.", "error");
      return;
    }

    const payload = {
      ...plantForm,
      name: plantForm.name.trim(),
      botanicalName: plantForm.botanicalName.trim(),
      description: plantForm.description.trim(),
      careTips: plantForm.careTips.trim(),
      spaces: Array.isArray(plantForm.spaces) ? plantForm.spaces : ["Small", "Medium"],
      climates: Array.isArray(plantForm.climates) ? plantForm.climates : ["Tropical"],
    };

    try {
      if (editingId) {
        const result = await adminApi.updatePlant(editingId, payload);
        setPlants((current) => current.map((plant) => (plant._id === editingId ? result.plant : plant)));
        showMessage("Plant updated successfully.");
      } else {
        const result = await adminApi.createPlant(payload);
        setPlants((current) => [result.plant, ...current]);
        showMessage("Plant added successfully.");
      }
      resetPlantForm();
    } catch (error) {
      showMessage(error.message || "Unable to save plant.", "error");
    }
  };

  const deletePlant = async (plant) => {
    if (!window.confirm(`Delete ${plant.name} from the plant catalog?`)) return;
    try {
      await adminApi.deletePlant(plant._id);
      setPlants((current) => current.filter((item) => item._id !== plant._id));
      if (editingId === plant._id) resetPlantForm();
      showMessage(`${plant.name} was removed from the catalog.`);
    } catch (error) {
      showMessage(error.message || "Unable to delete plant.", "error");
    }
  };

  if (session?.role !== "admin") {
    return (
      <main className="admin-page">
        <PageHeaderBanner
          showBackButton={true}
          onPageChange={onPageChange}
          backFallbackPage="dashboard"
          eyebrow="ADMINISTRATION"
          title="Admin Console"
          titleAccent="🛠️"
          subtitle="This area is restricted to administrator accounts."
          badgeIcon="🔒"
          badgeTitle="Access Restricted"
          badgeSubtitle="Administrator role required"
        />
        <section className="admin-empty-state">
          <div className="admin-empty-icon">🔒</div>
          <h2>Administrator access required</h2>
          <p>Sign in with an administrator account to manage the Garden Guide catalog and reports.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <PageHeaderBanner
        showBackButton={true}
        onPageChange={onPageChange}
        backFallbackPage="dashboard"
        eyebrow="ADMINISTRATION"
        title="Admin Console"
        titleAccent="🛠️"
        subtitle="Manage the botanical catalog, review registered users, and inspect saved plant-health reports."
        badgeIcon="✓"
        badgeTitle="Admin Access"
        badgeSubtitle={`${users.length} users • ${plants.length} plants`}
      />

      {message && <div className={`admin-toast ${message.type}`}>{message.text}</div>}

      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        {[
          ["overview", "Overview"],
          ["plants", "Plant Catalog"],
          ["users", "Users"],
          ["reports", "Disease Reports"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            className={`admin-tab ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <section className="admin-loading-card">Loading admin data…</section>
      ) : activeTab === "overview" ? (
        <section className="admin-overview-grid">
          <article className="admin-stat-card">
            <span className="admin-stat-icon">👥</span>
            <div><small>Registered Users</small><strong>{users.length}</strong></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon">🌱</span>
            <div><small>Catalog Plants</small><strong>{plants.length}</strong></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon">🔬</span>
            <div><small>Disease Reports</small><strong>{reports.length}</strong></div>
          </article>
          <article className="admin-stat-card">
            <span className="admin-stat-icon">🛡️</span>
            <div><small>Signed-in Role</small><strong>Administrator</strong></div>
          </article>

          <div className="admin-panel-wide">
            <div className="admin-panel-heading">
              <div>
                <h2>Admin overview</h2>
                <p>These figures come from MongoDB-backed admin endpoints.</p>
              </div>
              <button type="button" className="admin-refresh-btn" onClick={loadAdminData}>↻ Refresh</button>
            </div>
            <div className="admin-quick-grid">
              <button type="button" onClick={() => setActiveTab("plants")}>🌿 Manage plants <span>→</span></button>
              <button type="button" onClick={() => setActiveTab("users")}>👤 Review users <span>→</span></button>
              <button type="button" onClick={() => setActiveTab("reports")}>🔬 Review reports <span>→</span></button>
            </div>
          </div>
        </section>
      ) : activeTab === "plants" ? (
        <section className="admin-plants-layout">
          <form className="admin-form-card" onSubmit={savePlant}>
            <div className="admin-panel-heading">
              <div>
                <h2>{editingId ? "Edit plant" : "Add plant"}</h2>
                <p>Maintain the catalog used by Plant Library and recommendations.</p>
              </div>
              {editingId && <button type="button" className="admin-ghost-btn" onClick={resetPlantForm}>Cancel</button>}
            </div>
            <label>Plant name<input value={plantForm.name} onChange={(e) => handlePlantField("name", e.target.value)} placeholder="e.g. Basil" /></label>
            <label>Botanical name<input value={plantForm.botanicalName} onChange={(e) => handlePlantField("botanicalName", e.target.value)} placeholder="e.g. Ocimum basilicum" /></label>
            <div className="admin-form-row">
              <label>Category<select value={plantForm.category} onChange={(e) => handlePlantField("category", e.target.value)}><option>Herbs</option><option>Vegetables</option><option>Flowers</option><option>Succulents</option></select></label>
              <label>Difficulty<select value={plantForm.difficulty} onChange={(e) => handlePlantField("difficulty", e.target.value)}><option>Easy</option><option>Moderate</option><option>Hard</option><option>Very Easy</option></select></label>
            </div>
            <div className="admin-form-row">
              <label>Sunlight<input value={plantForm.sunlight} onChange={(e) => handlePlantField("sunlight", e.target.value)} /></label>
              <label>Watering need<select value={plantForm.wateringNeed} onChange={(e) => handlePlantField("wateringNeed", e.target.value)}><option>Low</option><option>Moderate</option><option>High</option></select></label>
            </div>
            <label>Soil / growing medium<input value={plantForm.soil} onChange={(e) => handlePlantField("soil", e.target.value)} /></label>
            <label>Image URL (optional)<input value={plantForm.imageUrl} onChange={(e) => handlePlantField("imageUrl", e.target.value)} placeholder="https://…" /></label>
            <label>Description<textarea value={plantForm.description} onChange={(e) => handlePlantField("description", e.target.value)} rows="3" /></label>
            <label>Care tips<textarea value={plantForm.careTips} onChange={(e) => handlePlantField("careTips", e.target.value)} rows="3" /></label>
            <button type="submit" className="admin-save-btn">{editingId ? "Save Changes" : "Add Plant"}</button>
          </form>

          <div className="admin-catalog-card">
            <div className="admin-panel-heading">
              <div>
                <h2>Plant catalog</h2>
                <p>{filteredPlants.length} matching entries</p>
              </div>
              <input className="admin-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plants…" aria-label="Search plants" />
            </div>
            <div className="admin-plant-list">
              {filteredPlants.map((plant) => (
                <article key={plant._id} className="admin-plant-row">
                  <div className="admin-plant-avatar">{plant.emoji || "🌱"}</div>
                  <div className="admin-plant-info">
                    <strong>{plant.name}</strong>
                    <small>{plant.category} • {plant.wateringNeed} watering • {plant.difficulty}</small>
                  </div>
                  <button type="button" className="admin-ghost-btn" onClick={() => beginEdit(plant)}>Edit</button>
                  <button type="button" className="admin-danger-btn" onClick={() => deletePlant(plant)}>Delete</button>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : activeTab === "users" ? (
        <section className="admin-table-card">
          <div className="admin-panel-heading">
            <div><h2>Registered users</h2><p>Account records returned by the secured admin API.</p></div>
            <button type="button" className="admin-refresh-btn" onClick={loadAdminData}>↻ Refresh</button>
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`admin-role-pill ${user.role}`}>{user.role}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="admin-table-card">
          <div className="admin-panel-heading">
            <div><h2>Disease reports</h2><p>Recent reports submitted by authenticated users.</p></div>
            <button type="button" className="admin-refresh-btn" onClick={loadAdminData}>↻ Refresh</button>
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>Plant</th><th>Diagnosis</th><th>Confidence</th><th>Source</th><th>Submitted</th></tr></thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan="5" className="admin-empty-cell">No disease reports yet.</td></tr>
                ) : reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.plantName || "Garden Plant"}</td>
                    <td>{report.diseaseName || "Unresolved"}</td>
                    <td>{Math.round(Number(report.confidence) || 0)}%</td>
                    <td>{report.source || "rules"}</td>
                    <td>{new Date(report.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

export default Admin;
