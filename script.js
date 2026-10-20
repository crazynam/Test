const params = new URLSearchParams(window.location.search);
const recipient = cleanParam(params.get("to"));
const sender = cleanParam(params.get("from"));
const customPlan = cleanParam(params.get("plan"));

const questionCard = document.querySelector("#questionCard");
const answerCard = document.querySelector("#answerCard");
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const againButton = document.querySelector("#againButton");
const hint = document.querySelector("#hint");
const confetti = document.querySelector("#confetti");

const noMessages = [
  "어라? 거긴 못 누르는데?",
  "아니오는 잠시 외출 중!",
  "잡을 수 있으면 잡아봐 👀",
  "계속 따라올 거야?",
  "정답 버튼은 저쪽이야 ♥",
  "아직도 포기 안 했네 ㅋㅋ",
];

let escapeCount = 0;
let canRun = false;

window.setTimeout(() => {
  canRun = true;
}, 700);

if (recipient) {
  document.querySelector("#recipient").textContent = `TO. ${recipient}`;
  document.title = `${recipient}, 잠깐 물어볼 게 있어 💌`;
}

if (sender) {
  document.querySelector("#signature").textContent = `FROM. ${sender}`;
  document.querySelector("#answerCopy").innerHTML =
    `그럼 우리, 설레는 마음만 챙겨서 만나자.<br>${escapeHtml(sender)}가 나머지는 준비할게 :)`;
}

if (customPlan) {
  document.querySelector("#datePlan").textContent = customPlan;
}

function cleanParam(value) {
  return value?.trim().slice(0, 40) || "";
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function moveNoButton() {
  if (!canRun) return;

  const padding = 18;
  const rect = noButton.getBoundingClientRect();
  const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
  const maxY = Math.max(padding, window.innerHeight - rect.height - padding);
  let nextX;
  let nextY;

  do {
    nextX = padding + Math.random() * (maxX - padding);
    nextY = padding + Math.random() * (maxY - padding);
  } while (
    Math.abs(nextX - rect.left) < 120 &&
    Math.abs(nextY - rect.top) < 100
  );

  noButton.classList.add("is-running");
  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;

  escapeCount += 1;
  hint.textContent = noMessages[Math.min(escapeCount - 1, noMessages.length - 1)];
  const yesScale = Math.min(1 + escapeCount * 0.09, 1.45);
  yesButton.style.transform = `scale(${yesScale})`;

  noButton.textContent = escapeCount >= 5 ? "그래도 아니오" : "아니오";
}

function acceptDate() {
  noButton.style.display = "none";
  questionCard.hidden = true;
  answerCard.hidden = false;
  launchConfetti();
}

function resetPage() {
  answerCard.hidden = true;
  questionCard.hidden = false;
  noButton.style.display = "";
  noButton.classList.remove("is-running");
  noButton.removeAttribute("style");
  noButton.textContent = "아니오";
  yesButton.removeAttribute("style");
  hint.textContent = "힌트: 마음이 가는 쪽을 눌러봐";
  escapeCount = 0;
  confetti.replaceChildren();
}

function launchConfetti() {
  const colors = ["#ff6f91", "#ffd66b", "#6da68a", "#86bde8", "#ea4d61"];
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 90; i += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--duration", `${2.5 + Math.random() * 2.2}s`);
    piece.style.setProperty("--delay", `${Math.random() * 0.6}s`);
    piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    piece.style.setProperty("--rotation", `${180 + Math.random() * 720}deg`);
    fragment.appendChild(piece);
  }

  confetti.replaceChildren(fragment);
}

noButton.addEventListener("pointerenter", moveNoButton);
noButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  canRun = true;
  moveNoButton();
});

noButton.addEventListener("focus", () => {
  if (escapeCount === 0) hint.textContent = "키보드로는 선택할 수 있게 해뒀어 :)";
});

noButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    canRun = true;
    moveNoButton();
  }
});

yesButton.addEventListener("click", acceptDate);
againButton.addEventListener("click", resetPage);

window.addEventListener("resize", () => {
  if (noButton.classList.contains("is-running")) moveNoButton();
});
