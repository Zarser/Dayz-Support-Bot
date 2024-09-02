function checkTerms() {
    try {
        if (!localStorage.getItem("agreedToTerms")) {
            window.location.replace("pre_screen.html");
        }
    } catch (error) {
        console.error("Error accessing local storage:", error);
    }
}

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const popoverButton = document.getElementById("popoverButton");
const popoverContent = document.getElementById("popoverContent");
const reportButton = document.getElementById("reportButton");

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
let isBotTyping = false;
let inappropriateWordCount = 0; // Variable to count inappropriate words

// Function to get random greeting from the array
function getRandomGreeting() {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
}

// Get random response from the array
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
        const jsonData = await response.json();
        console.log(`Fetched data for ${category}:`, jsonData); // Log fetched data
        return jsonData;
    } catch (error) {
        console.error(`Error fetching ${category}.json:`, error);
        return [];
    }
}

// Main function to handle user input
async function handleUserInput() {
    if (isBotTyping) return;

    const userMessage = userInput.value.trim().toLowerCase();
    let containsInappropriateKeyword = containsInappropriateKeywords(userMessage);

    if (containsInappropriateKeyword) {
        handleInappropriateMessage();
        return;
    }

    // Handle greetings
    if (isGreeting(userMessage)) {
        await respondWithGreeting(userMessage);
        return;
    }

    isBotTyping = true;

    const questionCategories = ["ammo_questions", "general_questions", "guns_questions", "medical_questions"];
    const keywordCategories = ["keywords_ammo", "keywords_ar", "keywords_medical"];

    let question = cleanStringsKeepSpaces(userInput.value.trim().toLowerCase());
    displayUserMessage(question);
    userInput.value = "";

    try {
        let responseFound = await searchInQuestions(question, questionCategories);
        
        if (!responseFound) {
            responseFound = await searchInKeywords(question, keywordCategories);
        }
        
        if (!responseFound) {
            await respondWithRandomMessage();
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }

    isBotTyping = false;
}

// Function to search in question JSON files
async function searchInQuestions(question, categories) {
    for (const category of categories) {
        const result = await checkJsonQuestions(question, category);
        if (result.boolValue) return true;
    }
    return false;
}

// Function to search in keyword JSON files
async function searchInKeywords(question, categories) {
    for (const category of categories) {
        const result = await findBestAnswer(question, category);
        if (result.boolValue) return true;
    }
    return false;
}

// Function to handle inappropriate messages
function handleInappropriateMessage() {
    inappropriateWordCount++;
    if (inappropriateWordCount >= 3) {
        window.location.href = "https://youtu.be/L3HQMbQAWRc?t=29";
        return;
    }

    displayUserMessage("Message deleted", "color: red; font-weight: bold;");
    userInput.value = "";
    respondWithInappropriateMessage();
}

// Function to check if the message is a greeting
function isGreeting(message) {
    const greetingRegex = new RegExp(`\\b(hi|hello|hey|sup|what's up)\\b`, 'i');
    return greetingRegex.test(message);
}

// Function to respond with a random greeting
async function respondWithGreeting(message) {
    displayUserMessage(message);
    const randomGreeting = getRandomGreeting();
    await simulateBotTyping(50, randomGreeting);
    userInput.value = "";
}

// Function to respond with a random message
async function respondWithRandomMessage() {
    const randomResponse = getRandomResponse();
    await simulateBotTyping(50, randomResponse);
}

// Function to check if the message contains inappropriate keywords
function containsInappropriateKeywords(message) {
    return inappropriateKeywords.some(keyword => {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        return keywordRegex.test(message);
    });
}

// Function to respond with an inappropriate message
async function respondWithInappropriateMessage() {
    const inappropriateResponses = [
        "That wasn't very nice...",
        "Oh my, you can't write that!",
        "Wash those fingers!",
        "I'm sorry, but I can't respond to inappropriate content.",
        "Inappropriate content is not welcome here.",
    ];
    const randomInappropriateResponse = inappropriateResponses[Math.floor(Math.random() * inappropriateResponses.length)];
    await simulateBotTyping(50, randomInappropriateResponse);
}

// Helper function to display user input after enter/click
function displayUserMessage(message, style = "") {
    const userMessage = `<div class="user-message" style="color: white;"><strong>Creature</strong>: <span style="${style}">${message}</span></div>`;
    chatBox.innerHTML += userMessage;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Helper function to display bot output
function displayBotMessage(message) {
    const botMessage = `<div class="bot-message">
    <img src="bot.png" alt="Robot" class="bot-avatar">
    <span class="bot-text">${message}</span>
</div>`;
    chatBox.innerHTML += botMessage;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Functionality to simulate bot typing look-alike
async function simulateBotTyping(delayForWords, botResponse) {
    const typingElement = document.createElement("div");
    typingElement.classList.add("bot-message", "bot-typing");
    chatBox.appendChild(typingElement);
    let currentCharIndex = 0;
    let typingInterval;

    function displayResponse() {
        clearInterval(typingInterval);
        if (typingElement.parentElement === chatBox) {
            chatBox.removeChild(typingElement);
            displayBotMessage(botResponse);
        }
    }

    typingInterval = setInterval(() => {
        if (currentCharIndex <= botResponse.length) {
            typingElement.innerHTML = `<span class="typing-color">${botResponse.substring(0, currentCharIndex)}</span>`;
            chatBox.scrollTop = chatBox.scrollHeight;
            currentCharIndex++;
        } else {
            displayResponse();
        }
    }, delayForWords);

    // Remove existing skip button if it exists
    const existingSkipButton = document.getElementById("skipButton");
    if (existingSkipButton) {
        existingSkipButton.remove();
    }

    // Create and append skip button to the document body
    const skipButton = document.createElement("button");
    skipButton.id = "skipButton";
    skipButton.textContent = "Skip";
    skipButton.classList.add("skip-button");
    document.body.appendChild(skipButton);

    // Event listener to remove typing effect and display full message when skip button is clicked
    skipButton.addEventListener("click", (event) => {
        event.stopPropagation();
        clearInterval(typingInterval);
        displayResponse();
        console.log("Skip button clicked");
    });
}

// Helper function to match the question directly to avoid multiple operations
async function checkJsonQuestions(question, category) {
    try {
        const jsonArray = await fetchJsonFile(category);
        for (const jsonField of jsonArray) {
            const jsonQuestion = cleanStringsKeepSpaces(jsonField["question"]).toLowerCase();
            if (question === jsonQuestion) {
                await simulateBotTyping(50, jsonField["answer"]);
                return { intValue: countLetters(jsonField["answer"]), boolValue: true };
            }
        }
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
    }
    return { intValue: 0, boolValue: false };
}

// Search for the best matching answer based on keywords
async function findBestAnswer(question, category) {
    try {
        const jsonArray = await fetchJsonFile(category);
        let bestAnswer = null;
        let bestMatchScore = 0;

        for (const jsonField of jsonArray) {
            if (Array.isArray(jsonField["keywords"]) && typeof jsonField["answer"] === "string") {
                const keywordsArray = jsonField["keywords"];
                const match = keywordsArray.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(question));

                if (match) {
                    const matchScore = checkQuestionMatch(question, keywordsArray.join(' '));
                    if (matchScore > bestMatchScore) {
                        bestMatchScore = matchScore;
                        bestAnswer = jsonField["answer"];
                    }
                }
            } else {
                console.warn(`Skipping entry due to missing or malformed data: keywords=${typeof jsonField["keywords"]}, answer=${typeof jsonField["answer"]}`);
            }
        }

        if (bestAnswer) {
            await simulateBotTyping(50, bestAnswer);
            return { intValue: countLetters(bestAnswer), boolValue: true };
        }
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
    }
    return { intValue: 0, boolValue: false };
}

// Utility function to clean the input string
function cleanStringsKeepSpaces(str) {
    const regex = /[^\w\s]/gi;
    return str.replace(regex, "");
}

// Check and match question using custom logic
function checkQuestionMatch(question, keywords) {
    const keywordsArray = keywords.split(" ");
    let matchCount = 0;
    for (const keyword of keywordsArray) {
        if (question.includes(keyword)) {
            matchCount++;
        }
    }
    return matchCount;
}

// Count letters
function countLetters(answer) {
    return answer.length;
}

// Function to open the popover when clicked
popoverButton.addEventListener("click", () => {
    popoverContent.classList.toggle("show");
});

// Close the popover if the user clicks outside of it
document.addEventListener("click", (event) => {
    if (!popoverButton.contains(event.target)) {
        popoverContent.classList.remove("show");
    }
});

// Enter button activation for text field
userInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        handleUserInput();
    }
});

// Button activation for send button
sendBtn.addEventListener("click", function () {
    handleUserInput();
});

// Reload the window for the report button
reportButton.addEventListener("click", function () {
    location.reload();
});

