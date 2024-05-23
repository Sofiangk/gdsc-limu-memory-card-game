const gridContainer = document.querySelector('.grid-container');
let cards = [];
let firstCard, secondCard;
let lockBoard = true;
let score = 0;
let time = 0;

let startTime; // to keep track of the start time
let stopwatchInterval; // to keep track of the interval
let elapsedPausedTime = 0; // to keep track of the elapsed time while stopped

document.querySelector('.score').textContent = score;

fetch('./data/cards.json')
  .then((res) => res.json())
  .then((data) => {
    cards = [...data, ...data];
    shuffleCards();
    generateCards();
  });

function startStopwatch() {
  if (!stopwatchInterval) {
    startTime = new Date().getTime() - elapsedPausedTime; // get the starting time by subtracting the elapsed paused time from the current time
    stopwatchInterval = setInterval(updateStopwatch, 1000); // update every second
    lockBoard = false;
  }
}

function stopStopwatch() {
  clearInterval(stopwatchInterval); // stop the interval
  elapsedPausedTime = new Date().getTime() - startTime; // calculate elapsed paused time
  stopwatchInterval = null; // reset the interval letiable
  lockBoard = true;
}

function resetStopwatch() {
  stopStopwatch(); // stop the interval
  elapsedPausedTime = 0; // reset the elapsed paused time letiable
  document.getElementById('stopwatch').innerHTML = '00:00'; // reset the display
}

function updateStopwatch() {
  let currentTime = new Date().getTime(); // get current time in milliseconds
  let elapsedTime = currentTime - startTime; // calculate elapsed time in milliseconds
  let seconds = Math.floor(elapsedTime / 1000) % 60; // calculate seconds
  let minutes = Math.floor(elapsedTime / 1000 / 60) % 60; // calculate minutes
  let displayTime = pad(minutes) + ':' + pad(seconds); // format display time
  document.getElementById('stopwatch').innerHTML = displayTime; // update the display
}

function pad(number) {
  // add a leading zero if the number is less than 10
  return (number < 10 ? '0' : '') + number;
}

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.setAttribute('data-name', card.name);
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener('click', flipCard);
  }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flipped');

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  score++;
  document.querySelector('.score').textContent = score;
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  resetBoard();
  shuffleCards();
  score = 0;
  resetStopwatch();
  document.querySelector('.score').textContent = score;
  gridContainer.innerHTML = '';
  generateCards();
}
