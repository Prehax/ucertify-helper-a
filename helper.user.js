// ==UserScript==
// @name         uc-cloud
// @namespace    https://gitlab.com/0guanhua0/ucertify-quiz-helper
// @version      1.1.0
// @description  ucertify quiz helper script to highlight correct answers
// @author       0guanhua0@gmail.com
// @include      *ucertify*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(async function () {
  "use strict";

  function addQAPairToCloud(key, valueArray) {
    GM_xmlhttpRequest({
      method: "POST",
      url: "http://127.0.0.1:3000/add",
      headers: {
        "Content-Type": "application/json"
      },
      data: JSON.stringify({
        key: key,
        value: valueArray
      }),
      onload: function (response) {
        console.log("Response:", response.responseText);
      },
      onerror: function (error) {
        console.log("Error:", error);
      }
    });
  }

  function getAnswersFromCloud(question) {
    const url = "http://127.0.0.1:3000/get"; 
  
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url: url,
        headers: {
          "Content-Type": "application/json"
        },
        data: JSON.stringify({ key: question }), 
        onload: function (response) {
          try {
            let data = JSON.parse(response.responseText);
  
            if (data.value && Array.isArray(data.value)) {
              console.log("Response:", data);
              resolve(data.value); 
            } else {
              console.log("Invalid response format, expected an array:", data);
              resolve([]); 
            }
          } catch (error) {
            console.log("Error parsing response:", error);
            reject(error);
          }
        },
        onerror: function (error) {
          console.log("Error:", error);
          reject(error);
        }
      });
    });
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

  function getQuestion() {
    const questionElement = document.querySelector(
      '[data-itemtype="question"]'
    );
    if (!questionElement) {
      console.log("Question element not found");
      return null;
    }

    let question = questionElement.innerText.trim();
    return normalizeText(question);
  }

  function getAnswers() {
    let answers = [];
    const elements = document.querySelectorAll("#item_answer seq");
    for (let element of elements) {
      let text = element.innerText.trim();
      text = normalizeText(text);
      answers.push(text);
    }
    console.log("Extracted answers:", answers);
    return answers;
  }

  const correctMarkers = [
    "and this is marked as correct",
    "and this is correct answer"
  ];

  function cleanAnswer(answer) {
    for (const marker of correctMarkers) {
      if (answer.includes(marker)) {
        return answer.replace(new RegExp(`${marker}`), "").trim();
      }
    }
    return answer;
  }

  async function runHelper() {
    // 获取问题
    let question = getQuestion();
    if (!question) return;

    // 获取答案列表
    let answers = getAnswers();
    if (!answers.length) return;

    // 检查是否处于复习模式
    const ansAlert = document.getElementById("ans-alert");
    if (ansAlert) {
      console.log("This is in review page, updating quiz database.");

      // 提取正确答案
      const correctAnswers = answers.filter(answer =>
        correctMarkers.some(marker => answer.includes(marker))
      );

      // 清理答案文本
      const cleanedAnswers = correctAnswers.map(answer => cleanAnswer(answer));
      console.log("Correct answers:", cleanedAnswers);

      try {
        let cloudAnswer = await getAnswersFromCloud(question);
        if (!cloudAnswer || cloudAnswer.length === 0) {
          addQAPairToCloud(question, cleanedAnswers);
          console.log("Added new question-answer pair to cloud.");
        } else {
          console.log("Question already exists in cloud, skipping upload.");
        }
      } catch (error) {
        console.log("Error checking cloud answers:", error);
      }
    }

    // 高亮正确答案
    const elements = document.querySelectorAll("#item_answer seq");
    try {
      let fetchedAnswers = await getAnswersFromCloud(question);
      console.log("Fetched answers from cloud:", fetchedAnswers);

      fetchedAnswers.forEach((value) => {
        for (let element of elements) {
          let text = cleanAnswer(element.innerText).trim();
          text = normalizeText(text);
          if (text === value) {
            element.style.backgroundColor = "#00ff00";
            console.log("Highlighted correct answer:", value);
            break;
          }
        }
      });
    } catch (error) {
      console.log("Error fetching answers from cloud:", error);
    }
  }

  // MutationObserver 监听页面变化，防止内容动态加载后脚本失效
  const observer = new MutationObserver(() => {
    console.log("Detected content update, running quiz logic.");
    runHelper();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("load", function () {
    console.log("Page loaded, running quiz logic.");
    runHelper();
  });
})();
