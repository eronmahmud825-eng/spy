// ================= DOM =================
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

// ================= WORDS =================
const words = [{
        category: "شار/ووڵات",
        hint2: "شوێنێکی ناسراو",
        items: [
            "سلێمانی", "هەولێر", "دهۆک", "کرکوک", "کووردستان", "کەنەدا", "ئەمەریکا",
            "نیۆڕک", "لەندەن", "ئاکرێ", "ئەرجەنتین", "فەرەنسا", "پاریس", "ئیسپانیا",
            "ئیتالیا", "ئالمانیا", "تورکیا", "ئێران", "ژاپۆن"
        ]
    },
    {
        category: "خواردن",
        hint2: "خواردنێکی ناسراو",
        items: [
            "کەباب", "پیتزا", "بەریانی", "دۆنەر", "ماسی", "برنج", "یاپراخ", "شفتە",
            "کفتە", "مریشک", "گۆشت", "سووپ", "هەمبەرگەر", "پاستا", "ساندویچ"
        ]
    },
    {
        category: "سۆشیال میدیا",
        hint2: "پلاتفۆرمی ئینتەرنێت",
        items: [
            "یوتوب", "تیکتۆک", "فەیسبووک", "ئینستاگرام", "ئێکس", "تویچ", "سناپ",
            "دیسکۆرد", "چاتجیپیتی", "جیمینی", "کڵاود ئەی ئای", "واتساپ", "تێلێگرام"
        ]
    },
    {
        category: "ئاژەڵ",
        hint2: "زیندووی وشک",
        items: [
            "سەگ", "پشیلە", "مانگا", "مار", "گوورگ", "شێر", "بزن", "کەر", "مەیموون",
            "ووشتر", "کۆتر", "قاز", "ماسی", "نەهەنگ", "زەرافە", "فیل"
        ]
    },
    {
        category: "بێگیان/شت",
        hint2: "شتێکی ڕۆژانە",
        items: [
            "کورسی", "فڕن", "قەنەفە", "زۆپا", "سەیارە", "تەیارە", "مۆبایل",
            "تەلەفزیۆن", "جادە", "بەلەم", "بەرد", "تەناف", "جل", "کاتژمێر", "کەرت"
        ]
    }
];

// ================= STATE =================
let totalPlayers = 0;
let spyCount = 0;
let time = 0;

let currentPlayer = 1;
let spies = [];
let secret = null;

let timerInterval = null;
let hint2Shown = false;

// 🔒 no repetition
let usedSecrets = JSON.parse(localStorage.getItem("usedSecrets")) || [];
const MAX_HISTORY = 7;

// ================= AUTO START IF SAVED =================
window.onload = () => {
    const saved = JSON.parse(localStorage.getItem("gameSettings"));
    if (saved) {
        playersInput.value = saved.players;
        spiesInput.value = saved.spies;
        minutesInput.value = saved.minutes;
        startGame(true);
    }
};

// ================= START GAME =================
function startGame(auto = false) {
    totalPlayers = Number(playersInput.value);
    spyCount = Number(spiesInput.value);
    time = Number(minutesInput.value) * 60;

    currentPlayer = 1;
    spies = [];
    hint2Shown = false;

    // save settings
    localStorage.setItem(
        "gameSettings",
        JSON.stringify({
            players: totalPlayers,
            spies: spyCount,
            minutes: minutesInput.value
        })
    );

    // choose spies
    while (spies.length < spyCount) {
        let r = Math.floor(Math.random() * totalPlayers) + 1;
        if (!spies.includes(r)) spies.push(r);
    }

    secret = getUniqueSecret();

    setup.style.display = "none";
    game.style.display = "block";

    updateTimer();
    playerText.innerText = "پلەیەری 1 کرتە بکە";
}

// ================= UNIQUE SECRET =================
function getUniqueSecret() {
    let tries = 0;

    while (tries < 200) {
        const g = words[Math.floor(Math.random() * words.length)];
        const w = g.items[Math.floor(Math.random() * g.items.length)];
        const key = g.category + "|" + w;

        if (!usedSecrets.includes(key)) {
            usedSecrets.push(key);
            if (usedSecrets.length > MAX_HISTORY) usedSecrets.shift();
            localStorage.setItem("usedSecrets", JSON.stringify(usedSecrets));

            return { word: w, category: g.category, hint2: g.hint2 };
        }
        tries++;
    }

    usedSecrets = [];
    localStorage.setItem("usedSecrets", JSON.stringify([]));
    return getUniqueSecret();
}

// ================= TIMER =================
function updateTimer() {
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(time % 60).padStart(2, "0");
    timerEl.innerText = `⏱️ ${m}:${s}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        time--;
        updateTimer();

        if (!hint2Shown && time <= (Number(minutesInput.value) * 60) / 2) {
            hint2Shown = true;
            alert("💡 هینتی دووەم: " + secret.hint2);
        }

        if (time <= 0) {
            clearInterval(timerInterval);
            startVoting();
        }
    }, 1000);
}

// ================= SHOW ROLE =================
function showRole() {
    result.innerHTML = "";
    result.className = "";
    showBtn.disabled = true;

    if (spies.includes(currentPlayer)) {
        result.innerHTML = `🕵️ تۆ جاسوسیت<br>جۆر: <b>${secret.category}</b>`;
        result.className = "spy";
    } else {
        result.innerHTML = `📌 وشەکە: <b>${secret.word}</b>`;
        result.className = "normal";
    }

    nextBtn.style.display = "block";
}

// ================= NEXT PLAYER =================
function nextPlayer() {
    result.innerHTML = "";
    result.className = "";
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

// ================= FINISH EARLY =================
function addFinishBtn() {
    if (document.getElementById("finishBtn")) return;
    const b = document.createElement("button");
    b.id = "finishBtn";
    b.innerText = "🛑 کۆتایی یاری / دەنگدان";
    b.onclick = startVoting;
    game.appendChild(b);
}

// ================= VOTING =================
function startVoting() {
    clearInterval(timerInterval);
    voting.innerHTML = "<h3>🗳️ جاسوس کێیە؟</h3>";

    for (let i = 1; i <= totalPlayers; i++) {
        const b = document.createElement("button");
        b.innerText = `پلەیەری ${i}`;
        b.onclick = () => vote(i);
        voting.appendChild(b);
    }
}

// ================= RESULT =================
function vote(p) {
    voting.innerHTML = "";
    finalResult.innerHTML = spies.includes(p) ?
        `🎉 سەرکەوتن! جاسوس = ${spies.join(", ")}` :
        `❌ هەڵە! جاسوسەکان = ${spies.join(", ")}`;
    restartBtn.style.display = "block";
    addSettingsBtn();

}

// ================= RESTART =================
function restartGame() {
    location.reload();
} // ================= BACK TO SETTINGS =================
function addSettingsBtn() {
    if (document.getElementById("settingsBtn")) return;

    const b = document.createElement("button");
    b.id = "settingsBtn";
    b.innerText = "⚙️ گەڕانەوە بۆ ڕێکخستن";
    b.style.marginTop = "10px";
    b.onclick = backToSettings;
    game.appendChild(b);
}

function backToSettings() {
    // وەستاندنی کاتژمێر
    clearInterval(timerInterval);

    // شاردنەوەی یاری
    game.style.display = "none";

    // پیشاندانی فۆڕمی ڕێکخستن
    setup.style.display = "block";

    // پاککردنەوەی بەشەکانی یاری
    voting.innerHTML = "";
    finalResult.innerHTML = "";
    restartBtn.style.display = "none";

    // دەتوانیت ئەمە هەڵبگریت یان بسڕیت بۆ reset تەواو
    // localStorage.removeItem("gameSettings");
}
