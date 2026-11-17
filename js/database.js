import { db } from "./firebase.js";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

function validateProfile({ fullName, phone, email, department, playerUid }) {
  const cleanName = String(fullName ?? "").trim();
  const cleanPhone = String(phone ?? "").trim();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanDepartment = String(department ?? "").trim();
  const phoneDigits = cleanPhone.replace(/\D/g, "");

  if (cleanName.length < 2 || cleanName.length > 120) {
    throw new Error("ชื่อ-นามสกุลไม่ถูกต้อง");
  }
  if (phoneDigits.length < 4 || phoneDigits.length > 15 || !/^[0-9+() .-]+$/.test(cleanPhone)) {
    throw new Error("เบอร์โทรศัพท์ไม่ถูกต้อง");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 120) {
    throw new Error("อีเมลไม่ถูกต้อง");
  }
  if (!cleanDepartment || cleanDepartment.length > 120) {
    throw new Error("หน่วยงานไม่ถูกต้อง");
  }
  if (!playerUid) throw new Error("ยังไม่ได้ยืนยันตัวตนผู้เล่น");

  return {
    fullName: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    department: cleanDepartment,
    playerUid
  };
}

/** Save or update the profile owned by the current anonymous Firebase user. */
export async function saveRegistration(profile) {
  const clean = validateProfile(profile);
  await setDoc(doc(db, "players", clean.playerUid), {
    ...clean,
    registeredAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/** Save one completed game together with a snapshot of the registration details. */
export async function saveGameResult({ fullName, phone, email, department, playerUid, score, totalQuestions, durationSeconds }) {
  const clean = validateProfile({ fullName, phone, email, department, playerUid });

  if (!Number.isInteger(score) || score < 0 || score > totalQuestions * 20) {
    throw new Error("รูปแบบคะแนนไม่ถูกต้อง");
  }
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 200) {
    throw new Error("จำนวนคำถามไม่ถูกต้อง");
  }
  if (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 86400) {
    throw new Error("ระยะเวลาเล่นไม่ถูกต้อง");
  }

  const result = await addDoc(collection(db, "gameResults"), {
    fullName: clean.fullName,
    playerName: clean.fullName, // Kept for compatibility with the original demo result field.
    phone: clean.phone,
    email: clean.email,
    department: clean.department,
    playerUid: clean.playerUid,
    score,
    totalQuestions,
    durationSeconds,
    gameId: "demo-quiz-v1",
    playedAt: serverTimestamp()
  });

  return result.id;
}
