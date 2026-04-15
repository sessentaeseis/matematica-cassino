document.addEventListener("DOMContentLoaded", () => {

const symbols = ["🔴","🔵","🟢","🟡","⚫"];

let coins = 100;
let cps = 1;
let multiplier = 1;
let currentBet = null;
let isSpinning = false;
let totalCoinsEarned = 100;
let luckModifier = 0;
let autoPlayInterval = null;
let rareEventMultiplier = 1;

const BET_COST = 10;

const rewards = {
    triplo: 200,
    par: 20,
    diferentes: 15
};

const shopItems = [
    { id:"auto1", name:"Gerador Básico", desc:"+1 ficha por segundo", cost:50, unlock:0, effect:()=>cps+=1 },
    { id:"auto2", name:"Gerador Médio", desc:"+5 fichas por segundo", cost:200, unlock:100, effect:()=>cps+=5 },
    { id:"auto3", name:"Gerador Industrial", desc:"+15 fichas por segundo", cost:800, unlock:400, effect:()=>cps+=15 },

    { id:"multi1", name:"Multiplicador x1.5", desc:"+50% em todos os ganhos", cost:300, unlock:150, effect:()=>multiplier*=1.5 },
    { id:"multi2", name:"Multiplicador x3", desc:"Triplica todos os ganhos", cost:1200, unlock:600, effect:()=>multiplier*=3 },

    { id:"luck", name:"Otimização", desc:"Aumenta ganhos base em 30%", cost:900, unlock:500, effect:()=>{
        rewards.triplo*=1.3;
        rewards.par*=1.3;
        rewards.diferentes*=1.3;
    }}
];

let inventory = {};
let log = [];

/* ELEMENTOS */
const coinsEl = document.getElementById("coins");
const cpsEl = document.getElementById("cps");
const multiEl = document.getElementById("multi");
const logEl = document.getElementById("log");
const shopEl = document.getElementById("shop");
const inventoryEl = document.getElementById("inventory");
const symbolsEl = document.getElementById("symbols");
const resultEl = document.getElementById("result");
const playBtn = document.querySelector(".play");

/* ======================
   APOSTA
====================== */
document.querySelectorAll(".bet").forEach(btn=>{
    btn.addEventListener("click", ()=>{
        currentBet = btn.dataset.bet;

        document.querySelectorAll(".bet").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
    });
});

/* ======================
   CPS LOOP
====================== */
setInterval(()=>{
    coins += cps;
    totalCoinsEarned += cps;
    updateUI();
},1000);

/* ======================
   EVENTO RARO
====================== */
setInterval(()=>{
    if(Math.random() < 0.01){
        coins += 100;
        addLog(">✨ Evento raro: +100", "info");
        updateUI();
    }
},4000);

/* ======================
   LOJA
====================== */
function renderShop(){
    shopEl.innerHTML = "";

    shopItems.forEach(item=>{
        let unlocked = totalCoinsEarned >= item.unlock;

        let div = document.createElement("div");
        div.className = "item";

        let info = document.createElement("div");
        info.innerHTML = `
            <b>${item.name}</b>
            <small>${item.desc}</small>
            <small>Custo: ${item.cost}</small>
        `;

        let btn = document.createElement("button");
        btn.textContent = unlocked ? "Comprar" : "Bloqueado";

        if(!unlocked || coins < item.cost){
            btn.disabled = true;
        }

        btn.addEventListener("click", ()=>{
            buyItem(item.id);
        });

        div.appendChild(info);
        div.appendChild(btn);
        shopEl.appendChild(div);
    });
}

function buyItem(id){
    let item = shopItems.find(i=>i.id===id);
    if(!item || coins < item.cost) return;

    coins -= item.cost;
    item.effect();

    inventory[id] = (inventory[id] || 0) + 1;

    updateUI();
    renderShop();
    renderInventory();
    addLog(`>🛒 Comprado: ${item.name}`, "buy");
    setResultText(`Comprado: ${item.name}`);
    animateResult("buy");
    highlightInventoryItem(id);
}

/* ======================
   JOGO
====================== */
function rand(){
    return symbols[Math.floor(Math.random()*symbols.length)];
}

function play(){
    if(isSpinning) return;
    if(!currentBet){
        setResultText(">ione uma aposta antes de jogar.");
        addLog(">⚠️ Selecione uma aposta antes de jogar.", "info");
        return;
    }
    if(coins < BET_COST){
        setResultText("Você precisa de pelo menos 10 fichas para jogar.");
        addLog("⚠️ Fichas insuficientes.", "info");
        return;
    }

    isSpinning = true;
    playBtn.disabled = true;

    coins -= BET_COST;

    setSymbolsDisplay("❓","❓","❓");
    setResultText("Girando...");
    animateResult("info");
    animateSymbols();

    let s1 = rand();
    let s2 = rand();
    let s3 = rand();

    setTimeout(()=>{
        let res;

        if(s1===s2 && s2===s3) res="triplo";
        else if(s1===s2 || s1===s3 || s2===s3) res="par";
        else res="diferentes";

        if(res === currentBet){
            let gain = rewards[res] * multiplier;
            coins += gain;
            addLog(`>🎰 ${res} → +${Math.floor(gain)}`, "win");
            setResultText(`Você ganhou +${Math.floor(gain)} fichas!`);
            animateResult("win");
        } else {
            addLog(`>🎰 ${res} → -10`, "lose");
            setResultText(`Resultado: ${s1} ${s2} ${s3} - Você perdeu.`);
            animateResult("lose");
        }

        setSymbolsDisplay(s1, s2, s3);

        isSpinning = false;
        playBtn.disabled = false;

        updateUI();
        renderShop();

    },300);
}

playBtn.addEventListener("click", play);

/* ======================
   LOG
====================== */
function addLog(text, type = "info"){
    log.unshift({ text, type });
    if(log.length > 20) log.pop();

    logEl.innerHTML = "";

    log.forEach(entry=>{
        let div = document.createElement("div");
        div.className = "log-entry";
        if(entry.type) div.classList.add(entry.type);
        div.textContent = entry.text;
        logEl.appendChild(div);
    });
}

function renderInventory(){
    inventoryEl.innerHTML = "";
    let keys = Object.keys(inventory);
    if(keys.length === 0){
        inventoryEl.textContent = "Nenhum item comprado";
        return;
    }

    keys.forEach(id=>{
        let item = shopItems.find(i=>i.id===id);
        if(!item) return;
        let div = document.createElement("div");
        div.dataset.id = id;
        div.className = "inventory-item";
        div.textContent = `${item.name}: x${inventory[id]}`;
        inventoryEl.appendChild(div);
    });
}

function highlightInventoryItem(id){
    let el = inventoryEl.querySelector(`[data-id="${id}"]`);
    if(!el) return;
    el.classList.add("bought");
    setTimeout(()=>el.classList.remove("bought"), 800);
}

function animateResult(type){
    resultEl.classList.remove("win","lose","info","buy");
    if(type) resultEl.classList.add(type);
}

function animateSymbols(){
    symbolsEl.classList.add("spinning");
    setTimeout(()=>symbolsEl.classList.remove("spinning"), 700);
}

function setSymbolsDisplay(a, b, c){
    symbolsEl.textContent = `${a} ${b} ${c}`;
}

function setResultText(text){
    resultEl.textContent = text;
}

/* ======================
   UI
====================== */
function updateUI(){
    coinsEl.textContent = Math.floor(coins);
    cpsEl.textContent = cps;
    multiEl.textContent = multiplier.toFixed(2) + "x";
}

/* INIT */
renderShop();
updateUI();
renderInventory();
setSymbolsDisplay("❓","❓","❓");
setResultText("Selecione uma aposta e comece a jogar!");

});