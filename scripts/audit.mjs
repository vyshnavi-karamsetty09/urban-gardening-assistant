import fs from "node:fs";
import path from "node:path";

const root = process.cwd().endsWith("garden_guide_work")
  ? process.cwd()
  : new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const checks = [];

function expect(name, condition, detail) {
  checks.push({ name, passed: condition });
  if (!condition) failures.push(`${name}: ${detail}`);
}

const packageJson = JSON.parse(read("package.json"));
expect("Lint ignores generated/dependency folders", String(packageJson.scripts?.lint || "").includes("--ignore-pattern node_modules") && String(packageJson.scripts?.lint || "").includes("--ignore-pattern dist"), "quality checks should not lint installed dependencies or build output");

const auth = read("server/routes/auth.js");
const authRegister = auth.slice(auth.indexOf('router.post("/register"'), auth.indexOf('router.post("/login"'));
expect(
  "Registration does not seed starter garden data",
  !authRegister.includes("seedStarterGarden") && !authRegister.includes("seedStarterTasks"),
  "register route must create only the user account."
);

const environmentModel = read("server/models/Environment.js");
expect("Environment defaults are empty", environmentModel.includes('default: ""'), "environment schema must not invent a profile");
expect("Environment configured flag defaults false", environmentModel.includes('configured: { type: Boolean, default: false }'), "new environment records must start unconfigured");

const recommendations = read("server/routes/recommendations.js");
expect("Recommendations reject unconfigured profiles", recommendations.includes("const hasProfile = env.configured === true"), "personalized recommendations must require explicit configuration");
expect("Recommendations validate core fields", recommendations.includes("missingCoreFields"), "server must validate more than the configured boolean");
expect("Recommendation regional readings are optional", !recommendations.match(/const coreFields = \[[\s\S]*?"climate"[\s\S]*?"humidity"/), "temperature, climate, humidity and rainfall are regional enrichments and must not block saving when unavailable");

const smartRecommendations = read("src/pages/SmartRecommendations.jsx");
expect("Recommendation form regional readings are optional", !smartRecommendations.match(/const requiredFields = \[[\s\S]*?\["temperature"[\s\S]*?\["climate"[\s\S]*?\["humidity"/), "the form must not reject a complete manual setup because optional regional readings are blank");

const utils = read("src/utils.js");
expect("Workspace storage is user-scoped", utils.includes("getUserStorageKey") && utils.includes("USER_SCOPED_STORAGE_KEYS"), "browser workspace data must be namespaced per account");
expect("Logout keeps namespaced caches", utils.includes("namespaced garden cache intact"), "logout must not wipe every user's cache");

const index = read("server/index.js");
expect("Production CORS has no hardcoded LAN IP", !index.includes("192.168.0.147"), "remove machine-specific LAN origins");
expect("API startup log is deployment-neutral", !index.includes("http://localhost:${PORT}"), "do not advertise localhost as a production endpoint");

const dashboard = read("src/pages/Dashboard.jsx");
expect("Dashboard no longer claims fabricated monthly growth", !dashboard.includes("+50% this month"), "dashboard metrics must come from real data");
expect("Dashboard plant-health metric uses garden data", dashboard.includes("healthPercentage"), "health must be computed from the user's plants");
expect("Dashboard does not invent an environment profile", !dashboard.includes("environment.space || \"Medium\"") && !dashboard.includes("environment.medium || environment.soil || \"Potting Mix\""), "unconfigured profiles must not display fabricated growing conditions");
expect("Dashboard labels unconfigured profiles honestly", dashboard.includes("Set up your garden profile") && dashboard.includes("unlock personalized plant matches"), "the dashboard should distinguish setup from a configured profile");

const myGarden = read("src/pages/MyGarden.jsx");
expect("My Garden has a real-data snapshot", myGarden.includes("Garden Snapshot") && myGarden.includes("healthyPercentage"), "replace fabricated chart/care content with live garden data");
expect("My Garden no longer contains the old Today’s Care block", !myGarden.includes("TODAY'S CARE") && !myGarden.includes("Today’s Care"), "old placeholder care section must stay removed");

const settings = read("src/pages/Settings.jsx");
const settingsCss = read("src/pages/Settings.css");
expect("Settings has a deliberate data-clear flow", settings.includes("Clear your garden") && settings.includes("garden data"), "settings should provide a clear account-scoped cleanup action");
expect("Settings only clears local garden after API success", settings.includes("await gardenApi.clear()") && settings.includes("Do not clear the local cache until both account-scoped API deletes succeed"), "do not wipe cached garden data after a failed cloud delete");
expect("Settings does not silently restore starter plants", !settings.includes("Restore starter plants") && !settings.includes("Starter plants restored"), "avoid fake data controls in normal account settings");


const scheduler = read("src/pages/CareScheduler.jsx");
expect("Care Scheduler does not expose starter-task reset", !scheduler.includes("handleResetDefaults") && !scheduler.includes("defaultTasks"), "a normal account should not offer fake starter task restoration");
expect("Care Scheduler starts empty when there are no saved tasks", scheduler.includes("useState(() => getSavedTasks())"), "scheduler must use saved account data rather than starter tasks");

const disease = read("src/pages/DiseaseDetection.jsx");
expect("Disease scanner does not claim 50+ models", !disease.includes("50+ plant disease models"), "describe the actual configured analysis sources");
expect("Disease scanner avoids absolute safety claims", !disease.includes("100% Safe"), "treatment guidance must not use absolute safety wording");

const api = read("src/api.js");
expect("Production API uses same-origin fallback", api.includes('import.meta.env.DEV ? "http://localhost:5000/api" : "/api"'), "localhost should be development-only");

const darkTheme = read("src/theme-dark.css");
const criticalCssFiles = [
  "src/pages/Dashboard.css",
  "src/pages/MyGarden.css",
  "src/pages/Community.css",
  "src/pages/CareScheduler.css",
  "src/pages/DiseaseDetection.css",
  "src/pages/SmartRecommendations.css",
  "src/pages/PlantLibrary.css",
  "src/pages/GardenAssistant.css",
];
for (const file of criticalCssFiles) {
  const css = read(file);
  expect(
    `${file} has no raw white card surface`,
    !/background(?:-color)?\s*:\s*(?:white|#fff(?:fff)?)(?:\s*!important)?\s*;/i.test(css),
    `${file} still contains a raw white background that can leak into dark mode.`
  );
}
expect("Dark theme covers Community controls", darkTheme.includes('[data-theme="dark"] .community-page button'), "community buttons must have dark-theme control styling");
expect("Dark theme covers Care Scheduler controls", darkTheme.includes('[data-theme="dark"] .scheduler-page button'), "scheduler buttons must have dark-theme control styling");
expect("Dark theme covers Disease Detection controls", darkTheme.includes('[data-theme="dark"] .disease-detection-page button'), "disease detection buttons must have dark-theme control styling");
expect("Dark theme keeps Plant Library garden status visible", darkTheme.includes('.plant-library-page .lib-add-btn.added'), "the In Garden state must not become a white button in dark mode");

const topbar = read("src/components/Topbar.css");
expect("Empty notifications are aligned", topbar.includes(".notif-empty") && topbar.includes("justify-content: center") && topbar.includes("text-align: center"), "empty notifications need a deliberate compact alignment");

const assistant = read("server/routes/assistant.js");
expect("Assistant has plant-aware local guidance", assistant.includes("findMentionedPlant") && assistant.includes("plant?.careTips"), "fallback assistant should use explicitly relevant plant data");
expect("Assistant keeps conversation context", assistant.includes("Array.isArray(context?.conversation)") && assistant.includes("slice(-10)"), "AI requests should preserve recent conversation context");
expect("Dark search surfaces remove rectangle artifacts", darkTheme.includes("PCHANGES: dark-theme surface cleanup") && darkTheme.includes(".topbar-search input") && darkTheme.includes("background: transparent !important;"), "search containers and their inputs should not render accidental dark rectangles");
expect("My Garden metric rings are themed in Dark", darkTheme.includes('html[data-theme="dark"] .circle-bg') && darkTheme.includes('html[data-theme="dark"] .circle-percentage'), "the percentage ring track/text must not use a white light-theme stroke in dark mode");
expect("Settings section controls have hover/active UI", settingsCss.includes("settings2-nav-item:hover") && settingsCss.includes("settings2-nav-item.active"), "settings navigation items need visible interaction states");
expect("Sidebar uses shared botanical dark-safe tone", read("src/components/sidebar.css").includes("var(--sidebar-bg-start)") && read("src/components/sidebar.css").includes("var(--sidebar-bg-end)"), "sidebar should use the shared botanical palette in both themes");
expect("Assistant server loads authoritative plant details", assistant.includes("GardenPlant.find({ user: userId })") && assistant.includes("buildPlantSnapshot"), "the server should supply real plant details instead of trusting browser-supplied plant data");
expect("Assistant supports structured message rendering", read("src/pages/GardenAssistant.jsx").includes("renderAssistantText") && read("src/pages/GardenAssistant.css").includes(".assistant-message-list"), "assistant responses should preserve readable paragraphs and lists");
expect("Assistant does not use an overly short frontend timeout", !read("src/pages/GardenAssistant.jsx").includes("3500"), "configured AI providers need reasonable time to answer before fallback");
expect("Assistant chat is persisted per user", utils.includes("assistantChat") && read("src/pages/GardenAssistant.jsx").includes("readPersistedMessages") && read("src/pages/GardenAssistant.jsx").includes("persistMessages"), "assistant conversation should survive page navigation and remain account-scoped");
expect("Plant Library cards omit repeated care specs", !read("src/pages/PlantLibrary.jsx").includes("lib-specs-grid"), "compact plant cards should keep care specs inside the guide");
expect("Recommendation cards omit repeated care specs", !read("src/pages/SmartRecommendations.jsx").includes("rec-library-specs") && !read("src/pages/SmartRecommendations.jsx").includes("rec-specs-chips"), "recommendation cards should not repeat full care specification blocks");
expect("Care Guide navigation carries the exact plant", (read("src/pages/SmartRecommendations.jsx").includes("CareGuideModal") && read("src/pages/SmartRecommendations.jsx").includes("setGuidePlant")) || read("src/pages/SmartRecommendations.jsx").includes("plant: libraryPlant || plant"), "recommendation care-guide actions must never open a generic empty library page");
expect("Shared sidebar tone is used in both themes", read("src/components/sidebar.css").includes("var(--sidebar-bg-start)") && read("src/theme-dark.css").includes("var(--sidebar-bg-start)"), "sidebar should use one palette in light and dark modes");
expect("Settings nav has active and hover affordances", settingsCss.includes("settings2-nav-item:hover") && settingsCss.includes("settings2-nav-item.active") && settingsCss.includes("settings2-nav-item:active"), "all settings section buttons need visible interaction states");

expect("All JSX buttons have an action or submit behavior", (() => {
  const jsxFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !["node_modules", "dist"].includes(entry.name)) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".jsx")) jsxFiles.push(full);
    }
  };
  walk(path.join(root, "src"));
  return jsxFiles.every((file) => {
    const source = fs.readFileSync(file, "utf8");
    return [...source.matchAll(/<button\b[\s\S]*?<\/button>/g)].every((match) => {
      const block = match[0];
      return block.includes("onClick=") || /type=[\"']submit[\"']/.test(block);
    });
  });
})(), "interactive buttons should not render without an action");
expect("My Garden exposes an exact-plant Care Guide action", myGarden.includes("View Care Guide") && myGarden.includes('onPageChange?.("library"'), "guide actions must route to the exact selected plant");
expect("Assistant persistence falls back to a valid initial message", read("src/pages/GardenAssistant.jsx").includes("return validMessages.length ? validMessages : [INITIAL_MESSAGE]"), "malformed saved chat should never leave the assistant blank");
expect("Care Guide is mounted to the viewport", read("src/components/CareGuideModal.jsx").includes("createPortal") && read("src/components/CareGuideModal.jsx").includes("document.body"), "the shared care guide must render outside the animated page container so it stays centered in the viewport");
expect("Care Guide locks background scroll", read("src/components/CareGuideModal.jsx").includes('document.body.style.overflow = "hidden"'), "the user should not need to scroll the page behind an open care guide");
expect("Settings saves profile changes through the backend", settings.includes("savingProfile") && settings.includes("authApi.updateProfile") && settings.includes("writeStorage(STORAGE_KEYS.session") && settings.includes("notifyWorkspaceUpdate"), "profile settings must persist server-side and propagate the returned user");
expect("Settings confirms saved profile data", settings.includes("authApi.me()") && settings.includes("confirmedUser"), "profile save should refresh from the authenticated account after the update");
expect("Settings saves environment changes through the backend", settings.includes("savingEnvironment") && settings.includes("environmentApi.save") && settings.includes("environmentApi.get"), "environment changes must be server-confirmed and persisted");
expect("Settings does not report unsynced environment data as saved", !settings.includes("pendingSync"), "an authenticated Settings save should not claim success when only local cache was updated");
expect("Settings saves notification preferences to the backend", settings.includes("notificationPreferences: notifications") && settings.includes("authApi.updateProfile") && settings.includes("const nextUser = result.user") && settings.includes("savedNotifications"), "notification changes should persist, be server-verified and propagate beyond localStorage");
expect("Settings saves display preferences to the backend", settings.includes('authApi.updateProfile({ preferences: nextPreferences })') && settings.includes("Save preferences"), "display preference changes should persist beyond localStorage");
expect("Settings hydrates saved account preferences", settings.includes("remoteUser.notificationPreferences") && settings.includes("remoteUser.preferences") && settings.includes("Promise.allSettled"), "Settings should receive profile data even when another page API is unavailable");
expect("Settings loads and saves the existing phone profile field", settings.includes("userPhone") && settings.includes("phone: userPhone.trim()") && settings.includes("remoteUser.phone"), "the Settings page should not drop an existing profile field supported by the backend");
expect("Profile API serializes saved settings", read("server/routes/auth.js").includes("notificationPreferences:") && read("server/routes/auth.js").includes("preferences:"), "auth responses must return saved settings to the frontend");
expect("Profile API persists submitted settings", read("server/routes/auth.js").includes("notificationPreferences") && read("server/routes/auth.js").includes("preferences") && read("server/routes/auth.js").includes("await user.save()"), "profile endpoint should persist submitted settings");
expect("Topbar reacts to profile updates without page reload", read("src/components/Topbar.jsx").includes('garden-guide:workspace-updated') && read("src/components/Topbar.jsx").includes("setUser(nextUser)"), "profile saves should update the topbar immediately");
expect("App stores session through user-scoped storage", read("src/App.jsx").includes("readStorage(STORAGE_KEYS.session") && read("src/App.jsx").includes("writeStorage(STORAGE_KEYS.session"), "session data must use the account-scoped storage helper");
expect("Core pages read the user-scoped session", ["src/pages/Dashboard.jsx", "src/pages/MyGarden.jsx", "src/pages/Community.jsx", "src/pages/Admin.jsx"].every((file) => read(file).includes("readStorage(STORAGE_KEYS.session")), "profile changes must be visible consistently across pages");
expect("Logout clears the active account session", utils.includes("scopedSession") && utils.includes("STORAGE_KEYS.activeUserId") && read("src/App.jsx").includes("clearClientWorkspace({ clearSession: true })"), "logout must not leave the active scoped session behind");
expect("Saved theme remains restored after authentication", read("src/App.jsx").includes('user?.preferences?.theme') && read("src/App.jsx").includes('setTheme(user.preferences.theme)'), "saved theme preference should be restored after login/session refresh");

const assistantPage = read("src/pages/GardenAssistant.jsx");
expect("AI sends the question to the backend before rendering the answer", assistantPage.includes("startAssistantRequest") && assistantPage.includes("persistPendingMessage"), "the page should not display an arbitrary local answer before the server has a chance to understand the request");
expect("AI does not use the old immediate canned-answer flow", !assistantPage.includes("immediate local answer first"), "the previous immediate canned response path caused unrelated questions to inherit saved plants");
expect("AI preserves user-scoped conversation", assistantPage.includes("getUserStorageKey") && assistantPage.includes("STORAGE_KEYS.assistantChat"), "conversation history must remain isolated per account");
expect("AI backend classifies intent before choosing context", assistant.includes("classifyIntent") && assistant.includes("buildRelevantContext"), "the assistant must understand intent before injecting garden context");
expect("AI backend avoids unrelated plant injection", assistant.includes('case "rose-types"') && assistant.includes("General questions intentionally receive no saved garden data") || (assistant.includes('intent === "rose-types"') && assistant.includes("default:\n      // General questions intentionally receive no saved garden data")), "general/profile questions must not inherit a saved plant");
expect("AI backend handles profile facts deterministically", assistant.includes('intent === "profile-name"') && assistant.includes('intent === "profile-email"'), "account facts should come from the authenticated profile");
expect("AI backend handles rose types directly", assistant.includes("roseTypesAnswer") && assistant.includes('intent === "rose-types"'), "rose questions should not be redirected to a random saved plant");
expect("AI backend supports contextual follow-ups", assistant.includes("isFollowUpMessage") && assistant.includes("inferConversationPlant") && assistant.includes('intent === "follow-up"'), "follow-up questions should retain a relevant conversation subject");
expect("AI understands explicit own-plant questions", assistant.includes('intent === "garden-plant-care"') && assistant.includes("my plant"), "questions about the user's own plant should use the saved garden only when explicitly requested");
expect("AI provider receives only relevant context", assistant.includes("buildModelContext") && assistant.includes("Relevant Garden Guide context"), "the external model should not receive the entire garden profile for every question");
expect("AI provider has a real garden-coach system prompt", assistant.includes("genuine conversational gardening assistant") && assistant.includes("Answer naturally and directly"), "configured AI must behave like a conversational garden coach");
expect("AI has a useful local fallback", assistant.includes("function localAnswer") && assistant.includes("roseTypesAnswer") && assistant.includes("Starting plants from seed"), "provider failures must still produce useful gardening guidance");
expect("AI frontend fallback does not select an arbitrary saved plant", read("src/assistantKnowledge.js").includes("isFollowUpReference") && read("src/assistantKnowledge.js").includes("if (!isFollowUpReference(message, conversation)) return null"), "client fallback must not use a saved plant for unrelated questions");
expect("AI backend loads authoritative user data", assistant.includes("GardenPlant.find({ user: userId })") && assistant.includes("Environment.findOne({ user: userId })") && assistant.includes("CareTask.find({ user: userId })"), "the server must use authenticated account data rather than trusting the browser context");
expect("AI page keeps structured response rendering", assistantPage.includes("renderAssistantText") && read("src/pages/GardenAssistant.css").includes(".assistant-message-list"), "assistant responses should preserve paragraphs and lists");
expect("AI page has a meaningful timeout state", read("src/api.js").includes("timeoutMs = 30000") && read("src/pages/GardenAssistant.jsx").includes("Thinking…"), "a network/provider delay must eventually become a usable error/fallback state");
expect("Gemini provider is actually supported", assistant.includes("GEMINI_API_KEY") && assistant.includes("generativelanguage.googleapis.com/v1beta/openai") && assistant.includes("gemini-2.5-flash"), "a configured Gemini key should reach a real OpenAI-compatible Gemini endpoint");
expect("Rose suitability has a dedicated intent", assistant.includes('return "rose-recommendation"') && assistant.includes("recommendRoseType"), "rose recommendation questions must not fall through to the rose-types answer");
expect("Rose suitability does not pretend personalization without setup", assistant.includes("do not have a complete saved garden setup yet") && assistant.includes("general home garden"), "recommendations must distinguish general advice from personalized advice");
expect("Assistant handles instant greetings without a provider request", read("src/pages/GardenAssistant.jsx").includes("instantGreeting") && read("src/pages/GardenAssistant.jsx").includes("instantThanks"), "greetings and thanks should never wait for a slow AI provider");
expect("Assistant keeps in-flight requests across page unmounts", read("src/assistantRequestManager.js").includes("pendingRequests") && assistantPage.includes("persistPendingMessage"), "an in-flight answer must not be lost when the Assistant page unmounts");
expect("AI bare rose question asks for clarification", assistant.includes("rose-clarification") && assistant.includes("Which rose do you mean?"), "ambiguous rose questions must not select a saved plant");
expect("Settings profile save uses server response without stale re-fetch", settings.includes("const confirmedUser = result.user") && !settings.includes("let confirmedUser = result.user"), "profile save should not overwrite fresh data with a redundant immediate /me response");
expect("Settings server-verifies notification saves", settings.includes("const savedNotifications") && settings.includes("The notification preferences were not fully persisted"), "notification saves must be confirmed against the authenticated server state");
expect("Settings server-verifies preference saves", settings.includes("const persistedPreferences") && settings.includes("The preferences were not fully persisted"), "display preference saves must be confirmed against the authenticated server state");
expect("Settings uses one continuous navigation surface", settingsCss.includes("gap: 0 !important") && settingsCss.includes("background: var(--surface) !important") && settingsCss.includes("background: var(--surface-hover) !important"), "settings navigation should behave as one integrated control surface");
expect("Final archive excludes secrets", !fs.existsSync(path.join(root, ".env")) && !fs.existsSync(path.join(root, "dist")), "working tree used for packaging must not contain deployed secrets or build output");

console.log(`Garden Guide audit: ${checks.filter((c) => c.passed).length}/${checks.length} checks passed.`);
for (const check of checks) console.log(`${check.passed ? "PASS" : "FAIL"}  ${check.name}`);

if (failures.length) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
