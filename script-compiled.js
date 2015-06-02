'use strict';

var cards;
var currentCard = 0;
var score = [0, 0];
var currentTeam = 0;
var teamA = 0;
var teamB = 1;

document.addEventListener('DOMContentLoaded', function () {
  // TODO: loading could be optimized
  getCards();

  // setup buttons
  var e = document.getElementById('menu-btn');
  e.addEventListener('click', function () {
    console.log('got to menu');
  });
  var e = document.getElementById('skip-btn');
  e.addEventListener('click', function () {
    skipCard();
  });

  // setup swipe handler
  var myElement = document.getElementById('table');
  var hammertime = new Hammer(myElement);
  //hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
  hammertime.on('swipe', function (ev) {
    if (ev.direction === Hammer.DIRECTION_LEFT) {
      scoreCard();
    }
  });
  start();
});

function getCards() {
  var request = new XMLHttpRequest();
  request.open('GET', '/cards.json', true);
  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      cards = JSON.parse(this.response);
      setupCard(1, currentCard);
      setupCard(2, currentCard + 1);
    } else {
      console.log('We reached our target server, but it returned an error');
    }
  };
  request.onerror = function () {
    console.log('There was a connection error of some sort');
  };
  request.send();
}

function start() {
  var time = 60;
  var myElement = document.getElementById('timer-btn');
  var v = setInterval(function () {
    time--;
    myElement.innerHTML = time + 's';
  }, 1000);
  setTimeout(function () {
    // stop game, next team
    myElement.innerHTML = '0s';
    clearInterval(v);
  }, time * 1000);
}

function setupCard(nodeIndex, cardIndex) {
  var card = cards[cardIndex];
  document.querySelector('#card-' + nodeIndex + ' h1').innerHTML = card.Person;
  document.querySelector('#card-' + nodeIndex + ' p').innerHTML = card.Text;
  document.querySelector('#card-' + nodeIndex + ' .genre').innerHTML = card.Genre;
  document.querySelector('#card-' + nodeIndex + ' .points-value').innerHTML = card.Points;

  switch (card.Points) {
    case '1':
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = '#54b899';
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = '#54b899';
      break;
    case '2':
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = '#15ace5';
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = '#15ace5';
      break;
    case '3':
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = '#8f66a5';
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = '#8f66a5';
      break;
    case '4':
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = '#e84735';
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = '#e84735';
      break;
    default:
      console.log('I didn\'t know I this exists.');
  }
}

function nextCard() {
  currentCard++;
  var f = document.getElementById('card-' + 0);
  var s = document.getElementById('card-' + 1);
  var t = document.getElementById('card-' + 2);
  f.classList.add('card-transform');
  s.classList.add('card-transform');
  t.classList.add('card-transform');
  f.addEventListener('transitionend', function () {
    f.classList.add('notransition');
    s.classList.add('notransition');
    t.classList.add('notransition');
    f.classList.remove('card-transform');
    s.classList.remove('card-transform');
    t.classList.remove('card-transform');
    f.classList.remove('notransition');
    s.classList.remove('notransition');
    t.classList.remove('notransition');
    setupCard(1, currentCard);
    setupCard(2, currentCard + 1);
  }, false);
}

function scoreCard() {
  score[currentTeam] = score[currentTeam] + 1;
  nextCard();
}

function skipCard() {
  nextCard();
}
