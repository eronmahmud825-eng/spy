// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyAzpQ9kpRs9syqFJkL4khpJg-f8Hf3rQi8",
  authDomain: "spygames-c2744.firebaseapp.com",
  databaseURL: "https://spygames-c2744-default-rtdb.firebaseio.com",
  projectId: "spygames-c2744"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let roomCode="";
let onlineMode=false;
let myName="";

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
const words = [
{category:"شار",hint2:"شوێنێکی ناسراو",items:["سلێمانی","هەولێر","دهۆک","کرکوک"]},
{category:"خواردن",hint2:"خواردنێکی ناسراو",items:["کەباب","پیتزا","بەریانی"]},
{category:"ئاژەڵ",hint2:"زیندوو",items:["سەگ","پشیلە","شێر"]}
];

// ================= STATE =================
let totalPlayers=0;
let spyCount=0;
let time=0;
let currentPlayer=1;
let spies=[];
let secret=null;
let timerInterval=null;

// ================= ONLINE =================
function randomRoom(){
return Math.floor(1000+Math.random()*9000).toString();
}

function createRoom(){
myName=document.getElementById("playerName").value;
if(!myName) return alert("Enter Name");

roomCode=randomRoom();
onlineMode=true;

db.ref("rooms/"+roomCode).set({status:"waiting"});
db.ref("rooms/"+roomCode+"/players").push({name:myName});

alert("Room Code: "+roomCode);
listenRoom();
}

function joinRoom(){
myName=document.getElementById("playerName").value;
roomCode=document.getElementById("roomCodeInput").value;

if(!myName||!roomCode) return alert("Fill all");

onlineMode=true;
db.ref("rooms/"+roomCode+"/players").push({name:myName});
listenRoom();
}

function listenRoom(){
db.ref("rooms/"+roomCode).on("value",(snap)=>{
const data=snap.val();
if(!data) return;

if(data.status==="start") startGame(true);
if(data.status==="voting") startVoting();
});
}

// ================= GAME =================
function startGame(auto=false){

if(!auto && onlineMode){
db.ref("rooms/"+roomCode).update({status:"start"});
}

totalPlayers=Number(playersInput.value);
spyCount=Number(spiesInput.value);
time=Number(minutesInput.value)*60;

currentPlayer=1;
spies=[];

while(spies.length<spyCount){
let r=Math.floor(Math.random()*totalPlayers)+1;
if(!spies.includes(r)) spies.push(r);
}

const g=words[Math.floor(Math.random()*words.length)];
const w=g.items[Math.floor(Math.random()*g.items.length)];
secret={word:w,category:g.category,hint2:g.hint2};

setup.style.display="none";
game.style.display="block";

updateTimer();
playerText.innerText="Player 1 Click Show";
}

function updateTimer(){
const m=String(Math.floor(time/60)).padStart(2,"0");
const s=String(time%60).padStart(2,"0");
timerEl.innerText=`${m}:${s}`;
}

function startTimer(){
timerInterval=setInterval(()=>{
time--;
updateTimer();
if(time<=0){
clearInterval(timerInterval);
startVoting();
}
},1000);
}

function showRole(){
result.innerHTML="";
showBtn.disabled=true;

if(spies.includes(currentPlayer)){
result.innerHTML=`🕵️ Spy<br>Category: ${secret.category}`;
result.className="spy";
}else{
result.innerHTML=`📌 Word: ${secret.word}`;
result.className="normal";
}

nextBtn.style.display="block";
}

function nextPlayer(){
result.innerHTML="";
showBtn.disabled=false;
nextBtn.style.display="none";
currentPlayer++;

if(currentPlayer<=totalPlayers){
playerText.innerText=`Player ${currentPlayer} Click Show`;
}else{
playerText.innerText="Game Started";
startTimer();
}
}

function startVoting(){

if(onlineMode){
db.ref("rooms/"+roomCode).update({status:"voting"});
}

clearInterval(timerInterval);
voting.innerHTML="<h3>Who is Spy?</h3>";

for(let i=1;i<=totalPlayers;i++){
const b=document.createElement("button");
b.innerText="Player "+i;
b.onclick=()=>vote(i);
voting.appendChild(b);
}
}

function vote(p){
voting.innerHTML="";
finalResult.innerHTML=spies.includes(p)?
"🎉 Correct! Spy: "+spies.join(","):
"❌ Wrong! Spy: "+spies.join(",");
restartBtn.style.display="block";
}

function restartGame(){
location.reload();
}
