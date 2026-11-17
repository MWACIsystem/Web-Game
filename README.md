# Web Game Starter (GitHub Pages + Firebase)

This is a small demo quiz used to test GitHub Pages, Firebase Anonymous Authentication, and Cloud Firestore. The demo questions are placeholders and can be replaced with the actual game later.

## 1) Add your Firebase web config

Open `js/firebase.js` and replace the placeholder values in `firebaseConfig` with the configuration shown when you registered the Web App in Firebase Console.

Do not paste service-account private keys or Admin SDK credentials into this repository. The web config is intended for browser use; access is protected by Firebase Authentication and Firestore Security Rules.

## 2) Check Firebase settings

- Authentication > Sign-in method: enable **Anonymous**.
- Firestore: create the `(default)` database.
- Firestore Rules: publish rules that allow authenticated users to create valid `gameResults` documents while denying public reads, updates, and deletes.

The submitted document fields must match the rules:

- `playerName` (string)
- `playerUid` (string; must equal the signed-in user's UID)
- `score` (integer)
- `totalQuestions` (integer)
- `durationSeconds` (integer)
- `gameId` (string)
- `playedAt` (server timestamp)

## 3) Upload to GitHub

Upload all files and folders in this project to the root of your `web-game` repository. Keep the folder structure intact:

```text
index.html
style.css
js/firebase.js
js/database.js
js/game.js
js/app.js
```

## 4) Enable GitHub Pages

In the repository, open **Settings > Pages**.

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**
- Save

Wait for the Pages deployment to finish, then open the published URL.

## 5) Add the GitHub Pages domain to Firebase Auth

In Firebase Console, open **Authentication > Settings > Authorized domains** and add the host part of the GitHub Pages URL, for example:

`YOUR_GITHUB_USERNAME.github.io`

Add only the hostname, not `https://` and not the repository path.

## 6) Test one result

Open the published game, enter a name, answer all five demo questions, and finish the game. In Firebase Console, open **Firestore Database > Data** and check for a `gameResults` collection containing a new document.

## Important notes

- This demo does not yet include an Admin dashboard or Excel export. Firestore read access is intentionally denied to ordinary players. We will add a separate, protected Admin access path before building the export screen.
- Browser-based scores can be manipulated by a technically capable player. This starter is suitable for testing and low-stakes activities. Competitive or prize-bearing games should validate results on a trusted server.
- The Firebase web config is not a service-account secret. Never publish service-account JSON files, private keys, or Admin SDK credentials in a client-side GitHub repository.
