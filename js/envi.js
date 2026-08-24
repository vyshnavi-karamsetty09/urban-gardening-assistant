// ==========================================
// ENVIRONMENT SETUP PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    setupOptionCards();
    setupSaveButton();

});


// ==========================================
// OPTION CARD SELECTION
// (Balcony/Terrace/Indoor, Sunlight, Growing Medium)
// ==========================================

function setupOptionCards() {

    // Group cards by their radio 'name' attribute
    // so selecting one only deselects others in the SAME group.

    const cards = document.querySelectorAll(".option-card");

    cards.forEach(function (card) {

        card.addEventListener("click", function () {

            const radio = card.querySelector("input[type='radio']");
            if (!radio) return;

            const groupName = radio.name;

            // Deselect all cards in this group
            document
                .querySelectorAll(`.option-card input[name="${groupName}"]`)
                .forEach(function (input) {
                    const parentCard = input.closest(".option-card");
                    parentCard.classList.remove("selected");
                    removeCheckBadge(parentCard);
                });

            // Select the clicked one
            radio.checked = true;
            card.classList.add("selected");
            addCheckBadge(card);

            updateProgress();

        });

    });

}


function addCheckBadge(card) {

    if (card.querySelector(".check-badge")) return;

    const badge = document.createElement("div");
    badge.className = "check-badge";
    badge.textContent = "✓";

    card.insertBefore(badge, card.firstChild.nextSibling);

}


function removeCheckBadge(card) {

    const badge = card.querySelector(".check-badge");
    if (badge) badge.remove();

}


// ==========================================
// PROGRESS TRACKING
// ==========================================

function updateProgress() {

    const groups = ["location", "sunlight", "medium"];

    let completed = 0;

    groups.forEach(function (group) {
        const checked = document.querySelector(
            `input[name="${group}"]:checked`
        );
        if (checked) completed++;
    });

    // Climate dropdowns count as always "filled" since they have defaults
    completed++;

    const totalSteps = 4;
    const percent = Math.round((completed / totalSteps) * 100);

    // Update circular progress
    const circle = document.querySelector(".circle");
    if (circle) {
        circle.setAttribute("stroke-dasharray", `${percent}, 100`);
    }

    const progressText = document.querySelector(".progress-text");
    if (progressText) {
        progressText.textContent = `${percent}% Complete`;
    }

}


// ==========================================
// SAVE & CONTINUE BUTTON
// ==========================================

function setupSaveButton() {

    const saveBtn = document.querySelector(".btn-primary");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", function () {

        const location = document.querySelector(
            "input[name='location']:checked"
        );
        const sunlight = document.querySelector(
            "input[name='sunlight']:checked"
        );
        const medium = document.querySelector(
            "input[name='medium']:checked"
        );

        if (!location || !sunlight || !medium) {
            alert("Please complete all steps before continuing.");
            return;
        }

        const setupData = {
            location: location.closest(".option-card").querySelector("h4").textContent,
            sunlight: sunlight.closest(".option-card").querySelector("h4").textContent,
            temperature: document.querySelectorAll("select")[0].value,
            climate: document.querySelectorAll("select")[1].value,
            humidity: document.querySelectorAll("select")[2].value,
            medium: medium.closest(".option-card").querySelector("h4").textContent
        };

        // Save locally so other pages (like dashboard) could read it later
        localStorage.setItem("environmentSetup", JSON.stringify(setupData));

        alert("Environment setup saved! 🌱");

        // Redirect to dashboard after saving
        window.location.href = "dashboard.html";

    });

}