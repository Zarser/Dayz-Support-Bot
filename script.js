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
        return await response.json();
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
sendBtn.addEventListener("click", handleUserInput);
userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleUserInput();
        console.log("Send button clicked");
    }
});

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

    // Create and append skip button to the document body
    const skipButton = document.getElementById("skipButton");
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
async function checkJsonQuestions(question, jsonCategories) {
    try {
        for (const category of jsonCategories) {
            const jsonArray = await fetchJsonFile(category);
            console.log(`Checking category: ${category}`);
            for (const jsonField of jsonArray) {
                if (jsonField && typeof jsonField["question"] === "string" && typeof jsonField["answer"] === "string") {
                    const jsonQuestion = cleanStringsKeepSpaces(jsonField["question"]).toLowerCase();
                    if (question === jsonQuestion) {
                        console.log(`Match found for question: ${jsonField["question"]}`);
                        simulateBotTyping(50, jsonField["answer"]);
                        let numberOfLetters = countLetters(jsonField["answer"]);
                        return { intValue: numberOfLetters, boolValue: true };
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
    }
    return { intValue: 0, boolValue: false };
}

// Helper function to match best answer based on keyword combinations
async function findBestAnswer(question, keywordsCategories) {
    try {
        let bestAnswer = null;
        let bestMatchScore = 0;
        for (const keyword of keywordsCategories) {
            const jsonArray = await fetchJsonFile(keyword);
            console.log(`Checking keywords file: ${keyword}`);
            for (const jsonField of jsonArray) {
                if (jsonField && typeof jsonField["keyword"] === "string" && typeof jsonField["answer"] === "string") {
                    const keywordCombinations = jsonField["keyword"].toLowerCase().split('+');
                    let match = keywordCombinations.some(keywordInCombinations => {
                        const regex = new RegExp(`\\b${keywordInCombinations}\\b`, 'i');
                        return regex.test(question);
                    });
                    if (match) {
                        const matchScore = checkQuestionMatch(question, jsonField["keyword"]);
                        if (matchScore > bestMatchScore) {
                            bestMatchScore = matchScore;
                            bestAnswer = jsonField["answer"];
                            console.log(`Best match found: ${bestAnswer}`);
                        }
                    }
                }
            }
        }
        if (bestAnswer) {
            simulateBotTyping(50, bestAnswer);
            let numberOfLetters = countLetters(bestAnswer);
            return { intValue: numberOfLetters, boolValue: true };
        }
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
    }
    return { intValue: 0, boolValue: false };
}

// Helper function to clean and normalize input strings
function cleanStringsKeepSpaces(input) {
    return input.replace(/[^\w\s]/gi, '').trim();
}

// Helper function to count the number of letters in a string
function countLetters(text) {
    return (text.match(/[a-zA-Z]/g) || []).length;
}

// Helper function to check the match score for a question
function checkQuestionMatch(userQuestion, keywordCombinationsString) {
    let occurrences = 0;
    const keywordCombinations = keywordCombinationsString.split('+');

    keywordCombinations.forEach(combo => {
        const comboKeywords = combo.split(' ');
        if (comboKeywords.every(keyword => userQuestion.includes(keyword))) {
            occurrences += 10; // Bonus for full match
        }
        comboKeywords.forEach(keyword => {
            if (userQuestion.includes(keyword)) {
                occurrences++;
            }
        });
    });

    return occurrences;
}

// Initialize the chatbox with a greeting
displayBotMessage(getRandomGreeting());

// Add event listener for the report button
reportButton.addEventListener("click", function () {
    const reportMessage = "Report this message";
    displayBotMessage(reportMessage);
    console.log("Report button clicked");
});

// Add event listener for the popover button
popoverButton.addEventListener("click", function () {
    const popoverContentText = "Popover content goes here!";
    popoverContent.textContent = popoverContentText;
    popoverContent.classList.toggle("show");
    console.log("Popover button clicked");
});

// Add event listener for the skip button
const skipButton = document.getElementById("skipButton");
skipButton.addEventListener("click", function (event) {
    event.stopPropagation();
    // Handle skip button click
});
