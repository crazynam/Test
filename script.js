const params = new URLSearchParams(window.location.search);
const recipient = cleanParam(params.get("to"));
const sender = cleanParam(params.get("from"));
const customPlan = cleanParam(params.get("plan"));

const cards = [...document.querySelectorAll(".card")];
const questionCard = document.querySelector("#questionCard");
const dateCard = document.querySelector("#dateCard");
const menuCard = document.querySelector("#menuCard");
const afterCard = document.querySelector("#afterCard");
const answerCard = document.querySelector("#answerCard");
const promiseCard = document.querySelector("#promiseCard");
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const buttonZone = document.querySelector("#buttonZone");
const forgiveButton = document.querySelector("#forgiveButton");
const thinkButton = document.querySelector("#thinkButton");
const forgiveZone = document.querySelector(".forgive-zone");
const againButton = document.querySelector("#againButton");
const shareButton = document.querySelector("#shareButton");
const shareStatus = document.querySelector("#shareStatus");
const hint = document.querySelector("#hint");
const forgivenessHint = document.querySelector("#forgivenessHint");
const confetti = document.querySelector("#confetti");

const choices = { date: "", menu: "", after: "" };
const noMessages = [
  "어라? 거긴 못 누르는데?",
  "아니오는 잠시 외출 중!",
  "잡을 수 있으면 잡아봐 👀",
  "계속 따라올 거야?",
  "정답 버튼은 저쪽이야 ♥",
  "아직도 포기 안 했네 ㅋㅋ",
];
const thinkMessages = [
  "어? 생각은 충분히 한 것 같은데?",
  "그 버튼도 조금 더 생각해본대!",
  "용서 버튼은 얌전히 기다리는 중 👀",
  "여기까지 따라왔네 ㅋㅋ",
  "한 번만 봐주라 ♥",
];

let escapeCount = 0;
let thinkCount = 0;

if (recipient) {
  document.querySelector("#recipient").textContent = `TO. ${recipient}`;
  document.title = `${recipient}, 잠깐 물어볼 게 있어 💌`;
}

if (sender) {
  document.querySelector("#signature").textContent = `FROM. ${sender}`;
  document.querySelector("#answerCopy").innerHTML =
    `이번엔 네 마음을 더 잘 듣고,<br>${escapeHtml(sender)}가 편하게 웃을 수 있게 할게.`;
}

if (customPlan) document.querySelector("#datePlan").textContent = customPlan;

function cleanParam(value) {
  return value?.trim().slice(0, 40) || "";
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function showCard(card) {
  cards.forEach((item) => {
    item.hidden = item !== card;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function moveNoButton() {
  const padding = 18;
  const rect = noButton.getBoundingClientRect();
  const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
  const maxY = Math.max(padding, window.innerHeight - rect.height - padding);
  let nextX;
  let nextY;

  do {
    nextX = padding + Math.random() * (maxX - padding);
    nextY = padding + Math.random() * (maxY - padding);
  } while (Math.abs(nextX - rect.left) < 120 && Math.abs(nextY - rect.top) < 100);

  if (noButton.parentElement !== document.body) document.body.append(noButton);
  noButton.classList.add("is-running");
  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;
  escapeCount += 1;
  hint.textContent = noMessages[Math.min(escapeCount - 1, noMessages.length - 1)];
  yesButton.style.transform = `scale(${Math.min(1 + escapeCount * 0.09, 1.45)})`;
  noButton.textContent = escapeCount >= 5 ? "그래도 아니오" : "아니오";
}

function startPlanning() {
  noButton.style.display = "none";
  yesButton.removeAttribute("style");
  showCard(dateCard);
}

function selectChoice(button) {
  const type = button.dataset.choice;
  choices[type] = button.dataset.value;
  if (type === "date") showCard(menuCard);
  if (type === "menu") showCard(afterCard);
  if (type === "after") finishPlanning();
}

function finishPlanning() {
  document.querySelector("#summaryDate").textContent = choices.date;
  document.querySelector("#summaryMenu").textContent = choices.menu;
  document.querySelector("#summaryAfter").textContent = choices.after;
  shareStatus.textContent = "";
  resetThinkButton();
  showCard(answerCard);
}

function resetThinkButton() {
  forgiveZone.append(thinkButton);
  thinkButton.classList.remove("is-running");
  thinkButton.removeAttribute("style");
  thinkButton.textContent = "계속 생각한다";
  forgiveButton.removeAttribute("style");
  forgivenessHint.textContent = "이번에도 정답은 하나일지도…";
  thinkCount = 0;
}

function moveThinkButton() {
  const padding = 18;
  const rect = thinkButton.getBoundingClientRect();
  const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
  const maxY = Math.max(padding, window.innerHeight - rect.height - padding);
  let nextX;
  let nextY;

  do {
    nextX = padding + Math.random() * (maxX - padding);
    nextY = padding + Math.random() * (maxY - padding);
  } while (Math.abs(nextX - rect.left) < 120 && Math.abs(nextY - rect.top) < 100);

  if (thinkButton.parentElement !== document.body) document.body.append(thinkButton);
  thinkButton.classList.add("is-running");
  thinkButton.style.left = `${nextX}px`;
  thinkButton.style.top = `${nextY}px`;
  thinkCount += 1;
  forgivenessHint.textContent = thinkMessages[Math.min(thinkCount - 1, thinkMessages.length - 1)];
  forgiveButton.style.transform = `scale(${Math.min(1 + thinkCount * 0.07, 1.35)})`;
}

function acceptForgiveness() {
  thinkButton.style.display = "none";
  showCard(promiseCard);
  launchConfetti();
}

function resultText() {
  return `이제 용서한다 ♥\n데이트 선택 완료!\n언제: ${choices.date}\n저녁: ${choices.menu}\n그다음: ${choices.after}`;
}

async function shareResult() {
  const shareData = { title: "우리 데이트 계획", text: resultText() };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      shareStatus.textContent = "보내기 완료!";
      return;
    }
    await navigator.clipboard.writeText(resultText());
    shareStatus.textContent = "선택 결과를 복사했어. 카톡에 붙여넣어 줘 ♥";
  } catch (error) {
    if (error.name !== "AbortError") shareStatus.textContent = "카톡으로 선택 결과를 알려줘 ♥";
  }
}

function resetChoices() {
  choices.date = "";
  choices.menu = "";
  choices.after = "";
  confetti.replaceChildren();
  shareStatus.textContent = "";
  forgiveZone.append(thinkButton);
  thinkButton.style.display = "none";
  showCard(dateCard);
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
  moveNoButton();
});
noButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    moveNoButton();
  }
});

yesButton.addEventListener("click", startPlanning);
forgiveButton.addEventListener("click", acceptForgiveness);
againButton.addEventListener("click", resetChoices);
shareButton.addEventListener("click", shareResult);

thinkButton.addEventListener("pointerenter", moveThinkButton);
thinkButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  moveThinkButton();
});
thinkButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    moveThinkButton();
  }
});

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => selectChoice(button));
});

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(`#${button.dataset.back}`);
    if (target === questionCard) {
      buttonZone.append(noButton);
      noButton.style.display = "";
      noButton.classList.remove("is-running");
      noButton.removeAttribute("style");
      noButton.textContent = "아니오";
      hint.textContent = "마음 가는 쪽을 눌러줘";
      escapeCount = 0;
    }
    if (target === afterCard) thinkButton.style.display = "none";
    showCard(target);
  });
});

window.addEventListener("resize", () => {
  if (noButton.classList.contains("is-running") && !questionCard.hidden) moveNoButton();
  if (thinkButton.classList.contains("is-running") && !answerCard.hidden) moveThinkButton();
});
