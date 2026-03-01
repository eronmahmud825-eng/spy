import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, update, get }
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzpQ9kpRs9syqFJkL4khpJg-f8Hf3rQi8",
  authDomain: "spygames-c2744.firebaseapp.com",
  databaseURL: "https://spygames-c2744-default-rtdb.firebaseio.com",
  projectId: "spygames-c2744",
  storageBucket: "spygames-c2744.appspot.com",
  messagingSenderId: "508332573335",
  appId: "1:508332573335:web:2893d35f1c0b25e81e9fd2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let roomCode="";
let playerId="";
let playerName="";
let isHost=false;

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

function randomCode(){
return Math.floor(1000+Math.random()*9000).toString();
}

window.createRoom=async function(){
playerName=document.getElementById("name").value;
if(!playerName) return alert("ناو بنووسە");

roomCode=randomCode();
playerId=push(ref(db,"rooms/"+roomCode+"/players")).key;
isHost=true;

await set(ref(db,"rooms/"+roomCode),{state:"waiting"});
await set(ref(db,"rooms/"+roomCode+"/players/"+playerId),{name:playerName});

enterRoom();
}

window.joinRoom=async function(){
playerName=document.getElementById("name").value;
roomCode=document.getElementById("roomInput").value;
if(!playerName||!roomCode) return alert("زانیاری تەواو بکە");

playerId=push(ref(db,"rooms/"+roomCode+"/players")).key;
await set(ref(db,"rooms/"+roomCode+"/players/"+playerId),{name:playerName});

enterRoom();
}

function enterRoom(){
document.getElementById("home").classList.add("hidden");
document.getElementById("room").classList.remove("hidden");
document.getElementById("roomCodeText").innerText="Room Code: "+roomCode;

if(isHost){
document.getElementById("settings").classList.remove("hidden");
}

onValue(ref(db,"rooms/"+roomCode+"/players"),snap=>{
const data=snap.val();
let html="";
for(let id in data){
html+=`<div class="card">${data[id].name}</div>`;
}
document.getElementById("players").innerHTML=html;
});
}

window.startGame=async function(){
if(!isHost) return alert("تەنها Host");

const spyCount=parseInt(document.getElementById("spyCount").value);
const minutes=parseInt(document.getElementById("minutes").value);

const snap=await get(ref(db,"rooms/"+roomCode+"/players"));
const players=snap.val();
const ids=Object.keys(players);

const chosenWord=words[Math.floor(Math.random()*words.length)];

let spies=[];
while(spies.length<spyCount){
let r=ids[Math.floor(Math.random()*ids.length)];
if(!spies.includes(r)) spies.push(r);
}

ids.forEach(id=>{
if(spies.includes(id)){
update(ref(db,"rooms/"+roomCode+"/players/"+id),{
role:"spy"
});
}else{
update(ref(db,"rooms/"+roomCode+"/players/"+id),{
role:"normal",
word:chosenWord
});
}
});

update(ref(db,"rooms/"+roomCode),{
state:"playing",
endTime:Date.now()+minutes*60000
});
}

onValue(ref(db,"rooms/"+roomCode),snap=>{
if(!snap.exists()) return;
const data=snap.val();

if(data.state==="playing"){
document.getElementById("room").classList.add("hidden");
document.getElementById("game").classList.remove("hidden");
startTimer(data.endTime);
}
});

onValue(ref(db,"rooms/"+roomCode+"/players/"+playerId),snap=>{
if(!snap.exists()) return;
const data=snap.val();
if(data.role==="spy"){
document.getElementById("roleCard").innerHTML="🕵️ تۆ جاسوسی";
}
if(data.role==="normal"){
document.getElementById("roleCard").innerHTML="📌 وشە: "+data.word;
}
});

function startTimer(endTime){
const interval=setInterval(()=>{
let left=Math.floor((endTime-Date.now())/1000);
document.getElementById("timer").innerText="⏳ "+left+"s";
if(left<=0){
clearInterval(interval);
document.getElementById("result").innerText="⏰ کات تەواو بوو";
}
},1000);
}
