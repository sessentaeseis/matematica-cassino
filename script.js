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
let consecutiveWins = 0;
let hasMinerPassive = false;
let hasRebate = false;
let hasChainReact = false;
let jackpotValue = 100;
let betCost = 10;

const BET_COST = 10; // Valor inicial padrão

const rewards = {
    triplo: 200,
    par: 20,
    diferentes: 15
};

const shopItems = [
    // GERADORES DE RENDA PASSIVA
    { id:"auto1", name:"Gerador Básico", desc:"+1 ficha por segundo", cost:50, unlock:0, effect:()=>cps+=1 },
    { id:"auto2", name:"Gerador Médio", desc:"+5 fichas por segundo", cost:200, unlock:100, effect:()=>cps+=5 },
    { id:"auto3", name:"Gerador Industrial", desc:"+15 fichas por segundo", cost:800, unlock:400, effect:()=>cps+=15 },
    { id:"auto4", name:"Gerador Mega", desc:"+50 fichas por segundo", cost:3500, unlock:1500, effect:()=>cps+=50 },
    { id:"auto5", name:"Gerador Cósmico", desc:"+150 fichas por segundo", cost:12000, unlock:5000, effect:()=>cps+=150 },

    // MULTIPLICADORES DE GANHOS
    { id:"multi1", name:"Multiplicador x1.5", desc:"+50% em todos os ganhos", cost:300, unlock:150, effect:()=>multiplier*=1.5 },
    { id:"multi2", name:"Multiplicador x3", desc:"Triplica todos os ganhos", cost:1200, unlock:600, effect:()=>multiplier*=3 },
    { id:"multi3", name:"Multiplicador Mega x5", desc:"Quintuplicador total", cost:4000, unlock:2000, effect:()=>multiplier*=5 },

    // OTIMIZAÇÕES DE RECOMPENSAS
    { id:"luck", name:"Otimização Base", desc:"Aumenta ganhos base em 30%", cost:900, unlock:500, effect:()=>{
        rewards.triplo*=1.3;
        rewards.par*=1.3;
        rewards.diferentes*=1.3;
    }},
    { id:"triplo_boost", name:"Potenciador Triplo", desc:"+100% em ganhos com triplo", cost:500, unlock:300, effect:()=>rewards.triplo*=2 },
    { id:"par_boost", name:"Potenciador Par", desc:"+80% em ganhos com par", cost:400, unlock:250, effect:()=>rewards.par*=1.8 },
    { id:"diff_boost", name:"Potenciador Diferentes", desc:"+150% em ganhos com diferentes", cost:350, unlock:200, effect:()=>rewards.diferentes*=2.5 },

    // EVENTOS ESPECIAIS E SORTE
    { id:"rarity_inc", name:"Amplificador de Eventos Raros", desc:"Eventos raros +50% frequência", cost:700, unlock:400, effect:()=>{
        rareEventMultiplier*=1.5;
    }},
    { id:"luck_charm", name:"Talismã da Sorte", desc:"+25% de chance em apostas", cost:1100, unlock:550, effect:()=>luckModifier+=0.25 },
    { id:"jackpot_unlock", name:"Desbloqueador Jackpot", desc:"Eventos raros valem 500 fichas", cost:2000, unlock:1000, effect:()=>{
        addLog("> Jackpot Desbloqueado! Eventos raros agora dão 500 fichas!", "info");
    }},

    // GERADORES ESPECIAIS
    { id:"steal_passive", name:"Minerador Passivo", desc:"Furta 2 fichas de cada aposta perdida", cost:600, unlock:350, effect:()=>{
        hasMinerPassive = true;
        addLog("> Minerador Passivo ativado!", "info");
    }},
    { id:"double_cps", name:"Duplicador Duplo", desc:"Dobra ganho de F/s (CPS)", cost:2500, unlock:1200, effect:()=>{
        cps*=2;
        addLog("> CPS duplicado!", "buy");
    }},
    { id:"rebate", name:"Sistema de Resgate", desc:"Recupera 30% de apostas perdidas", cost:1000, unlock:600, effect:()=>{
        hasRebate = true;
        addLog("> Sistema de Resgate ativado!", "info");
    }},

    // UPGRADES AVANÇADOS
    { id:"chain_react", name:"Reação em Cadeia", desc:"Bônus +10% a cada vitória consecutiva", cost:1600, unlock:800, effect:()=>{
        hasChainReact = true;
        addLog("> Reação em Cadeia desbloqueada!", "info");
    }},
    { id:"time_warp", name:"Distorção Temporal", desc:"+5 F/s a cada hora de jogo", cost:1800, unlock:900, effect:()=>{
        setInterval(() => {
            cps += 5;
            addLog("> +5 F/s (Distorção Temporal)", "info");
        }, 3600000);
        addLog("> Distorção Temporal ativada!", "info");
    }},
    { id:"god_mode", name:"Modo Divino", desc:"Multiplicador permanente +100%", cost:8000, unlock:4000, effect:()=>{
        multiplier*=2;
        addLog("> Modo Divino desbloqueado!", "buy");
    }},
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
const betInput = document.getElementById("bet-input");
const btnLess = document.getElementById("btn-less");
const btnMore = document.getElementById("btn-more");

/* ======================
   CONTROLE DE APOSTA
====================== */
function updateBetDisplay(){
    betInput.value = betCost;
    playBtn.textContent = `Jogar (-${betCost})`;
}

betInput.addEventListener("change", ()=>{
    let newValue = parseInt(betInput.value);
    if(newValue < 1) newValue = 1;
    if(newValue > 1000) newValue = 1000;
    betCost = newValue;
    updateBetDisplay();
});

betInput.addEventListener("input", ()=>{
    let newValue = parseInt(betInput.value);
    if(newValue >= 1 && newValue <= 1000){
        betCost = newValue;
        playBtn.textContent = `Jogar (-${betCost})`;
    }
});

btnLess.addEventListener("click", ()=>{
    if(betCost > 1) betCost--;
    updateBetDisplay();
});

btnMore.addEventListener("click", ()=>{
    if(betCost < 1000) betCost++;
    updateBetDisplay();
});

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
    let rareChance = 0.01 * rareEventMultiplier;
    if(Math.random() < rareChance){
        let item = shopItems.find(i=>i.id==="jackpot_unlock");
        let rareReward = item && inventory["jackpot_unlock"] ? jackpotValue : 100;
        coins += rareReward;
        addLog(`> Evento raro: +${rareReward}`, "info");
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
    addLog(`> Comprado: ${item.name}`, "buy");
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
        setResultText("> Selecione uma aposta antes de jogar.");
        addLog("> Selecione uma aposta antes de jogar.", "info");
        return;
    }
    if(coins < betCost){
        setResultText(`Você precisa de pelo menos ${betCost} fichas para jogar.`);
        addLog("> Fichas insuficientes.", "info");
        return;
    }

    isSpinning = true;
    playBtn.disabled = true;

    coins -= betCost;

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
            addLog(`> ${res} → +${Math.floor(gain)}`, "win");
            setResultText(`Você ganhou +${Math.floor(gain)} fichas!`);
            animateResult("win");
            consecutiveWins++;
            
            // REAÇÃO EM CADEIA
            if(hasChainReact && consecutiveWins > 1){
                let chainBonus = Math.floor(gain * 0.1 * (consecutiveWins - 1));
                coins += chainBonus;
                addLog(`⚡ Bônus Cadeia (+${consecutiveWins-1}x): +${chainBonus}`, "win");
            }
        } else {
            let lostAmount = betCost;
            addLog(`> ${res} → -${lostAmount}`, "lose");
            setResultText(`Resultado: ${s1} ${s2} ${s3} - Você perdeu.`);
            animateResult("lose");
            consecutiveWins = 0;
            
            // MINERADOR PASSIVO
            if(hasMinerPassive){
                let steal = 2;
                coins += steal;
                addLog(`🔧 Minerador: +${steal}`, "info");
            }
            
            // SISTEMA DE RESGATE
            if(hasRebate){
                let rebateAmount = Math.floor(betCost * 0.3);
                coins += rebateAmount;
                addLog(`💰 Resgate (30%): +${rebateAmount}`, "info");
            }
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
updateBetDisplay();

});