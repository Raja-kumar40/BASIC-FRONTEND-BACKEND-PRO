// ================= SOCKET CONNECTION =================

const socket = io("http://localhost:3000");


// ================= CURRENT LOGGED-IN USER =================

const storedUser = localStorage.getItem("alumniUser");

let myName = "";

if (storedUser) {
    try {
        const userData = JSON.parse(storedUser);

        if (userData.name) {
            myName = userData.name.trim();
        }

    } catch (error) {
        console.log("User data error:", error);
    }
}


// Login nahi hai
if (!myName) {

    alert("Please login first.");

    window.location.href = "index.html";

}


// ================= CURRENT CHAT USER =================

// Starting me koi user select nahi hai
let currentUser = "";


// ================= HTML ELEMENTS =================

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const messagesBox =
    document.getElementById("messages");

const chatName =
    document.getElementById("chatName");

const chatAvatar =
    document.getElementById("chatAvatar");

const userSearch =
    document.getElementById("userSearch");


// ================= SOCKET CONNECT =================

socket.on("connect", () => {

    console.log(
        "Socket connected successfully:",
        socket.id
    );

    // Logged-in user ko uske naam wale room me join karo
    socket.emit(
        "joinUser",
        myName
    );

    console.log(
        "Joined room:",
        myName
    );

});


// ================= SOCKET DISCONNECT =================

socket.on("disconnect", () => {

    console.log(
        "Socket disconnected"
    );

});


// ================= OPEN CHAT =================

function openChat(name) {

    const selectedUser = name.trim();


    // Khud ki chat open nahi karni
    if (
        selectedUser.toLowerCase() ===
        myName.toLowerCase()
    ) {

        console.log(
            "Cannot open own chat:",
            selectedUser
        );

        return;
    }


    currentUser = selectedUser;


    // Chat header
    chatName.textContent =
        currentUser;


    // ================= AVATAR =================

    const words =
        currentUser.split(" ");

    let initials = "";

    words.forEach(word => {

        if (word.length > 0) {

            initials +=
                word.charAt(0).toUpperCase();

        }

    });


    chatAvatar.textContent =
        initials.substring(0, 2);


    console.log(
        "Chat opened with:",
        currentUser
    );


    // Purani chat load karo
    loadMessages();

}


// ================= LOAD OLD MESSAGES =================

async function loadMessages() {

    if (!currentUser) {

        messagesBox.innerHTML = "";

        return;

    }


    try {

        messagesBox.innerHTML = "";


        const url =
            `http://localhost:3000/api/messages/${encodeURIComponent(myName)}/${encodeURIComponent(currentUser)}`;


        console.log(
            "Loading chat:",
            myName,
            "<->",
            currentUser
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Failed to load messages"
            );

        }


        const messages =
            await response.json();


        console.log(
            "Chat history:",
            messages
        );


        messages.forEach(message => {

            displayMessage(
                message,
                message.sender === myName
            );

        });


    } catch (error) {

        console.log(
            "Chat history error:",
            error
        );

    }

}


// ================= SEND MESSAGE =================

function sendMessage() {

    const messageText =
        messageInput.value.trim();


    // Empty message
    if (!messageText) {

        return;

    }


    // Receiver select nahi hua
    if (!currentUser) {

        alert(
            "Please select a user first."
        );

        return;

    }


    // Khud ko message nahi bhejna
    if (
        myName.toLowerCase() ===
        currentUser.toLowerCase()
    ) {

        alert(
            "You cannot send a message to yourself."
        );

        return;

    }


    // Message data
    const messageData = {

        sender: myName,

        receiver: currentUser,

        message: messageText

    };


    console.log(
        "Sending message:",
        messageData
    );


    // ================= SENDER SCREEN =================

    // Sender ke screen par SENT
    displayMessage(
        messageData,
        true
    );


    // ================= SEND TO SERVER =================

    socket.emit(
        "sendMessage",
        messageData
    );


    // Input clear
    messageInput.value = "";


    // Input focus
    messageInput.focus();

}


// ================= SEND BUTTON =================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        () => {

            sendMessage();

        }
    );

}


// ================= ENTER KEY =================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


// ================= RECEIVE MESSAGE =================

socket.on(
    "receiveMessage",
    async (message) => {

        console.log(
            "MESSAGE RECEIVED:",
            message
        );


        // Sirf receiver ke browser me process hoga
        if (
            message.receiver !== myName
        ) {

            return;

        }


        console.log(
            "Incoming message from:",
            message.sender
        );


        // Agar sender ki chat open nahi hai
        if (
            currentUser !== message.sender
        ) {

            console.log(
                "Opening sender chat:",
                message.sender
            );


            // Sender ki chat open karo
            currentUser =
                message.sender.trim();


            // Header update
            chatName.textContent =
                currentUser;


            // Avatar update
            const words =
                currentUser.split(" ");

            let initials = "";


            words.forEach(word => {

                if (word.length > 0) {

                    initials +=
                        word.charAt(0).toUpperCase();

                }

            });


            chatAvatar.textContent =
                initials.substring(0, 2);


            // MongoDB se chat history load karo
            await loadMessages();


            return;

        }


        // Sender ki chat already open hai
        // Direct RECEIVED message dikhao

        displayMessage(
            message,
            false
        );

    }
);


// ================= MESSAGE ERROR =================

socket.on(
    "messageError",
    (data) => {

        console.log(
            "Message error:",
            data
        );


        alert(
            "Message send nahi hua: " +
            data.error
        );

    }
);


// ================= DISPLAY MESSAGE =================

function displayMessage(
    message,
    isMine
) {

    const messageDiv =
        document.createElement("div");


    messageDiv.classList.add(
        "message"
    );


    // SENT
    if (isMine) {

        messageDiv.classList.add(
            "sent"
        );

    }

    // RECEIVED
    else {

        messageDiv.classList.add(
            "received"
        );

    }


    messageDiv.innerHTML = `

        <div class="message-content">

            <p>
                ${escapeHTML(message.message)}
            </p>

            <small>
                ${formatTime(message.time)}
            </small>

        </div>

    `;


    messagesBox.appendChild(
        messageDiv
    );


    // Bottom par scroll
    messagesBox.scrollTop =
        messagesBox.scrollHeight;

}


// ================= FORMAT TIME =================

function formatTime(time) {

    if (!time) {

        return "";

    }


    const date =
        new Date(time);


    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ================= SECURITY =================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


// ================= SEARCH USERS =================

if (userSearch) {

    userSearch.addEventListener(
        "input",
        () => {

            const searchText =
                userSearch.value
                    .toLowerCase()
                    .trim();


            const users =
                document.querySelectorAll(
                    ".user"
                );


            users.forEach(user => {

                const name =
                    user.dataset.name
                        .toLowerCase();


                // Apna naam hide karo
                if (
                    name ===
                    myName.toLowerCase()
                ) {

                    user.style.display =
                        "none";

                    return;

                }


                if (
                    name.includes(searchText)
                ) {

                    user.style.display =
                        "flex";

                } else {

                    user.style.display =
                        "none";

                }

            });

        }
    );

}


// ================= DEFAULT CHAT =================

// Logged-in user ke alawa first user open karo

const users =
    document.querySelectorAll(
        ".user[data-name]"
    );

let firstOtherUser = null;


for (const user of users) {

    const name =
        user.dataset.name.trim();


    if (
        name.toLowerCase() !==
        myName.toLowerCase()
    ) {

        firstOtherUser = user;

        break;

    }

}


if (firstOtherUser) {

    openChat(
        firstOtherUser.dataset.name
    );

}