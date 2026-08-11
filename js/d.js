/* =========================================================
   URBAN GARDENING ASSISTANT - DASHBOARD JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ================= ELEMENTS ================= */

    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menuBtn");
    const toast = document.getElementById("toast");

    const taskCheckboxes =
        document.querySelectorAll(".task-checkbox");

    const taskCount =
        document.getElementById("taskCount");

    const addPlantBtn =
        document.getElementById("addPlantBtn");

    const addPlantCard =
        document.getElementById("addPlantCard");

    const environmentBtn =
        document.getElementById("environmentBtn");

    const reportBtn =
        document.getElementById("reportBtn");

    const notificationBtn =
        document.getElementById("notificationBtn");

    const profileBtn =
        document.getElementById("profileBtn");

    const navItems =
        document.querySelectorAll(".nav-item");


    /* =====================================================
       TOAST MESSAGE
    ===================================================== */

    let toastTimer;

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);
    }


    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    if (menuBtn && sidebar) {

        menuBtn.addEventListener("click", () => {

            sidebar.classList.toggle("open");

        });

    }


    /* =====================================================
       TASK COUNT
    ===================================================== */

    function updateTaskCount() {

        const remainingTasks =
            [...taskCheckboxes]
                .filter(
                    checkbox => !checkbox.checked
                )
                .length;

        if (taskCount) {

            taskCount.textContent =
                remainingTasks;

        }
    }


    /* =====================================================
       TASK COMPLETION
    ===================================================== */

    taskCheckboxes.forEach((checkbox) => {

        checkbox.addEventListener("change", () => {

            const task =
                checkbox.closest(".task-item");

            if (task) {

                task.classList.toggle(
                    "completed",
                    checkbox.checked
                );

            }

            updateTaskCount();


            if (checkbox.checked) {

                showToast(
                    "Great job! Task completed 🌱"
                );

            }

        });

    });


    /* =====================================================
       ADD RECOMMENDED PLANT
    ===================================================== */

    if (addPlantBtn) {

        addPlantBtn.addEventListener("click", () => {

            addPlantBtn.textContent =
                "✓ Added to My Garden";

            addPlantBtn.disabled = true;

            addPlantBtn.style.opacity = "0.75";

            showToast(
                "Snake Plant added to your garden 🌿"
            );

        });

    }


    /* =====================================================
       ADD PLANT CARD
    ===================================================== */

    if (addPlantCard) {

        addPlantCard.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                showToast(
                    "Plant selection will open here."
                );

            }
        );

    }


    /* =====================================================
       ENVIRONMENT SETUP
    ===================================================== */

    if (environmentBtn) {

        environmentBtn.addEventListener(
            "click",
            () => {

                /*
                 * When the actual page is created,
                 * replace this with:
                 *
                 * window.location.href =
                 * "environment-setup.html";
                 */

                showToast(
                    "Environment Setup will open here 🌱"
                );

            }
        );

    }


    /* =====================================================
       DISEASE REPORT
    ===================================================== */

    if (reportBtn) {

        reportBtn.addEventListener(
            "click",
            () => {

                /*
                 * When the actual page is created,
                 * replace this with:
                 *
                 * window.location.href =
                 * "disease-report.html";
                 */

                showToast(
                    "Disease Report will open here 🩺"
                );

            }
        );

    }


    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "You have 3 new gardening notifications."
                );

            }
        );

    }


    /* =====================================================
       PROFILE
    ===================================================== */

    if (profileBtn) {

        profileBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Profile menu will be connected later."
                );

            }
        );

    }


    /* =====================================================
       SIDEBAR NAVIGATION
    ===================================================== */

    navItems.forEach((item) => {

        item.addEventListener(
            "click",
            (event) => {

                const href =
                    item.getAttribute("href");


                /*
                 * Only placeholder links (#)
                 * are handled here.
                 *
                 * Actual pages will continue
                 * to open normally.
                 */

                if (href === "#") {

                    event.preventDefault();


                    navItems.forEach(nav => {

                        nav.classList.remove(
                            "active"
                        );

                    });


                    item.classList.add("active");


                    const label =
                        item.querySelector(
                            "span:last-child"
                        );


                    if (label) {

                        showToast(
                            `${label.textContent} will be connected next.`
                        );

                    }

                }

            }
        );

    });


    /* =====================================================
       INITIAL TASK COUNT
    ===================================================== */

    updateTaskCount();

});
