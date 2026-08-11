/* ==========================================================================
   URBAN GARDENING ASSISTANT - SIGNUP JAVASCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // FORM ELEMENTS
    // =========================================================

    const signupForm = document.getElementById("signupForm");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const togglePasswordBtn =
        document.getElementById("togglePasswordBtn");

    const toggleConfirmPasswordBtn =
        document.getElementById("toggleConfirmPasswordBtn");

    const toast =
        document.getElementById("toastNotification");

    const toastMessage =
        document.getElementById("toastMessage");


    // =========================================================
    // PASSWORD TOGGLE FUNCTION
    // =========================================================

    function setupPasswordToggle(inputEl, buttonEl) {

        if (!inputEl || !buttonEl) {
            return;
        }

        buttonEl.addEventListener("click", (e) => {

            e.preventDefault();

            const isPassword =
                inputEl.getAttribute("type") === "password";


            // =================================================
            // SHOW PASSWORD
            // =================================================

            if (isPassword) {

                inputEl.setAttribute("type", "text");

                const svg =
                    buttonEl.querySelector("svg");

                if (svg) {

                    svg.innerHTML = `
                        <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20
                            c-7 0-11-8-11-8
                            a18.45 18.45 0 0 1 5.06-5.94
                            M9.9 4.24A9.12 9.12 0 0 1 12 4
                            c7 0 11 8 11 8
                            a18.5 18.5 0 0 1-2.16 3.19
                            m-6.72-1.07
                            a3 3 0 1 1-4.24-4.24"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />

                        <line
                            x1="1"
                            y1="1"
                            x2="23"
                            y2="23"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    `;
                }

                buttonEl.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            }


            // =================================================
            // HIDE PASSWORD
            // =================================================

            else {

                inputEl.setAttribute("type", "password");

                const svg =
                    buttonEl.querySelector("svg");

                if (svg) {

                    svg.innerHTML = `
                        <path
                            d="M1 12s4-8 11-8
                            11 8 11 8
                            -4 8-11 8
                            -11-8-11-8z"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />

                        <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                    `;
                }

                buttonEl.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

        });
    }


    // =========================================================
    // ENABLE PASSWORD TOGGLES
    // =========================================================

    setupPasswordToggle(
        passwordInput,
        togglePasswordBtn
    );

    setupPasswordToggle(
        confirmPasswordInput,
        toggleConfirmPasswordBtn
    );


    // =========================================================
    // TOAST NOTIFICATION
    // =========================================================

    function showToast(message, isError = false) {

        if (!toast || !toastMessage) {
            return;
        }

        toastMessage.textContent = message;


        if (isError) {

            toast.style.backgroundColor = "#d93838";

        } else {

            toast.style.backgroundColor = "#23471e";
        }


        toast.classList.add("show");


        setTimeout(() => {

            toast.classList.remove("show");

        }, 4000);
    }


    // =========================================================
    // SIGNUP FORM SUBMIT
    // =========================================================

    if (signupForm) {

        signupForm.addEventListener("submit", (e) => {

            e.preventDefault();


            // =================================================
            // GET FORM VALUES
            // =================================================

            const firstName =
                document.getElementById("firstName").value.trim();

            const lastName =
                document.getElementById("lastName").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const phone =
                document.getElementById("phone").value.trim();

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;

            const termsChecked =
                document.getElementById("termsCheckbox").checked;


            // =================================================
            // VALIDATION
            // =================================================

            if (!firstName || !lastName) {

                showToast(
                    "Please enter your full name.",
                    true
                );

                return;
            }


            if (!email || !email.includes("@")) {

                showToast(
                    "Please enter a valid email address.",
                    true
                );

                return;
            }


            if (!phone) {

                showToast(
                    "Please enter your phone number.",
                    true
                );

                return;
            }


            if (password.length < 6) {

                showToast(
                    "Password must be at least 6 characters long.",
                    true
                );

                return;
            }


            if (password !== confirmPassword) {

                showToast(
                    "Passwords do not match. Please verify.",
                    true
                );

                return;
            }


            if (!termsChecked) {

                showToast(
                    "You must agree to the Terms of Service.",
                    true
                );

                return;
            }


            // =================================================
            // SUCCESS
            // =================================================

            showToast(
                `Welcome ${firstName}! Your Urban Gardening account is ready. 🌿`
            );


            // Reset form after success

            setTimeout(() => {

                signupForm.reset();

            }, 1500);

        });
    }

});