// Function to check for terms acceptance
function checkTerms() {
    try {
        if (!localStorage.getItem("agreedToTerms")) {
            window.location.replace("pre_screen.html");
        }
    } catch (error) {
        console.error("Error accessing local storage:", error);
    }
}

// Get DOM elements
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const popoverButton = document.getElementById("popoverButton");
const popoverContent = document.getElementById("popoverContent");
const reportButton = document.getElementById("reportButton");
const skipButton = document.getElementById("skipButton");

// Response arrays
const randomResponses = [
    "I'm here to assist you. If I fail to do so, please use the \"REPORT\" button so the issue can be fixed!",
    "That's an interesting question for which I do not have an answer yet. Please submit any questions you didn't have an answer for so that we can fix it using the \"REPORT\" button!",
    "I'm still learning, but I'll do my best to help. If I am not providing the correct answer for your question, please report it using the \"REPORT\" button!",
];
const greetings = [
    "Greetings, survivor!",
    "Hello there, adventurer!",
    "Welcome, traveler! How can I assist you today?",
    "Hey, survivor! Ready to dive into some DayZ knowledge?",
    "Greetings! What DayZ questions do you have?",
];
const inappropriateKeywords = ["porn", "sex", "racism", "politics", "jew", "nigger", "idiot", "morron", "retard", "cp", "shut up", "stfu", "fuck off", "bite me", "suck my dick", "dick", "pussy", "nigga", "nigg", "N word", "dickhead", "motherfucker", "dick head", "mother fucker", "asshole", "bastard", "moron", "idiot", "anal"];

// Weather-related responses
const weatherResponses = [
    "It's always good weather for gaming!",
    "Looks like it's sunny and perfect for a game!",
    "It might be raining outside, but the virtual weather is always perfect!",
    "Whatever the weather, stay indoors and game on!",
    "The weather's great for a gaming session!",
];

// Time-related responses
const timeResponses = [
    "It's game time, always!",
    "No matter the hour, it's a good time to play!",
    "Time flies when you're having fun in DayZ!",
    "It's the perfect time to dive into the game!",
    "Keep track of time, but never stop playing!",
    "Dont your PC or consol have a clock?",
    "Its time to STFU and game!",
    "The only time thats exist, is the time in the virtual world of games.",
    "Physicists define time as the progression of events from the past to the present into the future."
    
];

let isBotTyping = false;
let inappropriateWordCount = 0; // Variable to count inappropriate words

// Function to get a random greeting from the array
function getRandomGreeting() {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
}

// Function to get a random response from the array
function getRandomResponse() {
    const randomIndex = Math.floor(Math.random() * randomResponses.length);
    return randomResponses[randomIndex];
}

// Function to fetch JSON files
async function fetchJsonFile(category) {
    try {
        const response = await fetch(`${category}.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${category}.json: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${category}.json:`, error);
        return [];
    }
}

// Function to check for weather-related questions
function isWeatherRelatedQuestion(userMessage) {
    const weatherPhrases = [
        "how's the weather","hows the weater", "is it raining", "is it sunny", "is it cold", 
        "is it warm", "is it snowing", "is it windy", 
        "what's the weather like", "whats the weather like", "what's the temperature", "whats the temperature",
        "how hot is it", "how cold is it", "What's the weather like today", "Whats the weather like today", "What's the weather like in your country",
        "Whats the weather like in your country"
    ];

    return weatherPhrases.some(phrase => userMessage.includes(phrase));
}

// Function to get a random gaming-related weather response
function getRandomWeatherResponse() {
    const randomIndex = Math.floor(Math.random() * weatherResponses.length);
    return weatherResponses[randomIndex];
}

// Function to check for time-related questions
function isTimeRelatedQuestion(userMessage) {
    const timePhrases = [
        "what time is it", "what's the time", "whats the time", "current time",
        "what time do you have", "tell me the time", "whats the clock", "what's the clock",
        "how much is the clock", "the time", "the clock", "time", "clock"
    ];

    return timePhrases.some(phrase => userMessage.includes(phrase));
}

// Function to get a random gaming-related time response
function getRandomTimeResponse() {
    const randomIndex = Math.floor(Math.random() * timeResponses.length);
    return timeResponses[randomIndex];
}

// Function for menu questions
function askBot(question) {
    userInput.value = question;
    handleUserInput();
}

// Main function to handle user input
async function handleUserInput() {
    if (isBotTyping) {
        return;
    }
    const userMessage = userInput.value.trim().toLowerCase();
    let containsInappropriateKeyword = false;

    // Check for inappropriate keywords
    for (const keyword of inappropriateKeywords) {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (keywordRegex.test(userMessage)) {
            containsInappropriateKeyword = true;
            inappropriateWordCount++; // Increment count if an inappropriate word is found
            break;
        }
    }

    if (containsInappropriateKeyword) {
        if (inappropriateWordCount >= 3) {
            window.location.href = "https://youtu.be/L3HQMbQAWRc?t=29";
            return;
        }

        displayUserMessage("Message deleted", "color: red; font-weight: bold;");
        userInput.value = ""; // Clear the input field
        isBotTyping = true;
        const inappropriateResponses = [
            "That wasn't very nice...",
            "Oh my, you can't write that!",
            "Wash those fingers!",
            "I'm sorry, but I can't respond to inappropriate content.",
            "Inappropriate content is not welcome here.",
        ];
        const randomInappropriateResponse = inappropriateResponses[Math.floor(Math.random() * inappropriateResponses.length)];
        await simulateBotTyping(50, randomInappropriateResponse);
        await new Promise(resolve => setTimeout(resolve, 1000));
        isBotTyping = false;
        return;
    }

    // Check for greetings
    const greetingRegex = new RegExp(`\\b(hi|hello|hey|sup|what's up)\\b`, 'i');
    if (greetingRegex.test(userMessage)) {
        const randomGreeting = getRandomGreeting();
        displayUserMessage(userMessage);
        isBotTyping = true;
        await simulateBotTyping(50, randomGreeting);
        await new Promise(resolve => setTimeout(resolve, 1000));
        isBotTyping = false;
        userInput.value = ""; // Clear the input field
        return;
    }

    // Check for weather-related questions
    if (isWeatherRelatedQuestion(userMessage)) {
        userInput.value = ""; // Clear the input field
        displayUserMessage(userMessage);
        isBotTyping = true;
        await simulateBotTyping(50, getRandomWeatherResponse());
        await new Promise(resolve => setTimeout(resolve, 1000));
        isBotTyping = false;
        return;
    }

    // Check for time-related questions
    if (isTimeRelatedQuestion(userMessage)) {
        userInput.value = ""; // Clear the input field
        displayUserMessage(userMessage);
        isBotTyping = true;
        await simulateBotTyping(50, getRandomTimeResponse());
        await new Promise(resolve => setTimeout(resolve, 1000));
        isBotTyping = false;
        return;
    }

    // Handle general questions
    isBotTyping = true;
    const jsonCategoriesFiles = ["ammo_questions", "general_questions", "guns_questions", "medical_questions"];
    const jsonKeywordsFiles = ["keywords_ammo", "keywords_ar", "keywords_medical"];
    let question = userInput.value.trim();
    // Look for answers based on question
    if (question !== "") {
        displayUserMessage(question);
        userInput.value = "";
        let numberOfLetters = 0;
        question = cleanStringsKeepSpaces(question).toLowerCase();
        try {
            let checkQuestions = await checkJsonQuestions(question, jsonCategoriesFiles);
            let checkKeywords = false;
            if (checkQuestions.boolValue) {
                numberOfLetters = checkQuestions.intValue;
            } else {
                checkKeywords = await findBestAnswer(question, jsonKeywordsFiles);
                if (checkKeywords.boolValue) {
                    numberOfLetters = checkKeywords.intValue;
                }
            }
            if (!checkQuestions.boolValue && !checkKeywords.boolValue) {
                const randomResponse = getRandomResponse();
                numberOfLetters = countLetters(randomResponse);
                await new Promise(resolve => setTimeout(resolve, 70 * numberOfLetters));
                await simulateBotTyping(50, randomResponse);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (numberOfLetters !== 0) {
            await new Promise(resolve => setTimeout(resolve, 70 * numberOfLetters));
        }
        isBotTyping = false;
    }
}

// Function to clean strings
function cleanStringsKeepSpaces(string) {
    return string.replace(/[\u{0080}-\u{FFFF}]/gu, "").replace(/[^\w\s]/gi, "");
}

// Function to count letters in a string
function countLetters(string) {
    return string.replace(/[^a-zA-Z]/g, "").length;
}

// Function to simulate bot typing
async function simulateBotTyping(msPerLetter, message) {
    chatBox.innerHTML = ""; // Clear the chat box
    let typingMessage = "";
    for (let i = 0; i < message.length; i++) {
        typingMessage += message[i];
        chatBox.innerHTML = `<div class="message bot">${typingMessage}</div>`;
        await new Promise(resolve => setTimeout(resolve, msPerLetter));
    }
    chatBox.innerHTML = `<div class="message bot">${message}</div>`;
}

// Function to display user message
function displayUserMessage(message, style = "") {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "user");
    messageDiv.textContent = message;
    messageDiv.style = style;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to display bot message
function displayBotMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "bot");
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle the skip button click
skipButton.addEventListener("click", function (event) {
    event.stopPropagation();
    // Handle skip button click
});

// Add event listeners for buttons
sendBtn.addEventListener("click", handleUserInput);
userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        handleUserInput();
    }
});
reportButton.addEventListener("click", function () {
    const reportMessage = "Report this message";
    displayBotMessage(reportMessage);
    console.log("Report button clicked");
});
popoverButton.addEventListener("click", function () {
    const popoverContentText = "Popover content goes here!";
    popoverContent.textContent = popoverContentText;
    popoverContent.classList.toggle("show");
    console.log("Popover button clicked");
});
