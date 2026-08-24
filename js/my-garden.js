/* =========================================
   MY GARDEN - JAVASCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       FILTER BUTTON
       ========================================= */

    const filterButton = document.querySelector(".btn-light");

    if (filterButton) {
        filterButton.addEventListener("click", function () {

            const cards = document.querySelectorAll(".plant-card");

            if (cards.length === 0) {
                alert("No plants available to filter.");
                return;
            }

            const choice = prompt(
                "Filter plants by:\n\n" +
                "1 - Healthy\n" +
                "2 - Needs Water\n" +
                "3 - Show All"
            );

            if (choice === "1") {
                cards.forEach(card => {
                    const status = card.querySelector(".status");

                    if (status && status.classList.contains("healthy")) {
                        card.style.display = "";
                    } else {
                        card.style.display = "none";
                    }
                });
            }

            else if (choice === "2") {
                cards.forEach(card => {
                    const status = card.querySelector(".status");

                    if (status && status.classList.contains("warning")) {
                        card.style.display = "";
                    } else {
                        card.style.display = "none";
                    }
                });
            }

            else if (choice === "3") {
                cards.forEach(card => {
                    card.style.display = "";
                });
            }

        });
    }


    /* =========================================
       ADD PLANT BUTTON
       ========================================= */

    window.addPlant = function () {

        const plantName = prompt("Enter the plant name:");

        if (!plantName || plantName.trim() === "") {
            return;
        }

        const plantGrid = document.querySelector(".plant-grid");

        if (!plantGrid) {
            alert("Plant section not found.");
            return;
        }

        /* Create new plant card */

        const newCard = document.createElement("div");

        newCard.className = "plant-card";

        newCard.innerHTML = `
            <div class="plant-image">
                <span>🌱</span>
                <span class="status healthy">✓ Healthy</span>
            </div>

            <div class="plant-details">

                <div class="plant-name">
                    ${plantName}
                </div>

                <div class="plant-type">
                    Garden Plant
                </div>

                <div class="requirements">

                    <div class="requirement sun">
                        ☀️ 6–8 hrs
                    </div>

                    <div class="requirement water">
                        💧 Daily
                    </div>

                </div>

                <div class="plant-bottom">

                    <span class="last-watered">
                        Watered: Today
                    </span>

                    <button class="view-btn">
                        View →
                    </button>

                </div>

            </div>
        `;

        plantGrid.appendChild(newCard);

        updatePlantCount();

        alert(plantName + " has been added to your garden!");
    };


    /* =========================================
       UPDATE TOTAL PLANT COUNT
       ========================================= */

    function updatePlantCount() {

        const plantCards = document.querySelectorAll(
            ".plant-card:not(.hidden-plant)"
        );

        const totalPlants = plantCards.length;

        const totalNumber = document.querySelector(
            ".summary-card:first-child .summary-number"
        );

        if (totalNumber) {
            totalNumber.textContent = totalPlants;
        }

        const gardenCount = document.querySelector(
            ".garden-heading span"
        );

        if (gardenCount) {
            gardenCount.textContent =
                totalPlants + " plants in your garden";
        }
    }


    /* =========================================
       VIEW PLANT BUTTON
       ========================================= */

    document.addEventListener("click", function (event) {

        if (event.target.classList.contains("view-btn")) {

            const card = event.target.closest(".plant-card");

            if (!card) {
                return;
            }

            const plantName =
                card.querySelector(".plant-name")?.textContent.trim();

            if (plantName) {
                alert(
                    "Plant: " + plantName +
                    "\n\nYou can add detailed plant information here later."
                );
            }
        }

    });


    /* =========================================
       REMOVE PLANT
       ========================================= */

    document.addEventListener("click", function (event) {

        if (event.target.classList.contains("remove-btn")) {

            const card = event.target.closest(".plant-card");

            if (!card) {
                return;
            }

            const plantName =
                card.querySelector(".plant-name")?.textContent.trim();

            const confirmRemove = confirm(
                "Remove " + plantName + " from your garden?"
            );

            if (confirmRemove) {

                card.remove();

                updatePlantCount();
            }
        }

    });


    /* =========================================
       INITIAL COUNT
       ========================================= */

    updatePlantCount();

});