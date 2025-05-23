// ==UserScript==
// @name         ucertify-quiz-helper
// @namespace    https://github.com/0guanhua0/ucertify-quiz-helper
// @version      1.1.6
// @description  ucertify quiz helper script to highlight correct answers
// @author       0guanhua0@gmail.com
// @include      *ucertify*
// @require      https://raw.githubusercontent.com/0guanhua0/ucertify-quiz-helper/refs/heads/main/db.js
// ==/UserScript==

(function () {
  "use strict";

  let alreadyRun = false;

  function normalizeText(text) {
    return text
      .replace(/ /g, " ")
      .replace(/–/g, "-")
      .replace(/−/g, "-")
      .replace(/’/g, "'")
      .replace(/“/g, '"')
      .replace(/”/g, '"');
  }

  // find a quiz key that matches part of the question
  function matchKey(question, quiz) {
    for (let key in quiz) {
      if (question.includes(key)) {
        return key;
      }
    }
    return null;
  }

  // Main logic to run quiz helper
  function runHelper() {
    if (alreadyRun) {
      console.log("Script already ran, skipping execution");
      return;
    }
    alreadyRun = true;

    const questionElement = document.querySelector(
      '[data-itemtype="question"]',
    );
    if (!questionElement) {
      console.log("Question element not found");
      return;
    }

    let question = questionElement.innerText.trim();
    question = normalizeText(question);
    console.log(question);

    // Find a quiz key that matches part of the question
    const matchingKey = matchKey(question, quiz);

    // get answer
    const elements = document.querySelectorAll("#item_answer seq");
    for (let element of elements) {
      let text = element.innerText.trim();
      text = normalizeText(text);
      console.log(text);
    }

    if (!matchingKey) {
      console.log("no match in db");
      console.log(
        "issue: https://gitlab.com/0guanhua0/ucertify-quiz-helper/-/issues",
      );
      console.log(
        "issue: https://github.com/0guanhua0/ucertify-quiz-helper/issues",
      );
      console.log("email: 0guanhua0@gmail.com");
      return;
    }

    // highlight correct answer
    const ans = quiz[matchingKey];
    ans.forEach((value) => {
      for (let element of elements) {
        let text = element.innerText.trim();
        text = normalizeText(text);
        if (text === value) {
          element.style.backgroundColor = "#00ff00";
          console.log("Highlight answer:", value);
        }
      }
    });
  }

  // Observe DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        alreadyRun = false; // Reset the alreadyRun flag
        console.log("New content loaded, running quiz logic");
        runHelper();
      }
    });
  });

  // Start observing the body for DOM changes
  observer.observe(document.body, { childList: true, subtree: true });

  // Run the script when the page is loaded
  window.addEventListener("load", function () {
    console.log("Page loaded, running quiz logic");
    runHelper();
  });
})();
