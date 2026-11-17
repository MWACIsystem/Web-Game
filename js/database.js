import { db } from "./firebase.js";
import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

/** Save one completed game. Firestore Rules validate the submitted fields. */
export async function saveGameResult({ playerName, playerUid, score, totalQuestions, durationSeconds }) {
  const cleanName = String(playerName ?? "").trim();

  if (!cleanName || cleanName.length > 40) {
    throw new Error("กรุณาตรวจสอบชื่อผู้เล่น (ไม่เกิน 40 ตัวอักษร)");
  }
  if (!Number.isInteger(score) || score < 0 || score > 100000) {
    throw new Error("รูปแบบคะแนนไม่ถูกต้อง");
  }
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 200) {
    throw new Error("จำนวนคำถามไม่ถูกต้อง");
  }
  if (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 86400) {
    throw new Error("ระยะเวลาเล่นไม่ถูกต้อง");
  }
  if (!playerUid) throw new Error("ยังไม่ได้ยืนยันตัวตนผู้เล่น");

  const result = await addDoc(collection(db, "gameResults"), {
    playerName: cleanName,
    playerUid,
    score,
    totalQuestions,
    durationSeconds,
    gameId: "demo-quiz-v1",
    playedAt: serverTimestamp()
  });

  return result.id;
}
