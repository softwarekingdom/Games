// ======================================
// NEON ARCADE - MAIN JAVASCRIPT
// ======================================

// LANGUAGE SYSTEM

const languageBtn = document.getElementById("languageBtn");

let currentLanguage = localStorage.getItem("arcadeLanguage") || "en";

function changeLanguage(language) {

    currentLanguage = language;

    document.documentElement.lang = language;

    const elements = document.querySelectorAll("[data-en][data-ta]");

    elements.forEach(element => {

        if (language === "ta") {
            element.textContent = element.dataset.ta;
        } else {
            element.textContent = element.dataset.en;
        }

    });

    languageBtn.textContent = language === "en" ? "தமிழ்" : "English";

    localStorage.setItem("arcadeLanguage", language);
}


// LANGUAGE BUTTON

languageBtn.addEventListener("click", () => {

    const newLanguage = currentLanguage === "en" ? "ta" : "en";

    changeLanguage(newLanguage);

});


// CURRENT YEAR

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


// INITIALIZE

changeLanguage(currentLanguage);