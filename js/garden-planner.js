/* =========================================
   GARDEN PLANNER JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const gardenGrid = document.querySelector(".garden-grid");
    const addPlantBtn = document.querySelector(".tool");
    const toolButtons = document.querySelectorAll(".tool");

    let history = [];
    let historyIndex = -1;

    /* =========================================
       SAVE CURRENT GRID STATE
       ========================================= */

    function saveState() {
        if (!gardenGrid) return;

        const state = gardenGrid.innerHTML;

        // Remove states after the current position
        history = history.slice(0, historyIndex + 1);

        history.push(state);
        historyIndex++;

        // Keep history small
        if (history.length > 20) {
            history.shift();
            historyIndex--;
        }
    }

    /* =========================================
       RESTORE GRID STATE
       ========================================= */

    function restoreState(state) {
        if (!gardenGrid || !state) return;

        gardenGrid.innerHTML = state;
        setupPlants();
    }

    /* =========================================
       DRAG AND DROP
       ========================================= */

    function setupPlants() {

        const plants = document.querySelectorAll(".plant");

        plants.forEach(plant => {

            plant.setAttribute("draggable", "true");

            plant.addEventListener("dragstart", event => {

                event.dataTransfer.setData(
                    "text/plain",
                    plant.outerHTML
                );

                plant.classList.add("dragging");
            });

            plant.addEventListener("dragend", () => {
                plant.classList.remove("dragging");
            });

        });

        const cells = gardenGrid.querySelectorAll(".plant");

        cells.forEach(plant => {

            plant.addEventListener("click", () => {

                const plantName =
                    plant.querySelector("span")?.textContent ||
                    "Plant";

                alert(plantName + " selected.");
            });

        });
    }

    /* =========================================
       GRID DROP
       ========================================= */

    if (gardenGrid) {

        gardenGrid.addEventListener("dragover", event => {
            event.preventDefault();
        });

        gardenGrid.addEventListener("drop", event => {

            event.preventDefault();

            const draggingPlant =
                document.querySelector(".dragging");

            if (!draggingPlant) return;

            saveState();

            const targetCell = event.target.closest(".plant");

            if (targetCell) {
                targetCell.replaceWith(draggingPlant);
            } else {
                gardenGrid.appendChild(draggingPlant);
            }

            setupPlants();
        });

    }

    /* =========================================
       ADD PLANT
       ========================================= */

    window.addPlant = function () {

        if (!gardenGrid) return;

        const plants = [
            {
                name: "Tomato",
                icon: "🍅"
            },
            {
                name: "Basil",
                icon: "🌿"
            },
            {
                name: "Mint",
                icon: "🌱"
            },
            {
                name: "Aloe Vera",
                icon: "🌵"
            },
            {
                name: "Chilli",
                icon: "🌶️"
            },
            {
                name: "Coriander",
                icon: "🌿"
            }
        ];

        const plantName = prompt(
            "Enter plant name:"
        );

        if (!plantName) return;

        const selectedPlant =
            plants.find(
                plant =>
                    plant.name.toLowerCase() ===
                    plantName.toLowerCase()
            );

        if (!selectedPlant) {

            alert(
                "Plant not found.\n\n" +
                "Available plants:\n" +
                "Tomato\n" +
                "Basil\n" +
                "Mint\n" +
                "Aloe Vera\n" +
                "Chilli\n" +
                "Coriander"
            );

            return;
        }

        saveState();

        const newPlant = document.createElement("div");

        newPlant.className = "plant";

        newPlant.innerHTML = `
            <div class="plant-icon">
                ${selectedPlant.icon}
            </div>
            <span>${selectedPlant.name}</span>
        `;

        gardenGrid.appendChild(newPlant);

        setupPlants();
    };

    /* =========================================
       REMOVE PLANT
       ========================================= */

    window.removePlant = function () {

        if (!gardenGrid) return;

        const selectedPlant =
            gardenGrid.querySelector(".plant.selected");

        if (!selectedPlant) {

            alert(
                "Click a plant first, then click Remove."
            );

            return;
        }

        saveState();

        selectedPlant.remove();

        setupPlants();
    };

    /* =========================================
       SELECT PLANT
       ========================================= */

    function enableSelection() {

        if (!gardenGrid) return;

        gardenGrid.addEventListener("click", event => {

            const plant =
                event.target.closest(".plant");

            if (!plant) return;

            gardenGrid
                .querySelectorAll(".plant")
                .forEach(item => {
                    item.classList.remove("selected");
                });

            plant.classList.add("selected");
        });

    }

    /* =========================================
       RESET GARDEN
       ========================================= */

    window.resetGarden = function () {

        if (!gardenGrid) return;

        const confirmReset =
            confirm(
                "Are you sure you want to reset your garden?"
            );

        if (!confirmReset) return;

        saveState();

        gardenGrid.innerHTML = "";

        setupPlants();
    };

    /* =========================================
       UNDO
       ========================================= */

    window.undoPlan = function () {

        if (historyIndex <= 0) {

            alert("Nothing to undo.");

            return;
        }

        historyIndex--;

        restoreState(
            history[historyIndex]
        );
    };

    /* =========================================
       REDO
       ========================================= */

    window.redoPlan = function () {

        if (
            historyIndex >=
            history.length - 1
        ) {

            alert("Nothing to redo.");

            return;
        }

        historyIndex++;

        restoreState(
            history[historyIndex]
        );
    };

    /* =========================================
       SAVE PLAN
       ========================================= */

    window.savePlan = function () {

        if (!gardenGrid) return;

        const plants =
            gardenGrid.querySelectorAll(".plant");

        const plantNames = [];

        plants.forEach(plant => {

            const name =
                plant.querySelector("span")?.textContent;

            if (name) {
                plantNames.push(name);
            }

        });

        localStorage.setItem(
            "gardenPlan",
            JSON.stringify(plantNames)
        );

        alert(
            "Your garden plan has been saved successfully! 🌱"
        );
    };

    /* =========================================
       LOAD SAVED PLAN
       ========================================= */

    function loadSavedPlan() {

        const savedPlan =
            localStorage.getItem("gardenPlan");

        if (!savedPlan) return;

        console.log(
            "Saved garden plan:",
            JSON.parse(savedPlan)
        );
    }

    /* =========================================
       INITIALIZE
       ========================================= */

    setupPlants();
    enableSelection();
    loadSavedPlan();

    if (gardenGrid) {
        saveState();
    }

});