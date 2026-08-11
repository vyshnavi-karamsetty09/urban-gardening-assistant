/* ==========================================================================
   URBAN GARDENING ASSISTANT - PURE JAVASCRIPT LOGIC
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // VIEW SWITCHER
    // =========================================================

    const tabSignup = document.getElementById("tabSignup");
    const tabLogin = document.getElementById("tabLogin");

    const signupView = document.getElementById("signupView");
    const loginView = document.getElementById("loginView");

    const switchToLoginLink =
        document.getElementById("switchToLoginLink");

    const switchToSignupLink =
        document.getElementById("switchToSignupLink");


    // =========================================================
    // FORM ELEMENTS
    // =========================================================

    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const loginPasswordInput =
        document.getElementById("loginPassword");


    // Password toggle buttons

    const togglePasswordBtn =
        document.getElementById("togglePasswordBtn");

    const toggleConfirmPasswordBtn =
        document.getElementById("toggleConfirmPasswordBtn");

    const toggleLoginPasswordBtn =
        document.getElementById("toggleLoginPasswordBtn");


    // Other elements

    const forgotPasswordLink =
        document.getElementById("forgotPasswordLink");

    const toast =
        document.getElementById("toastNotification");

    const toastMessage =
        document.getElementById("toastMessage");


    // =========================================================
    // SWITCH TO SIGNUP
    // =========================================================

    function switchToSignup() {

        if (signupView && loginView) {

            signupView.classList.remove("hidden");

            loginView.classList.add("hidden");
        }

        if (tabSignup && tabLogin) {

            tabSignup.classList.add("active");

            tabLogin.classList.remove("active");
        }
    }


    // =========================================================
    // SWITCH TO LOGIN
    // =========================================================

    function switchToLogin() {

        if (signupView && loginView) {

            signupView.classList.add("hidden");

            loginView.classList.remove("hidden");
        }

        if (tabSignup && tabLogin) {

            tabLogin.classList.add("active");

            tabSignup.classList.remove("active");
        }
    }


    // Tab buttons

    if (tabSignup) {
        tabSignup.addEventListener("click", switchToSignup);
    }

    if (tabLogin) {
        tabLogin.addEventListener("click", switchToLogin);
    }


    // Login link

    if (switchToLoginLink) {

        switchToLoginLink.addEventListener("click", (e) => {

            e.preventDefault();

            switchToLogin();
        });
    }


    // Signup link

    if (switchToSignupLink) {

        switchToSignupLink.addEventListener("click", (e) => {

            e.preventDefault();

            switchToSignup();
        });
    }


    // =========================================================
    // PASSWORD TOGGLE
    // =========================================================

    function setupPasswordToggle(inputEl, buttonEl) {

        // If the input or button doesn't exist, stop.
        if (!inputEl || !buttonEl) {
            return;
        }


        buttonEl.addEventListener("click", (e) => {

            e.preventDefault();


            // Check current input type

            const isPassword =
                inputEl.getAttribute("type") === "password";


            // ==============================================
            // SHOW PASSWORD
            // ==============================================

            if (isPassword) {

                inputEl.setAttribute("type", "text");


                // Eye-off icon

                const svg = buttonEl.querySelector("svg");

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


            // ==============================================
            // HIDE PASSWORD
            // ==============================================

            else {

                inputEl.setAttribute("type", "password");


                // Normal eye icon

                const svg = buttonEl.querySelector("svg");

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
    // ACTIVATE PASSWORD TOGGLES
    // =========================================================

    setupPasswordToggle(
        passwordInput,
        togglePasswordBtn
    );

    setupPasswordToggle(
        confirmPasswordInput,
        toggleConfirmPasswordBtn
    );

    setupPasswordToggle(
        loginPasswordInput,
        toggleLoginPasswordBtn
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
    // FORGOT PASSWORD
    // =========================================================

    if (forgotPasswordLink) {

        forgotPasswordLink.addEventListener("click", (e) => {

            e.preventDefault();


            const emailInput =
                document.getElementById("loginEmail");


            const emailVal =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            if (emailVal) {

                showToast(
                    `Password reset link sent to ${emailVal}! 📧`
                );

            } else {

                showToast(
                    "Please enter your email address above to reset password.",
                    true
                );
            }

        });
    }


    // =========================================================
    // SIGNUP FORM
    // =========================================================

    if (signupForm) {

        signupForm.addEventListener("submit", (e) => {

            e.preventDefault();


            const firstName =
                document.getElementById("firstName")?.value.trim();

            const lastName =
                document.getElementById("lastName")?.value.trim();

            const email =
                document.getElementById("email")?.value.trim();

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";

            const confirmPassword =
                confirmPasswordInput
                    ? confirmPasswordInput.value
                    : "";

            const termsChecked =
                document.getElementById("termsCheckbox")?.checked;


            // Validation

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


            // Success

            showToast(
                `Welcome ${firstName}! Your Urban Gardening account is ready. 🌿`
            );


            setTimeout(() => {

                signupForm.reset();

            }, 1500);

        });
    }


    // =========================================================
    // LOGIN FORM
    // =========================================================

    if (loginForm) {

        loginForm.addEventListener("submit", (e) => {

            e.preventDefault();


            const email =
                document.getElementById("loginEmail")?.value.trim();

            const password =
                loginPasswordInput
                    ? loginPasswordInput.value
                    : "";


            // Validate email

            if (!email || !email.includes("@")) {

                showToast(
                    "Please enter a valid email address.",
                    true
                );

                return;
            }


            // Validate password

            if (!password) {

                showToast(
                    "Please enter your password.",
                    true
                );

                return;
            }


            // Success

            showToast(
                "Welcome back! Logging into your garden dashboard... 🌿"
            );


            setTimeout(() => {

                loginForm.reset();

            }, 1500);

        });
    }

});