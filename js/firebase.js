// Firebase JavaScript SDK (Modular)
// Replace every placeholder in firebaseConfig with the values from Firebase Console.
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCzZ4G2zsPKKhZQhu5miAje-W2AENH0GYg",
  authDomain: "web-game-score.firebaseapp.com",
  projectId: "web-game-score",
  storageBucket: "web-game-score.firebasestorage.app",
  messagingSenderId: "482409246744",
  appId: "1:482409246744:web:e3595bdde4cca69cd8536d",
  measurementId: "G-8KJ3WFTCZE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function getAnonymousUser() {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}
