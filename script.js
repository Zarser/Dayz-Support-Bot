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

window.onload = async function () {
    await new Promise(resolve => setTimeout(resolve, 1000));
    simulateBotTyping(50, getRandomGreeting());
};

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
        // Check if the count reaches 3
        if (inappropriateWordCount >= 3) {
            // Redirect the browser to the specified YouTube URL
            window.location.href = "https://youtu.be/L3HQMbQAWRc?t=29";
            return;
        }

        // Delete the inappropriate message and display a placeholder message
        displayUserMessage("Message deleted", "color: red; font-weight: bold;" );
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
        simulateBotTyping(50, randomGreeting).then(() => {
            return new Promise(resolve => setTimeout(resolve, 1000));
        }).then(() => {
            isBotTyping = false;
            userInput.value = ""; // Clear the input field
        });
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
            // First check questions
            let checkQuestions = await checkJsonQuestions(question, jsonCategoriesFiles);

            let checkKeywords = false;
            if (!checkQuestions.boolValue) {
                // If no question found in jsons, continue to keywords pairs and hope for the best
                checkKeywords = await findBestAnswer(question, jsonKeywordsFiles);
                if (checkKeywords.boolValue) {
                    numberOfLetters = checkKeywords.intValue;
                }
            } else {
                numberOfLetters = checkQuestions.intValue;
            }

            // If all fails, give user some random input.
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
        if (numberOfLetters != 0) {
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

// Function to display user input after enter/click
// Helper function to display user input
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
            console.log(`Fetching ${category}.json`); // Debugging line
            const response = await fetch(`./${category}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${category}.json: ${response.status}`);
            }
            const jsonArray = await response.json();
            console.log(`Data fetched from ${category}.json:`, jsonArray); // Debugging line

            for (const jsonField of jsonArray) {
                const questionVariants = [jsonField["question"].toLowerCase()].concat(jsonField["keywords"].map(keyword => keyword.toLowerCase()));
                for (const variant of questionVariants) {
                    if (question.includes(variant)) {
                        console.log(`Match found for question: ${variant}`);
                        await simulateBotTyping(50, jsonField["answer"]);
                        let numberOfLetters = countLetters(jsonField["answer"]);
                        const result = [numberOfLetters, true];
                        result.intValue = result[0];
                        result.boolValue = result[1];
                        return result;
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
    }
    return [0, false];
}

// Helper function to count letters in a string
function countLetters(string) {
    return string.replace(/ /g, "").length;
}

// Function to clean input strings, keeping only letters and spaces
function cleanStringsKeepSpaces(string) {
    return string.replace(/[^a-zA-Z\s]/g, "").trim();
}

// Find best answer based on keywords
async function findBestAnswer(question, jsonKeywordsFiles) {
    try {
        for (const category of jsonKeywordsFiles) {
            console.log(`Fetching ${category}.json`); // Debugging line
            const response = await fetch(`./${category}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${category}.json: ${response.status}`);
            }
            const jsonArray = await response.json();
            console.log(`Data fetched from ${category}.json:`, jsonArray); // Debugging line

            for (const jsonField of jsonArray) {
                const questionVariants = [jsonField["question"].toLowerCase()].concat(jsonField["keywords"].map(keyword => keyword.toLowerCase()));
                for (const variant of questionVariants) {
                    if (question.includes(variant)) {
                        console.log(`Match found for keyword: ${variant}`);
                        await simulateBotTyping(50, jsonField["answer"]);
                        let numberOfLetters = countLetters(jsonField["answer"]);
                        const result = [numberOfLetters, true];
                        result.intValue = result[0];
                        result.boolValue = result[1];
                        return result;
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error loading or parsing JSON:", error);
    }
    return [0, false];
}

popoverButton.addEventListener("click", function() {
    if (popoverContent.style.display === "none" || popoverContent.style.display === "") {
        popoverContent.style.display = "block";
    } else {
        popoverContent.style.display = "none";
    }
});

reportButton.addEventListener("click", function() {
    // Report button functionality here
    alert("Thank you for reporting. We will look into it.");
});
