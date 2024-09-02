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

const inappropriateKeywords = [
    "porn", "sex", "racism", "politics", "jew", "nigger", "idiot", "morron", "retard", "cp", "shut up", "stfu", "fuck off", "bite me", "suck my dick", "dick", "pussy", "nigga", "nigg", "N word", "dickhead", "motherfucker", "dick head", "mother fucker", "asshole", "bastard", "moron", "idiot", "anal"
];

const weatherResponses = [
    "Always time for gaming!",
    "Don't bother about the weather, every day is game day!",
    "Who needs weather updates when there's adventure to be had?",
];

const timeResponses = [
    "It's always time to explore!",
    "The time is now to dive into the game!",
    "Time is but a construct, let's focus on the game!",
];

let inappropriateWordCount = 0;

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

// Get random weather response
function getRandomWeatherResponse() {
    const randomIndex = Math.floor(Math.random() * weatherResponses.length);
    return weatherResponses[randomIndex];
}

// Get random time response
function getRandomTimeResponse() {
    const randomIndex = Math.floor(Math.random() * timeResponses.length);
    return timeResponses[randomIndex];
}

// Function to clean out strings
function cleanStringsKeepSpaces(input) {
    if (typeof input === 'string') {
        return input.replace(/[^a-zA-Z\s]/g, '');
    }
    console.error("Input is not a string");
    return '';
}

// Function to display user input after enter/click
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

    const skipButton = document.getElementById("skipButton");
    if (skipButton) {
        skipButton.textContent = "Skip";
        skipButton.classList.add("skip-button");
    } else {
        const newSkipButton = document.createElement("button");
        newSkipButton.id = "skipButton";
        newSkipButton.textContent = "Skip";
        newSkipButton.classList.add("skip-button");
        document.body.appendChild(newSkipButton);
    }

    document.getElementById("skipButton").addEventListener("click", (event) => {
        event.stopPropagation();
        clearInterval(typingInterval);
        displayResponse();
        console.log("Skip button clicked");
    });
}

// Function to handle the predefined questions from buttons
function askBot(question) {
    const userInput = document.getElementById("userInput");
    userInput.value = question;
    handleUserInput({ preventDefault: () => {} });
}

// Helper function to match the question directly to avoid multiple operations
async function checkJsonQuestions(question, jsonCategories) {
    try {
        for (const category of jsonCategories) {
            const response = await fetch(`${category}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${category}.json: ${response.status}`);
            }
            const jsonArray = await response.json();
            for (const jsonField of jsonArray) {
                const cleanedQuestion = cleanStringsKeepSpaces(question).toLowerCase();
                const cleanedFieldQuestion = cleanStringsKeepSpaces(jsonField["question"]).toLowerCase();
                if (cleanedQuestion === cleanedFieldQuestion) {
                    simulateBotTyping(50, jsonField["answer"]);
                    let numberOfLetters = countLetters(jsonField["answer"]);
                    const result = [numberOfLetters, true];
                    result.intValue = result[0];
                    result.boolValue = result[1];
                    return result; 
                }
            }
        }
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
        return [0, false];
    }
    return [0, false];
}

async function findBestAnswer(question, keywordsCategories) {
    try {
        let bestAnswer = null;
        let bestMatchScore = 0;
        for (const keyword of keywordsCategories) {
            const response = await fetch(`./${keyword}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ./${keyword}.json: ${response.status}`);
            }
            const jsonArray = await response.json();
            for (const jsonField of jsonArray) {
                const keywordString = jsonField["keyword"];
                if (typeof keywordString !== 'string') {
                    console.error("Invalid keyword format:", keywordString);
                    continue;
                }
                const keywordCombinations = keywordString.toLowerCase().split('+');
                let match = false;
                for (const keywordInCombinations of keywordCombinations) {
                    const regex = new RegExp(`\\b${keywordInCombinations}\\b`, 'i');
                    if (regex.test(question)) {
                        match = true;
                        break;
                    }
                }
                if (!match) {
                    for (const keywordInCombinations of keywordCombinations) {
                        let keywordArray = keywordInCombinations.split(" ");
                        for (const keyword of keywordArray) {
                            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                            if (regex.test(question)) {
                                match = true;
                                break;
                            }
                        }
                    }
                }
                if (match) {
                    const matchScore = checkQuestionMatch(question, keywordString);
                    if (matchScore > bestMatchScore) {
                        bestMatchScore = matchScore;
                        bestAnswer = jsonField["answer"];
                    }
                }
            }
        }
        if (bestAnswer !== null) {
            let delayForWords = bestAnswer.split(' ').length * 80;
            simulateBotTyping(delayForWords, bestAnswer);
            const result = [countLetters(bestAnswer), true];
            return result;
        }
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
    }
    return [0, false];
}

function checkQuestionMatch(question, keywordString) {
    const keywordCombinations = keywordString.split('+');
    let matchCount = 0;
    for (const keywordInCombinations of keywordCombinations) {
        if (question.toLowerCase().includes(keywordInCombinations.toLowerCase())) {
            matchCount++;
        }
    }
    return matchCount;
}

// Count the letters in a string
function countLetters(inputString) {
    return inputString.length;
}

// Main function to handle user input
async function handleUserInput(event) {
    event.preventDefault();
    let question = userInput.value.trim();
    if (!question) return;
    displayUserMessage(question);
    userInput.value = "";
    let cleanedQuestion = cleanStringsKeepSpaces(question);
    let containsInappropriateWord = inappropriateKeywords.some((keyword) =>
        cleanedQuestion.toLowerCase().includes(keyword.toLowerCase())
    );
    if (containsInappropriateWord) {
        inappropriateWordCount++;
        if (inappropriateWordCount > 2) {
            simulateBotTyping(50, "Your question contains inappropriate content. The chat is being terminated.");
            return;
        } else {
            simulateBotTyping(50, "Please avoid inappropriate language.");
            return;
        }
    }
    let delayForWords = question.split(' ').length * 50;
    if (question.toLowerCase().includes("weather")) {
        let response = getRandomWeatherResponse();
        await simulateBotTyping(delayForWords, response);
        return;
    }
    if (question.toLowerCase().includes("time")) {
        let response = getRandomTimeResponse();
        await simulateBotTyping(delayForWords, response);
        return;
    }
    let [numLetters, foundAnswer] = await checkJsonQuestions(question, ["questions"]);
    if (foundAnswer) {
        return;
    }
    let [bestAnswer, bestMatch] = await findBestAnswer(question, ["keywords"]);
    if (bestMatch) {
        return;
    }
    let botResponse = getRandomResponse();
    delayForWords = botResponse.split(' ').length * 50;
    await simulateBotTyping(delayForWords, botResponse);
}

// Event listeners
sendBtn.addEventListener("click", handleUserInput);
reportButton.addEventListener("click", () => {
    window.open('report.html', '_blank');
});
