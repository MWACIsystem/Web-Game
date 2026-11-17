# Web Game – Mixed Image/Text Choices Update

This patch lets each answer choice be either regular text or an image. You can mix them within one question.

## Install

Replace these existing files in your GitHub repository:

- `js/app.js` → replace with `js/app.js` from this ZIP
- `style.css` → replace with `style.css` from this ZIP

Keep your existing `index.html`, `js/firebase.js`, `js/database.js`, and `js/game.js`.

## How to create a mixed question

In `js/game.js`, use a normal string for text answers and an object with `image` for an image answer:

```js
export const questions = [
  {
    question: "Which item is the water meter?",
    answers: [
      "Water bottle",
      { image: "assets/images/choice-02.png", alt: "Water meter" },
      "Water glass",
      "Water tank"
    ],
    correctIndex: 1
  }
];
```

- Text string → displays as a normal text choice.
- `{ image: "..." }` → displays as an image choice.
- `correctIndex` starts at 0.
- Put images in the repository folder `assets/images/`.
- Use paths relative to the website root, for example `assets/images/choice-02.png`.

The existing plain-text questions will continue to work without changes. Existing image-only question objects using `{ image: "..." }` will also work.
