const words = [
    "خانوو", "کتێب", "جانتا", "قوڕڕ", "زۆپا", "هاوین", "زستان", "کەباب",
    "سەیارە", "سلێمانی", "ئەمەریکا", "کارەبا", "جادە", "زانکۆ",
    "ڕێستۆرانت", "فەیسبووک", "یوتوب", "تیکتۆک", "شێر", "سەگ",
    "پشیلە", "باران", "خۆر", "مانگ", "zanko", "KER", "QN", "tramp", "jo baidn", "nergala", "sisam", "kursi", "sayara", "compitar", "mobail", "snapchat", "shuti", "virus", "banj"
];

const totalPlayers = 3;
let currentPlayer = 1;
let spyIndex = Math.floor(Math.random() * totalPlayers) + 1;
let secretWord = words[Math.floor(Math.random() * words.length)];

let time = 180;
let timerInterval = null;
let timerStarted = false;
let votingDone = false;

function updateTimerUI() {
    let min = String(Math.floor(time / 60)).padStart(2, '0');
    let sec = String(time % 60).padStart(2, '0');
    document.getElementById("timer").innerText = `⏱️ ${min}:${sec}`;
}

function startTimer() {
    if (timerStarted) return; // 🔒 prevent double start
    timerStarted = true;

    timerInterval = setInterval(() => {
        time--;
        updateTimerUI();

        if (time <= 0) {
            clearInterval(timerInterval);
            document.getElementById("voting").style.display = "block";
            alert("⏰ کات تەواو بوو! دەنگدان بکەن.");
        }
    }, 1000);
}

function showRole() {
    const result = document.getElementById("result");
    const showBtn = document.getElementById("showBtn");
    const sound = document.getElementById("spySound");

    showBtn.disabled = true;

    if (currentPlayer === spyIndex) {
        result.innerHTML = "🕵️‍♂️ <b>تۆ جاسوسیت</b>";
        result.className = "spy";
        sound.play();
    } else {
        result.innerHTML = `📌 وشەکە: <b>${secretWord}</b>`;
        result.className = "normal";
    }

    document.getElementById("nextBtn").style.display = "block";
}

function nextPlayer() {
    document.getElementById("result").innerHTML = "";
    document.getElementById("result").className = "";
    document.getElementById("nextBtn").style.display = "none";

    document.getElementById("showBtn").disabled = false;

    currentPlayer++;

    if (currentPlayer <= totalPlayers) {
        document.getElementById("playerText").innerText =
            `یاریزانی ${currentPlayer} کرتە بکە`;
    } else {
        document.getElementById("playerText").innerText =
            "✅ یاری دەستپێبکەن – پرسیار بکەن!";
        startTimer();
    }
}

function vote(playerNumber) {
    if (votingDone) return; // 🔒 prevent double voting
    votingDone = true;

    clearInterval(timerInterval);
    document.getElementById("voting").style.display = "none";

    const final = document.getElementById("finalResult");

    if (playerNumber === spyIndex) {
        final.innerHTML = `🎉 سەرکەوتن! جاسوس = یاریزانی ${spyIndex}`;
        final.style.background = "#198754";
    } else {
        final.innerHTML = `❌ هەڵە! جاسوس = یاریزانی ${spyIndex}`;
        final.style.background = "#ff0033";
    }

    document.getElementById("restartBtn").style.display = "block";
}

function restartGame() {
    location.reload();
}

updateTimerUI();