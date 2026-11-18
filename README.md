WEB GAME - TEXT UPDATES FROM PRESENTATION1.PDF

Replace only these two files in your existing GitHub repository:
1. index.html (repository root)
2. js/app.js

No CSS changes are required. The existing style.css already styles .hero, .eyebrow, h1 and .intro.

What changed:
- Added IDs to the existing hero eyebrow, headline and subheadline so app.js can change them during the game lifecycle.
- After successful registration, the hero headline/subheadline change to the campaign copy from the PDF. The existing eyebrow is hidden during gameplay.
- When the game finishes, the hero changes to the thank-you headline/subheadline from the PDF.
- Removed the notice paragraph below the panels.
- Changed the footer text to "ฝสอ. | โทร 1268".
- Hid the saveStatus paragraph visually as requested in the PDF, but kept the element in the DOM because app.js still writes save progress/error text to it.
- Kept the existing result title, score, retry-save behavior, play-again button, header, registration form, game, Firebase logic and score logic unchanged.
- When the player clicks Play Again, the original registration hero text is restored.

IMPORTANT:
- Keep your existing js/firebase.js, js/database.js, js/game.js and style.css.
- Do not replace Firestore Rules.
- After committing, hard-refresh the GitHub Pages site (Ctrl+Shift+R).
