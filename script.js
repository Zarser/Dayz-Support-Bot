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
                        console.log("Best answer:" + bestAnswer);
                    }
                }
            }
        }
        if (bestAnswer) {
            simulateBotTyping(50, bestAnswer);
            let numberOfLetters = countLetters(bestAnswer);
            const result = [numberOfLetters, true];
            result.intValue = result[0];
            result.boolValue = result[1];
            return result;
        }
        return [0, false];
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
        return [0, false];
    }
}

function checkQuestionMatch(userQuestion, keywordCombinationsString) {
    let occurrences = 0;
    keywordCombinationsString.split('+').forEach(keywordCombo => {
        if (userQuestion === keywordCombo) {
            return 100;
        }
        const comboKeywordsArray = keywordCombo.split('+');
        comboKeywordsArray.forEach(keyword => {
            if (userQuestion.includes(keyword)) {
                occurrences++;
            }
        });
    });
    keywordCombinationsString.split('+').forEach(keyword => {
        const cleanedKeywordArray = keyword.split(" ");
        cleanedKeywordArray.forEach(cleanedKeyword => {
            if (userQuestion === cleanedKeyword) {
                return 100;
            }
            const regex = new RegExp(`\\b${cleanedKeyword}\\b`, 'i');
            if (regex.test(userQuestion)) {
                occurrences++;
            }
        });
    });
    return occurrences;
}

// Helper function to count letters
function countLetters(sentence) {
    return sentence.length;
}

// Handle weather or time queries
function handleWeatherOrTime(query) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("weather")) {
        const response = getRandomWeatherResponse();
        simulateBotTyping(50, response);
        return true;
    }
    if (lowerQuery.includes("time")) {
        const response = getRandomTimeResponse();
        simulateBotTyping(50, response);
        return true;
    }
    return false;
}

async function handleUserInput(event) {
    event.preventDefault();
    const userQuestion = userInput.value.trim();
    displayUserMessage(userQuestion);

    // Handle weather or time queries
    if (handleWeatherOrTime(userQuestion)) {
        userInput.value = "";
        return;
    }

    // Handle inappropriate content
    const cleanedQuestion = cleanStringsKeepSpaces(userQuestion).toLowerCase();
    if (inappropriateKeywords.some(keyword => cleanedQuestion.includes(keyword))) {
        inappropriateWordCount++;
        if (inappropriateWordCount >= 3) {
            simulateBotTyping(50, getRandomResponse());
            userInput.value = "";
            return;
        }
    }

    // Check JSON questions
    const [numberOfLetters, found] = await checkJsonQuestions(userQuestion, ["questions", "faqs"]);
    if (found) {
        userInput.value = "";
        return;
    }

    // Find the best answer
    const [bestAnswerCount, foundBestAnswer] = await findBestAnswer(userQuestion, ["keywords", "terms"]);
    if (foundBestAnswer) {
        userInput.value = "";
        return;
    }

    // Default response
    simulateBotTyping(50, getRandomResponse());
    userInput.value = "";
}

sendBtn.addEventListener("click", handleUserInput);
userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        handleUserInput(event);
    }
});

popoverButton.addEventListener("click", () => {
    popoverContent.classList.toggle("show");
});

reportButton.addEventListener("click", () => {
    const bugReportWindow = window.open(
        "report_form.html",
        "Bug Report",
        "width=700,height=500,left=" + (window.innerWidth / 2 - 200) + ",top=" + (window.innerHeight / 2 - 250)
    );
    bugReportWindow.focus();
});
