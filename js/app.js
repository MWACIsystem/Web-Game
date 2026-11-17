import { getAnonymousUser } from "./firebase.js";
import { saveGameResult } from "./database.js";
import { questions } from "./game.js";

const $ = (id) => document.getElementById(id);
const statusEl = $("connectionStatus");
const startPanel = $("startPanel");
const gamePanel = $("gamePanel");
const resultPanel = $("resultPanel");
const startForm = $("startForm");
const playerNameInput = $("playerName");
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

let playerName = "";
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

async function startGame(event) {
  event.preventDefault();
  const cleanName = playerNameInput.value.trim();
  if (!cleanName) {
    playerNameInput.focus();
    return;
  }

  const submitButton = startForm.querySelector("button[type='submit']");
  setBusy(submitButton, true, "กำลังเชื่อมต่อ…");
  setStatus("กำลังยืนยันตัวตนผู้เล่น…");

  try {
    const user = await getAnonymousUser();
    playerUid = user.uid;
    playerName = cleanName;
    questionIndex = 0;
    score = 0;
    startedAt = Date.now();
    saveCompleted = false;
    isSaving = false;

    hide(startPanel);
    hide(resultPanel);
    show(gamePanel);
    setStatus("พร้อมเล่น");
    renderQuestion();
  } catch (error) {
    console.error("Anonymous authentication failed:", error);
    setStatus("เชื่อมต่อระบบไม่สำเร็จ");
    alert("เริ่มเกมไม่ได้ กรุณาตรวจสอบการตั้งค่า Firebase Authentication และ Authorized domains");
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
    button.textContent = answer;
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
    score += 20;
    feedback.textContent = "ถูกต้อง! +20 คะแนน";
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
  resultScore.textContent = `${score} / ${questions.length * 20} คะแนน`;
  $("resultTitle").textContent = `ขอบคุณที่เล่นนะ ${playerName}!`;
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
      playerName,
      playerUid,
      score,
      totalQuestions: questions.length,
      durationSeconds
    });
    saveCompleted = true;
    saveStatus.textContent = "บันทึกคะแนนเรียบร้อยแล้ว ขอบคุณที่ร่วมเล่น!";
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
  playerNameInput.value = playerName;
  setStatus("พร้อมเล่น");
  playerNameInput.focus();
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

setStatus("พร้อมเชื่อมต่อเมื่อเริ่มเล่น");
