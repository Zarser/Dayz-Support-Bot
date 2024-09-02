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

// Helper function to clean and normalize input strings
function cleanStringsKeepSpaces(input) {
    // Ensure input is a string
    if (typeof input !== 'string') {
        console.warn('Expected a string input, but got:', typeof input);
        return ''; // Return an empty string if the input is not a string
    }
    return input.replace(/[^\w\s]/gi, '').trim();
}

// Helper function to count the number of letters in a string
function countLetters(text) {
    return (text.match(/[a-zA-Z]/g) || []).length;
}

// Helper function to match the question directly to avoid multiple operations
async function checkJsonQuestions(question, jsonCategories) {
    try {
        for (const category of jsonCategories) {
            const jsonArray = await fetchJsonFile(category);
            console.log(`Checking category: ${category}`);
            for (const jsonField of jsonArray) {
                const jsonQuestion = cleanStringsKeepSpaces(jsonField["question"]).toLowerCase();
                if (question === jsonQuestion) {
                    console.log(`Match found for question: ${jsonField["question"]}`);
                    return { intValue: countLetters(jsonField["answer"]), boolValue: true };
                }
            }
        }
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
    }
    return { intValue: 0, boolValue: false };
}

// Helper function to find the best answer based on keyword combinations
async function findBestAnswer(question, keywordsCategories) {
    try {
        let bestAnswer = null;
        let bestMatchScore = 0;

        for (const file of keywordsCategories) {
            const jsonArray = await fetchJsonFile(file);
            console.log(`Checking keywords file: ${file}`);

            for (const jsonField of jsonArray) {
                const keywords = jsonField["keyword"] || [];
                const answer = jsonField["answer"];

                if (Array.isArray(keywords)) {
                    for (const keyword of keywords) {
                        if (question.includes(keyword.toLowerCase())) {
                            const matchScore = checkQuestionMatch(question, keywords.join(' '));
                            if (matchScore > bestMatchScore) {
                                bestMatchScore = matchScore;
                                bestAnswer = answer;
                                console.log(`Best match found: ${bestAnswer}`);
                            }
                        }
                    }
                } else if (typeof keywords === 'string' && question.includes(keywords.toLowerCase())) {
                    const matchScore = checkQuestionMatch(question, keywords);
                    if (matchScore > bestMatchScore) {
                        bestMatchScore = matchScore;
                        bestAnswer = answer;
                        console.log(`Best match found: ${bestAnswer}`);
                    }
                } else {
                    console.warn(`Expected 'keyword' to be an array or string, but got: ${typeof keywords}`);
                }
            }
        }

        if (bestAnswer) {
            return { boolValue: true, intValue: countLetters(bestAnswer) };
        }

    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
    }

    return { boolValue: false, intValue: 0 };
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

            if (numberOfLetters === 0) {
                const randomResponse = getRandomResponse();
                await simulateBotTyping(50, randomResponse);
            } else {
                const botAnswer = checkQuestions.boolValue ? checkQuestions.answer : checkKeywords.answer;
                await simulateBotTyping(50, botAnswer);
            }
        } catch (error) {
            console.error("Error handling user input:", error);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        isBotTyping = false;
    }
}

// Function to simulate bot typing
async function simulateBotTyping(speed, text) {
    const botMessage = document.createElement("div");
    botMessage.classList.add("bot-message");
    chatBox.appendChild(botMessage);

    let index = 0;
    const typingInterval = setInterval(() => {
        if (index < text.length) {
            botMessage.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(typingInterval);
        }
    }, speed);
}

// Function to display user messages
function displayUserMessage(message, style = "color: black;") {
    const userMessage = document.createElement("div");
    userMessage.classList.add("user-message");
    userMessage.textContent = message;
    userMessage.style = style;
    chatBox.appendChild(userMessage);
}

// Event listeners
sendBtn.addEventListener("click", handleUserInput);
userInput.addEventListener("keypress", function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleUserInput();
    }
});

popoverButton.addEventListener("click", function () {
    popoverContent.style.display = (popoverContent.style.display === 'none') ? 'block' : 'none';
});

reportButton.addEventListener("click", function () {
    window.location.href = "https://www.example.com/report";
});

checkTerms();
