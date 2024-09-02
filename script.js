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

// Function to get a random greeting from the array
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

    // Handle greetings
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
            let checkQuestions = await searchInQuestions(question, jsonCategoriesFiles);
            let checkKeywords = false;
            if (checkQuestions.boolValue) {
                numberOfLetters = checkQuestions.intValue;
            } else {
                checkKeywords = await searchInKeywords(question, jsonKeywordsFiles);
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

// Helper function to match the question directly to answers
async function searchInQuestions(userQuestion, jsonFiles) {
    for (const jsonFile of jsonFiles) {
        const questions = await fetchJsonFile(jsonFile);
        const foundAnswer = questions.find((qa) => {
            const cleanedQuestion = cleanStringsKeepSpaces(qa.question).toLowerCase();
            return cleanedQuestion.includes(userQuestion);
        });

        if (foundAnswer) {
            const { answer } = foundAnswer;
            await simulateBotTyping(50, answer);
            return { boolValue: true, intValue: countLetters(answer) };
        }
    }
    return { boolValue: false, intValue: 0 };
}

// Helper function to match the question with keywords and find answers
async function searchInKeywords(userQuestion, jsonFiles) {
    for (const jsonFile of jsonFiles) {
        const keywordsList = await fetchJsonFile(jsonFile);
        for (const item of keywordsList) {
            const { keywords, answer } = item;
            if (Array.isArray(keywords) && keywords.some(keyword => userQuestion.includes(keyword.toLowerCase()))) {
                await simulateBotTyping(50, answer);
                return { boolValue: true, intValue: countLetters(answer) };
            }
        }
    }
    return { boolValue: false, intValue: 0 };
}

// Function to clean strings while keeping spaces between words
function cleanStringsKeepSpaces(str) {
    return str.replace(/[^a-zA-Z0-9\s]/g, '');
}

// Function to count letters in the response
function countLetters(response) {
    return response.replace(/\s/g, '').length;
}

sendBtn.addEventListener("click", handleUserInput);
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleUserInput();
    }
});

popoverButton.addEventListener("click", () => {
    popoverContent.classList.toggle("show");
});

reportButton.addEventListener("click", () => {
    window.location.href = "mailto:someone@example.com?subject=Report%20Issue";
});

// Trigger a random greeting when the page loads
window.onload = function() {
    const greetingMessage = getRandomGreeting();
    simulateBotTyping(50, greetingMessage);
};
