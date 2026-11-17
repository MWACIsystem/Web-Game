import { getAnonymousUser } from "./firebase.js";
import { saveRegistration, saveGameResult } from "./database.js";
import { questions } from "./game.js";

const $ = (id) => document.getElementById(id);
const statusEl = $("connectionStatus");
const startPanel = $("startPanel");
const gamePanel = $("gamePanel");
const resultPanel = $("resultPanel");
const startForm = $("startForm");
const fullNameInput = $("fullName");
const phoneInput = $("phone");
const emailInput = $("email");
const departmentInput = $("department");
const questionText = $("questionText");
const answerList = $("answerList");
const questionCounter = $("questionCounter");
const scoreCounter = $("scoreCounter");
const progressValue = $("progressValue");
const feedback = $("feedback");
const nextButton = $("nextButton");
const resultScore = $("resultScore");
const saveStatus = $("saveStatus");
const retrySaveButton = $("retrySaveButton");
const playAgainButton = $("playAgainButton");

let playerProfile = null;
let playerUid = "";
let questionIndex = 0;
let score = 0;
let startedAt = 0;
let durationSeconds = 0;
let hasAnswered = false;
let saveCompleted = false;
let isSaving = false;

function show(element) { element.classList.remove("hidden"); }
function hide(element) { element.classList.add("hidden"); }

function setStatus(message) {
  statusEl.textContent = message;
}

function setBusy(button, busy, busyText = "กำลังดำเนินการ…") {
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function collectRegistration() {
  const profile = {
    fullName: fullNameInput.value.trim(),
    phone: phoneInput.value.trim(),
    email: emailInput.value.trim().toLowerCase(),
    department: departmentInput.value.trim()
  };

  if (profile.fullName.length < 2 || profile.fullName.length > 120) {
    throw new Error("กรุณากรอกชื่อ-นามสกุลให้ถูกต้อง");
  }

  const phoneDigits = profile.phone.replace(/\D/g, "");
  if (phoneDigits.length < 4 || phoneDigits.length > 15 || !/^[0-9+() .-]+$/.test(profile.phone)) {
    throw new Error("กรุณาตรวจสอบเบอร์โทรศัพท์ สามารถกรอกเบอร์ภายในหรือเบอร์ส่วนตัวได้");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) || profile.email.length > 120) {
    throw new Error("กรุณากรอกอีเมลให้ถูกต้อง");
  }

  if (!profile.department || profile.department.length > 120) {
    throw new Error("กรุณากรอกหน่วยงาน");
  }

  if (!$('privacyAcknowledged').checked) {
    throw new Error("กรุณารับทราบวัตถุประสงค์การใช้ข้อมูลก่อนเริ่มเล่น");
  }

  return profile;
}

async function startGame(event) {
  event.preventDefault();

  let profile;
  try {
    profile = collectRegistration();
  } catch (error) {
    alert(error.message);
    return;
  }

  const submitButton = startForm.querySelector("button[type='submit']");
  setBusy(submitButton, true, "กำลังลงทะเบียน…");
  setStatus("กำลังบันทึกข้อมูลผู้เข้าร่วม…");

  try {
    const user = await getAnonymousUser();
    playerUid = user.uid;

    await saveRegistration({ ...profile, playerUid });
    playerProfile = profile;

    questionIndex = 0;
    score = 0;
    startedAt = Date.now();
    saveCompleted = false;
    isSaving = false;

    hide(startPanel);
    hide(resultPanel);
    show(gamePanel);
    setStatus("ลงทะเบียนเรียบร้อย พร้อมเล่น");
    renderQuestion();
  } catch (error) {
    console.error("Registration or authentication failed:", error);
    setStatus("ลงทะเบียนไม่สำเร็จ");
    alert(`ไม่สามารถลงทะเบียนได้: ${error.message || "กรุณาลองใหม่อีกครั้ง"}`);
  } finally {
    setBusy(submitButton, false);
  }
}

function renderQuestion() {
  const current = questions[questionIndex];
  hasAnswered = false;
  questionCounter.textContent = `ข้อ ${questionIndex + 1} / ${questions.length}`;
  scoreCounter.textContent = `คะแนน ${score}`;
  progressValue.style.width = `${(questionIndex / questions.length) * 100}%`;
  questionText.textContent = current.question;
  answerList.replaceChildren();
  feedback.textContent = "";
  feedback.className = "feedback";
  hide(nextButton);

  current.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.setAttribute("aria-label", `ตัวเลือกที่ ${index + 1}`);

    // Mixed choices are supported:
    // - Text: "ตัวเลือกข้อความ"
    // - Image: { image: "assets/images/choice-01.png", alt: "คำอธิบายภาพ" }
    // - Also accepts { text: "ตัวเลือกข้อความ" }
    const isImageChoice = answer && typeof answer === "object"
      && (typeof answer.image === "string" || typeof answer.src === "string");

    if (isImageChoice) {
      const imagePath = answer.image || answer.src;
      const image = document.createElement("img");
      image.className = "answer-image";
      image.src = imagePath;
      image.alt = answer.alt || `ภาพตัวเลือกที่ ${index + 1}`;
      image.loading = "lazy";
      image.decoding = "async";

      image.addEventListener("error", () => {
        button.classList.add("image-error");
        button.setAttribute("aria-label", `โหลดรูปตัวเลือกที่ ${index + 1} ไม่สำเร็จ`);
        console.error(`Could not load answer image: ${imagePath}`);
      }, { once: true });

      button.append(image);
      button.setAttribute("aria-label", answer.alt || `ตัวเลือกภาพที่ ${index + 1}`);
    } else {
      const answerText = typeof answer === "string"
        ? answer
        : (answer?.text || `ตัวเลือกที่ ${index + 1}`);
      button.classList.add("answer-text");
      button.textContent = answerText;
    }
    button.addEventListener("click", () => chooseAnswer(index));
    answerList.append(button);
  });
}

function chooseAnswer(selectedIndex) {
  if (hasAnswered) return;
  hasAnswered = true;
  const current = questions[questionIndex];
  const buttons = [...answerList.querySelectorAll("button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === current.correctIndex) button.classList.add("correct");
    if (index === selectedIndex && selectedIndex !== current.correctIndex) {
      button.classList.add("incorrect");
    }
  });

  if (selectedIndex === current.correctIndex) {
    score += 1;
    feedback.textContent = "ถูกต้อง! +1 คะแนน";
    feedback.classList.add("good");
  } else {
    feedback.textContent = "ยังไม่ถูก ลองข้อถัดไปนะ";
    feedback.classList.add("bad");
  }
  scoreCounter.textContent = `คะแนน ${score}`;
  nextButton.textContent = questionIndex === questions.length - 1 ? "ดูผลคะแนน" : "ข้อต่อไป";
  show(nextButton);
}

function finishGame() {
  hide(gamePanel);
  show(resultPanel);
  durationSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  resultScore.textContent = `${score} / ${questions.length} คะแนน`;
  $("resultTitle").textContent = `ขอบคุณที่ร่วมเล่นนะ ${playerProfile.fullName}!`;
  progressValue.style.width = "100%";
  saveCompleted = false;
  retrySaveButton.classList.add("hidden");
  saveResult();
}

async function saveResult() {
  if (saveCompleted || isSaving) return;
  isSaving = true;
  retrySaveButton.classList.add("hidden");
  saveStatus.textContent = "กำลังบันทึกผลการเล่น…";

  try {
    await saveGameResult({
      ...playerProfile,
      playerUid,
      score,
      totalQuestions: questions.length,
      durationSeconds
    });
    saveCompleted = true;
    saveStatus.textContent = "บันทึกข้อมูลและคะแนนเรียบร้อยแล้ว ขอบคุณที่ร่วมกิจกรรม!";
    setStatus("บันทึกผลสำเร็จ");
  } catch (error) {
    console.error("Could not save game result:", error);
    saveStatus.textContent = `บันทึกไม่สำเร็จ: ${error.message || "เกิดข้อผิดพลาด"}`;
    show(retrySaveButton);
    setStatus("บันทึกผลไม่สำเร็จ");
  } finally {
    isSaving = false;
  }
}

function resetGame() {
  hide(resultPanel);
  show(startPanel);
  if (playerProfile) {
    fullNameInput.value = playerProfile.fullName;
    phoneInput.value = playerProfile.phone;
    emailInput.value = playerProfile.email;
    departmentInput.value = playerProfile.department;
    $("privacyAcknowledged").checked = true;
  }
  setStatus("พร้อมลงทะเบียนและเล่นอีกครั้ง");
  fullNameInput.focus();
}

startForm.addEventListener("submit", startGame);
nextButton.addEventListener("click", () => {
  if (questionIndex < questions.length - 1) {
    questionIndex += 1;
    renderQuestion();
  } else {
    finishGame();
  }
});
retrySaveButton.addEventListener("click", saveResult);
playAgainButton.addEventListener("click", resetGame);

setStatus("พร้อมลงทะเบียน");
