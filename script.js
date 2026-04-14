let isSpinning = false;
const symbols = ["🔴","🔵","🟢","🟡","⚫"];

let coins = 100;
let currentBet = null;

const BET_COST = 10;

const rewards = {
    triplo: 200,        // x20
    par: 20,            // x2
    diferentes: 15      // x1.5
};

// elementos
const symbolsEl = document.getElementById("symbols");
const coinsEl = document.getElementById("coins");
const betEl = document.getElementById("currentBet");
const resultEl = document.getElementById("result");

document.getElementById("reset").addEventListener("click", () => {
    coins = 100;
    coinsEl.innerText = coins;

    resultEl.innerText = "Fichas reiniciadas.";
    resultEl.className = "";

    document.getElementById("reset").style.display = "none";
});

// selecionar aposta
document.querySelectorAll(".bet").forEach(btn => {
    btn.addEventListener("click", () => {
        currentBet = btn.dataset.bet;
        betEl.innerText = currentBet;

        document.querySelectorAll(".bet").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

// botão jogar
document.querySelector(".play").addEventListener("click", play);

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function evaluate(s1, s2, s3) {
    if (s1 === s2 && s2 === s3) return "triplo";
    if (s1 === s2 || s1 === s3 || s2 === s3) return "par";
    return "diferentes";
}

function animateRoll(finalSymbols, callback) {
    let count = 0;

    let interval = setInterval(() => {
        symbolsEl.innerText =
            `${getRandomSymbol()} ${getRandomSymbol()} ${getRandomSymbol()}`;
        count++;

        if (count > 10) {
            clearInterval(interval);
            symbolsEl.innerText = finalSymbols;
            callback();
        }
    }, 100);
}

function play() {
    if (isSpinning) return;
    isSpinning = true;
    if (!currentBet) {
        alert("Escolha uma aposta!");
        return;
    }

    if (coins < BET_COST) {
        alert("Sem fichas!");
        return;
    }

    coins -= BET_COST;

    let s1 = getRandomSymbol();
    let s2 = getRandomSymbol();
    let s3 = getRandomSymbol();

    let finalSymbols = `${s1} ${s2} ${s3}`;

    animateRoll(finalSymbols, () => {
        let resultType = evaluate(s1, s2, s3);

        resultEl.className = "";

        if (resultType === currentBet) {
            coins += rewards[currentBet];
            resultEl.innerText = "🎉 Você ganhou!";
            resultEl.classList.add("win");
        } else {
            resultEl.innerText = "❌ Você perdeu!";
            resultEl.classList.add("lose");
        }

        coinsEl.innerText = coins;
        isSpinning = false;
    });
    
    if (coins <= 0) {
    document.getElementById("reset").style.display = "block";
}
}