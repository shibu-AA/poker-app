const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["Ａ", "２", "３", "４", "５", "６", "７", "８", "９", "10", "Ｊ", "Ｑ", "Ｋ"];

function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank});
        }
    }
    return deck;
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function createCardElement(card) {
  const cardEl = document.createElement("div");
  cardEl.className = "card";

  const rankEl = document.createElement("div");
  rankEl.className = "rank";
  rankEl.textContent = card.rank;

  const suitEl = document.createElement("div");
  suitEl.className = "suit";
  suitEl.textContent = card.suit;

  switch (card.suit) {
    case "♠": cardEl.classList.add("spade"); break;
    case "♥": cardEl.classList.add("heart"); break;
    case "♦": cardEl.classList.add("diamond"); break;
    case "♣": cardEl.classList.add("club"); break;
  }

  cardEl.appendChild(suitEl);
  cardEl.appendChild(rankEl);
  return cardEl;
}

function displayBackCards(count, elementId) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.style.backgroundImage = "url('image/card_image/カード_裏.png')";
    container.appendChild(cardEl);
  }
}


function displayHand(hand, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";
    hand.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.className = "card";

        const rankEl = document.createElement("div");
        rankEl.className = "rank";
        rankEl.textContent = card.rank;

        const suitEl = document.createElement("div");
        suitEl.className = "suit";
        suitEl.textContent = card.suit;

        switch (card.suit) {
            case "♠": cardEl.classList.add("spade"); break;
            case "♥": cardEl.classList.add("heart"); break;
            case "♦": cardEl.classList.add("diamond"); break;
            case "♣": cardEl.classList.add("club"); break;
        }

        cardEl.appendChild(suitEl);
        cardEl.appendChild(rankEl);
        container.appendChild(cardEl);

    });
}


const rankValues = {
  "２": 2, "３": 3, "４": 4, "５": 5, "６": 6,
  "７": 7, "８": 8, "９": 9, "10": 10,
  "Ｊ": 11, "Ｑ": 12, "Ｋ": 13, "Ａ": 14,
};

const handRanks = {
  "ロイヤルフラッシュ": 10,
  "ストレートフラッシュ": 9,
  "フォーカード": 8,
  "フルハウス": 7,
  "フラッシュ": 6,
  "ストレート": 5,
  "スリーカード": 4,
  "ツーペア": 3,
  "ワンペア": 2,
  "ハイカード": 1
};

function getCombinations(cards, k) {
  const result = [];

  function combine(start, path) {
    if (path.length === k) {
      result.push(path);
      return;
    }
    for (let i = start; i < cards.length; i++) {
      combine(i + 1, [...path, cards[i]]);
    }
  }

  combine(0, []);
  return result;
}


function evaluateHand(hand) {
  const suits = hand.map(card => card.suit);
  const ranks = hand.map(card => rankValues[card.rank]).sort((a, b) => a - b);

  const sortedRanks = [...ranks].sort((a, b) => a - b);
  const isRoyal = ranks.toString() === "10,11,12,13,14";

  const isFlush = suits.every(s => s === suits[0]);

  const isStraight = ranks.every((v, i, arr) =>
    i === 0 || v === arr[i - 1] + 1
  ) || JSON.stringify(ranks) === JSON.stringify([2, 3, 4, 5, 14]);


  const countMap = {};
  for (let r of ranks) {
    countMap[r] = (countMap[r] || 0) + 1;
  }

  const counts = Object.values(countMap).sort((a, b) => b - a);

  if (isFlush && isRoyal) return "ロイヤルフラッシュ";
  if (isFlush && isStraight) return "ストレートフラッシュ";
  if (counts[0] === 4) return "フォーカード";
  if (counts[0] === 3 && counts[1] === 2) return "フルハウス";
  if (isFlush) return "フラッシュ";
  if (isStraight) return "ストレート";
  if (counts[0] === 3) return "スリーカード";
  if (counts[0] === 2 && counts[1] === 2) return "ツーペア";
  if (counts[0] === 2) return "ワンペア";

  return "ハイカード";
}

function evaluateBestHand(sevenCards) {
  const allCombos = getCombinations(sevenCards, 5);
  let bestHand = "";
  let bestScore = 0;

  for (let hand of allCombos) {
    const role = evaluateHand(hand);
    const score = handRanks[role];
    if (score > bestScore) {
      bestScore = score;
      bestHand = role;
    }
  }

  return bestHand;
}


let deck = [];
let playerHand = [];
let communityCards = [];
let revealedCount = 0;

document.getElementById("deal-button").addEventListener("click", () => {
  deck = shuffle(createDeck());
  playerHand = deck.slice(0, 2);
  communityCards = deck.slice(2, 7);
  revealedCount = 0;

  displayHand(playerHand, "player-hand");
  displayBackCards(5, "community-cards");

  document.getElementById("result").textContent = "";
});

document.getElementById("reveal-button").addEventListener("click", () => {
  if (revealedCount < 5) {
    const revealedCard = communityCards[revealedCount];
    const container = document.getElementById("community-cards");
    const cardEl = createCardElement(revealedCard);  // 表のカードを作る
    container.replaceChild(cardEl, container.children[revealedCount]); // 裏→表に差し替え
    revealedCount++;

    // 5枚目（リバー）をめくった直後に役を表示
    if (revealedCount === 5) {
      const combinedHand = [...playerHand, ...communityCards];
      const result = evaluateBestHand(combinedHand);
      document.getElementById("result").textContent = "あなたの役: " + result;
    }
  }
});


