```javascript
// ==========================================
// PLANT CARE AI ASSISTANT
// ==========================================

const input = document.getElementById("userInput");

const conversation = document.getElementById("conversation");


// ==========================================
// SEND MESSAGE
// ==========================================

function sendMessage() {

    const question = input.value.trim();

    if (question === "") {
        return;
    }


    // Add user message

    addUserMessage(question);


    // Clear input

    input.value = "";


    // Simulate AI thinking

    showTyping();


    setTimeout(() => {

        removeTyping();

        const answer = getPlantAnswer(question);

        addAIMessage(answer);

    }, 900);

}


// ==========================================
// ENTER KEY
// ==========================================

input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        sendMessage();

    }

});


// ==========================================
// SUGGESTION QUESTIONS
// ==========================================

function askQuestion(question) {

    input.value = question;

    sendMessage();

}


// ==========================================
// CATEGORY BUTTONS
// ==========================================

function selectCategory(category) {

    const questions = {

        "plant care":
            "How can I keep my plants healthy?",

        "watering":
            "How often should I water my plants?",

        "sunlight":
            "How much sunlight does my plant need?",

        "pests":
            "How can I identify and control plant pests?",

        "soil":
            "What type of soil is best for growing plants?",

        "diseases":
            "How can I identify common plant diseases?"

    };


    if (questions[category]) {

        askQuestion(questions[category]);

    }

}


// ==========================================
// ADD USER MESSAGE
// ==========================================

function addUserMessage(message) {

    const messageDiv = document.createElement("div");

    messageDiv.className = "chat-message user";


    messageDiv.innerHTML = `

        <div class="message-content">
            ${escapeHTML(message)}
        </div>

    `;


    conversation.appendChild(messageDiv);

    scrollToBottom();

}


// ==========================================
// ADD AI MESSAGE
// ==========================================

function addAIMessage(message) {

    const messageDiv = document.createElement("div");

    messageDiv.className = "chat-message ai";


    messageDiv.innerHTML = `

        <div class="message-avatar">
            🌱
        </div>

        <div class="message-content">
            ${message}
        </div>

    `;


    conversation.appendChild(messageDiv);

    scrollToBottom();

}


// ==========================================
// TYPING INDICATOR
// ==========================================

function showTyping() {

    const typing = document.createElement("div");

    typing.className = "chat-message ai";

    typing.id = "typing";


    typing.innerHTML = `

        <div class="message-avatar">
            🌱
        </div>

        <div class="message-content">
            🌿 Thinking...
        </div>

    `;


    conversation.appendChild(typing);

    scrollToBottom();

}


// ==========================================
// REMOVE TYPING
// ==========================================

function removeTyping() {

    const typing = document.getElementById("typing");

    if (typing) {

        typing.remove();

    }

}


// ==========================================
// SCROLL
// ==========================================

function scrollToBottom() {

    conversation.scrollTop =
        conversation.scrollHeight;

}


// ==========================================
// PLANT KNOWLEDGE
// ==========================================

function getPlantAnswer(question) {

    const q = question.toLowerCase();


    // WATERING

    if (
        q.includes("water") ||
        q.includes("watering")
    ) {

        return `

            💧 <strong>Watering Advice</strong>

            <br><br>

            Most plants should be watered when the
            top 1–2 inches of soil feels dry.

            <br><br>

            🌱 Avoid keeping the soil constantly wet.

            <br><br>

            Make sure your pot has drainage holes
            so excess water can escape.

        `;

    }


    // YELLOW LEAVES

    if (
        q.includes("yellow") ||
        q.includes("yellowing")
    ) {

        return `

            🍂 <strong>Yellow Leaves</strong>

            <br><br>

            Yellow leaves can happen because of:

            <br><br>

            💧 Overwatering<br>
            ☀️ Insufficient light<br>
            🌱 Nutrient deficiency<br>
            🪴 Poor drainage

            <br><br>

            First check the soil moisture and
            make sure the pot drains properly.

        `;

    }


    // SUNLIGHT

    if (
        q.includes("sun") ||
        q.includes("sunlight") ||
        q.includes("light")
    ) {

        return `

            ☀️ <strong>Sunlight Advice</strong>

            <br><br>

            Different plants require different
            amounts of sunlight.

            <br><br>

            🌞 Full sun — several hours of direct light.<br>
            🌤️ Partial sun — a few hours of sunlight.<br>
            🌥️ Indirect light — bright light without strong direct sun.

            <br><br>

            Tell me your plant name and I can give
            you more specific advice.

        `;

    }


    // SOIL

    if (
        q.includes("soil") ||
        q.includes("potting")
    ) {

        return `

            🪴 <strong>Soil Advice</strong>

            <br><br>

            Good soil should provide:

            <br><br>

            🌱 Nutrients<br>
            💧 Moisture retention<br>
            🌬️ Good drainage

            <br><br>

            For many container plants,
            a well-draining potting mix works well.

        `;

    }


    // PESTS

    if (
        q.includes("pest") ||
        q.includes("insect") ||
        q.includes("bug")
    ) {

        return `

            🐛 <strong>Plant Pest Check</strong>

            <br><br>

            Check both sides of the leaves
            and inspect the stems.

            <br><br>

            Look for:

            <br>

            • Tiny insects<br>
            • Sticky leaves<br>
            • Webbing<br>
            • Holes in leaves<br>
            • White spots

            <br><br>

            Tell me what the insect looks like
            and I can help you identify the possible pest.

        `;

    }


    // DISEASES

    if (
        q.includes("disease") ||
        q.includes("fungus") ||
        q.includes("spot")
    ) {

        return `

            🌿 <strong>Plant Disease Check</strong>

            <br><br>

            Common signs of plant disease include:

            <br><br>

            🍂 Yellow or brown leaves<br>
            ⚫ Dark spots<br>
            🦠 White powdery growth<br>
            🌱 Wilting<br>
            🍃 Leaf curling

            <br><br>

            Tell me the plant name and describe
            the symptoms for a more specific answer.

        `;

    }


    // GENERAL PLANT CARE

    if (
        q.includes("healthy") ||
        q.includes("care") ||
        q.includes("grow")
    ) {

        return `

            🌱 <strong>Healthy Plant Checklist</strong>

            <br><br>

            ☀️ Provide suitable sunlight.<br>
            💧 Water according to the plant's needs.<br>
            🪴 Use well-draining soil.<br>
            🌱 Provide appropriate nutrients.<br>
            🐛 Check regularly for pests.<br>
            ✂️ Prune when necessary.

            <br><br>

            If you tell me your plant name,
            I can give you a more specific care guide.

        `;

    }


    // DEFAULT

    return `

        🌿 <strong>I'm here to help!</strong>

        <br><br>

        You can ask me about:

        <br><br>

        💧 Watering<br>
        ☀️ Sunlight<br>
        🪴 Soil<br>
        🌱 Fertilizer<br>
        🐛 Pests<br>
        🍂 Diseases<br>
        ✂️ Pruning<br>
        🌿 General plant care

        <br><br>

        For example:

        <br><br>

        <em>
        "Why are my tomato leaves turning yellow?"
        </em>

    `;

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
```
