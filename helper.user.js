// ==UserScript==
// @name         ucertify-quiz-helper
// @namespace    https://gitlab.com/0guanhua0/ucertify-quiz-helper
// @version      1.1.0
// @description  ucertify quiz helper script to highlight correct answers
// @author       0guanhua0@gmail.com
// @include      *ucertify*
// @require      https://gitlab.com/0guanhua0/ucertify-quiz-helper/-/raw/main/db.js?ref_type=heads
// ==/UserScript==

(function () {
  "use strict";

  let alreadyRun = false;

  /**
 * 防抖函数
 * @param {Function} func - 需要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} - 返回一个防抖后的函数
 */
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId); // 清除之前的定时器
      timeoutId = setTimeout(() => {
        func.apply(this, args); // 延迟执行函数
      }, delay);
    };
  }

  function printLocalStorage() {
    const storageObject = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let value = localStorage.getItem(key);

      try {
        value = JSON.parse(value); // 尝试解析 JSON
      } catch (e) {
        // 如果解析失败，说明是普通字符串，保持原样
      }

      storageObject[key] = value;
    }

    console.log(JSON.stringify(storageObject, null, 2));
  }

  function normalizeText(text) {
    return text
      .replace(/ /g, " ")
      .replace(/–/g, "-")
      .replace(/−/g, "-")
      .replace(/’/g, "'")
      .replace(/“/g, '"')
      .replace(/”/g, '"');
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

    // this is question
    console.log(question);

    // get answer
    let answers = [];
    const elements = document.querySelectorAll("#item_answer seq");
    for (let element of elements) {
      let text = element.innerText.trim();
      text = normalizeText(text);
      // this is answer list
      console.log(text);
      answers.push(text)
    }

    // Check ans-alert
    const ansAlert = document.getElementById('ans-alert');

    if (ansAlert) {
      console.log("This is in review page, update quiz db");

      const correctMarkers = [
        "and this is marked as correct",
        "and this is correct answer"
      ];

      // got correct answers
      const correctAnswers = answers.filter(answer =>
        correctMarkers.some(marker => answer.includes(marker))
      );

      // delete the marker
      const cleanedAnswers = correctAnswers.map(answer => {
        for (const marker of correctMarkers) {
          if (answer.includes(marker)) {
            return answer.replace(new RegExp(`${marker}`), "").trim();
          }
        }
        return answer;
      });

      console.log("correct answers are:", cleanedAnswers);
      // quiz[question] = cleanedAnswers;
      if (!localStorage.getItem(question)) {
        localStorage.setItem(question, JSON.stringify(cleanedAnswers));
        printLocalStorage();
      }
    }

    // highlight correct answer
    let ans = JSON.parse(localStorage.getItem(question));
    ans.forEach((value) => {
      for (let element of elements) {
        let text = element.innerText.trim();
        text = normalizeText(text);
        if (text === value) {
          element.style.backgroundColor = "#00ff00";
          console.log("Highlight answer:", value);
          break;
        }
      }
    });
  }

  const debouncedRunHelper = debounce(runHelper, 300);

  // 在 MutationObserver 中使用防抖函数
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        alreadyRun = false; // 重置 alreadyRun 标志
        console.log("New content loaded, running quiz logic (debounced)");
        debouncedRunHelper(); // 使用防抖函数
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
