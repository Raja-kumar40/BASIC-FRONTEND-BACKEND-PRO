/* =====================================================
   ALUMNI CONNECT - LOGIN / SIGNUP PROTECTION
===================================================== */

(function () {

    const USERS_KEY = "alumniUsers";
    const LOGIN_KEY = "alumniLoggedInUser";

    function getUsers() {
        return JSON.parse(
            localStorage.getItem(USERS_KEY) || "[]"
        );
    }

    function saveUsers(users) {
        localStorage.setItem(
            USERS_KEY,
            JSON.stringify(users)
        );
    }

    function getLoggedInUser() {
        return JSON.parse(
            localStorage.getItem(LOGIN_KEY) || "null"
        );
    }

    function isLoggedIn() {
        return !!getLoggedInUser();
    }


    /* =====================================================
       INDEX PAGE PROTECTION
    ===================================================== */

    function protectHomePage() {

        // Login page nahi hai to return
        const loginModal =
            document.getElementById("loginModal");

        const registerModal =
            document.getElementById("registerModal");

        if (!loginModal || !registerModal) {
            return;
        }

        if (!isLoggedIn()) {

            // Puri website ko lock karo
            document.body.classList.add(
                "authentication-required"
            );

            // Login modal open
            setTimeout(function () {

                loginModal.style.display = "flex";

            }, 100);

        } else {

            // User already logged in
            document.body.classList.remove(
                "authentication-required"
            );

            loginModal.style.display = "none";
            registerModal.style.display = "none";

            updateLoginButtons();
        }
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const email =
                    document
                        .getElementById("loginEmail")
                        .value
                        .trim()
                        .toLowerCase();

                const password =
                    document
                        .getElementById("loginPassword")
                        .value;

                const users = getUsers();

                const user =
                    users.find(function (item) {

                        return (
                            item.email === email &&
                            item.password === password
                        );

                    });

                if (!user) {

                    alert(
                        "Invalid Email or Password!"
                    );

                    return;
                }

                // Login save
                localStorage.setItem(
                    LOGIN_KEY,
                    JSON.stringify({
                        name: user.name,
                        email: user.email,
                        role: user.role
                    })
                );

                alert(
                    "Login Successful! Welcome " +
                    user.name
                );

                // Modal close
                document.getElementById(
                    "loginModal"
                ).style.display = "none";

                // Page unlock
                document.body.classList.remove(
                    "authentication-required"
                );

                updateLoginButtons();

            }
        );
    }


    /* =====================================================
       SIGNUP / REGISTER
    ===================================================== */

    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const name =
                    document
                        .getElementById("registerName")
                        .value
                        .trim();

                const email =
                    document
                        .getElementById("registerEmail")
                        .value
                        .trim()
                        .toLowerCase();

                const password =
                    document
                        .getElementById("registerPassword")
                        .value;

                const roleElement =
                    document.getElementById(
                        "registerRole"
                    );

                const role =
                    roleElement
                        ? roleElement.value
                        : "";

                if (!name || !email || !password) {

                    alert(
                        "Please fill all required fields."
                    );

                    return;
                }

                if (password.length < 6) {

                    alert(
                        "Password must be at least 6 characters."
                    );

                    return;
                }

                const users = getUsers();

                const existingUser =
                    users.find(function (item) {

                        return item.email === email;

                    });

                if (existingUser) {

                    alert(
                        "This email is already registered."
                    );

                    return;
                }

                const newUser = {

                    name: name,

                    email: email,

                    password: password,

                    role: role || "Alumni"

                };

                users.push(newUser);

                saveUsers(users);

                alert(
                    "Account created successfully! Now login."
                );

                // Register close
                document.getElementById(
                    "registerModal"
                ).style.display = "none";

                // Login open
                document.getElementById(
                    "loginModal"
                ).style.display = "flex";

                // Email automatically fill
                document.getElementById(
                    "loginEmail"
                ).value = email;

                document.getElementById(
                    "loginPassword"
                ).value = "";

            }
        );
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    window.logoutUser = function () {

        localStorage.removeItem(
            LOGIN_KEY
        );

        alert(
            "You have been logged out."
        );

        window.location.href =
            "index.html";

    };


    /* =====================================================
       LOGIN / LOGOUT BUTTON UPDATE
    ===================================================== */

    function updateLoginButtons() {

        const navButtons =
            document.querySelector(
                ".nav-buttons"
            );

        if (!navButtons) {
            return;
        }

        if (!isLoggedIn()) {
            return;
        }

        const loggedUser =
            getLoggedInUser();

        navButtons.innerHTML = `

            <span class="welcome-user">
                Hi, ${loggedUser.name}
            </span>

            <button
                onclick="logoutUser()"
                class="logout-btn"
            >
                Logout
            </button>

        `;

    }


    /* =====================================================
       PROTECT MESSAGES PAGE
    ===================================================== */

    function protectMessagesPage() {

        const isMessagesPage =
            window.location.pathname
                .toLowerCase()
                .includes("messages.html");

        if (!isMessagesPage) {
            return;
        }

        if (!isLoggedIn()) {

            alert(
                "Please Login or Sign Up first."
            );

            window.location.href =
                "index.html?loginRequired=true";

        }

    }


    /* =====================================================
       PAGE LOAD
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            protectMessagesPage();

            protectHomePage();

            if (isLoggedIn()) {
                updateLoginButtons();
            }

        }
    );


})();