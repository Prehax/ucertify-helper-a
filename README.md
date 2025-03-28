# ucertify-quiz-helper
only support choice questions

## demo
![demo](./pic/demo.png)

## course
- Advanced Database
- Predictive analytics: Data Mining, Machine Learning, and Data Science for Practitioners
- Project Management Professional (PMP) Based on PMBOK7

## usage
1. install [Tampermonkey](https://www.tampermonkey.net/)

[guide](https://www.tampermonkey.net/faq.php?locale=en#Q100)

2. install the script

click the link below

https://github.com/0guanhua0/ucertify-quiz-helper/raw/refs/heads/main/helper.user.js

[guide](https://www.tampermonkey.net/faq.php?locale=en#Q102)

3. check browser console

![console](./pic/console.png)

### chrome
please turn on developer mode

type [chrome://extensions/](chrome://extensions/) in the address

![chrome](./pic/chrome.png)

## retake
retake can refresh score

### after quiz
![retake](./pic/retake.png)

### from course
![retake](./pic/retake-0.png)
![retake](./pic/retake-1.png)

## support
please file issues for support

or to modify the database db.js, always run the check
```sh
guanhua@arch ~/ucertify-quiz-helper (git)-[main] % npm run format
```

## roadmap
- [ ] use cv to get info. for text app, use [ocr](https://en.wikipedia.org/wiki/Optical_character_recognition)
- [ ] use ai to understand the context and answer the question

## tips
ai can help development, but it can introduce bugs. these kind of bugs are hard to debug because it seems correct.

ai can provide general suggestions, but final decision should base on the project context.

for text app, it's hard to deal with special characters. for example
```
 
```

i can't see shit. but it's [U+00A0](https://www.compart.com/en/unicode/U+00A0)

https://en.wikipedia.org/wiki/Whitespace_character#Unicode

i use a simple func. bang my head into the wall to collect the info. should use lib
```javascript
function normalizeText(text) {
  return text
    .replace(/ /g, " ")
    .replace(/–/g, "-")
    .replace(/’/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"');
}
```

possible solution:
- hash. but it's exact match, so any change will break
- ai. flexible, but cost money

it's stupid to code database because it's easy to mess up and hard to debug. always run the full check before and after the change. i use .js as database just to make it easy for tampermonkey to pull the dependency.
