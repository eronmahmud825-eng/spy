// DOM
const setup = document.getElementById("setup");
const game = document.getElementById("game");
const playersInput = document.getElementById("players");
const spiesInput = document.getElementById("spies");
const minutesInput = document.getElementById("minutes");

const timerEl = document.getElementById("timer");
const playerText = document.getElementById("playerText");
const showBtn = document.getElementById("showBtn");
const result = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const voting = document.getElementById("voting");
const finalResult = document.getElementById("finalResult");
const restartBtn = document.getElementById("restartBtn");

// WORD GROUPS
const words = [
    { category: "شار/ووڵات", hint2: "ن", items: ["سلێمانی", "هەولێر", "دهۆک", "کرکوک", "کووردستان", "کەنەدا", "ئەمەریکا", "نیۆڕک"] },
    { category: "خواردن", hint2: "", items: ["کەباب", "پیتزا", "بەریانی", "دۆنەر", "ماسی", "برنج", "یاپراخ", "شفتە", "کفتە", "دۆنەر", "مریشک", "گۆشت", "ئیندۆمی", "سووپ"] },
    { category: " سۆشیال میدیا", hint2: "پلاتفۆرمی ڤیدیۆ", items: ["یوتوب", "تیکتۆک", "فەیسبووک", "ئینستاگرام", "ئێکس", "تویچ", "مەسنجەر", "سێرد"] },
    { category: "ئاژەڵ", hint2: "", items: ["سەگ", "پشیلە", "مانگا", "دووپشک", "مار", "گوورگ", "شێر", "بزن", "کەر", "مەیموون", "ووشتر", "کۆتر", "مریشک", "قەل"] }


];

// GAME STATE
let totalPlayers, spyCount, time;
let currentPlayer = 1;
let spies = [];
let secret;
let timerInterval;
let hint2Shown = false;

// START
function startGame() {
    totalPlayers = +playersInput.value;
    spyCount = +spiesInput.value;
    time = +minutesInput.value * 60;

    spies = [];
    while (spies.length < spyCount) {
        let r = Math.floor(Math.random() * totalPlayers) + 1;
        if (!spies.includes(r)) spies.push(r);
    }

    const group = words[Math.floor(Math.random() * words.length)];
    const word = group.items[Math.floor(Math.random() * group.items.length)];
    secret = { word: word, category: group.category, hint2: group.hint2 };

    setup.style.display = "none";
    game.style.display = "block";
    updateTimer();
    playerText.innerText = "پلەیەری 1 کرتە بکە";
}

// TIMER
function updateTimer() {
    let m = String(Math.floor(time / 60)).padStart(2, "0");
    let s = String(time % 60).padStart(2, "0");
    timerEl.innerText = `⏱️ ${m}:${s}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        time--;
        updateTimer();

        // SECOND HINT AT HALF TIME
        if (!hint2Shown && time <= (minutesInput.value * 60) / 2) {
            hint2Shown = true;
            alert("💡 هینتی دووەم: " + secret.hint2);
        }

        if (time <= 0) {
            clearInterval(timerInterval);
            startVoting();
        }
    }, 1000);
}

// SHOW ROLE
function showRole() {
    showBtn.disabled = true;
    result.className = "";

    if (spies.includes(currentPlayer)) {
        result.innerHTML = `🕵️ تۆ جاسوسیت<br>💡 هینت: <b>${secret.category}</b>`;
        result.className = "spy";
    } else {
        result.innerHTML = `📌 وشەکە: <b>${secret.word}</b>`;
        result.className = "normal";
    }
    nextBtn.style.display = "block";
}

// NEXT
function nextPlayer() {
    result.innerHTML = "";
    showBtn.disabled = false;
    nextBtn.style.display = "none";
    currentPlayer++;

    if (currentPlayer <= totalPlayers) {
        playerText.innerText = `پلەیەری ${currentPlayer} کرتە بکە`;
    } else {
        playerText.innerText = "🗣️ یاری دەستپێبکەن";
        startTimer();
        addFinishBtn();
    }
}

// FINISH EARLY
function addFinishBtn() {
    if (document.getElementById("finishBtn")) return;
    let b = document.createElement("button");
    b.id = "finishBtn";
    b.innerText = "🛑 کۆتایی یاری / دەنگدان";
    b.onclick = startVoting;
    game.appendChild(b);
}

// VOTING
function startVoting() {
    clearInterval(timerInterval);
    voting.innerHTML = "<h3>🗳️ جاسوس کێیە؟</h3>";
    for (let i = 1; i <= totalPlayers; i++) {
        let b = document.createElement("button");
        b.innerText = `پلەیەری ${i}`;
        b.onclick = () => vote(i);
        voting.appendChild(b);
    }
}

// RESULT
function vote(p) {
    voting.innerHTML = "";
    if (spies.includes(p)) {
        finalResult.innerHTML = `🎉 سەرکەوتن! جاسوس = ${spies.join(", ")}`;
        finalResult.style.background = "#198754";
    } else {
        finalResult.innerHTML = `❌ هەڵە! جاسوسەکان = ${spies.join(", ")}`;
        finalResult.style.background = "#ff0033";
    }
    restartBtn.style.display = "block";
}

function restartGame() { location.reload(); }
