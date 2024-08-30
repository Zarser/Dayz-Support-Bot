const agreeCheckbox = document.getElementById("agreeCheckbox");
const continueButton = document.getElementById("continueButton");

continueButton.addEventListener("click", () => {
    if (agreeCheckbox.checked) {
        // Set a flag in local storage to indicate agreement
        localStorage.setItem("agreedToTerms", "true");
        // Redirect to the chatbot interface
        window.location.href = "index.html";
    } else {
        alert("Please agree to the terms and conditions to proceed.");
    }
});