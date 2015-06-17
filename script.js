var completeDeck = [];
var deck = [];
var cards = [];
var currentCard = 0;

var teamA = {score: 0, players: 2};
var teamB = {score: 0, players: 2};
var teams = [teamA, teamB];
var currentTeam = 0;

var playerCount = 4;
var timeLimit = 5;
var timer;
var timeout;

var round = 0;
var roundRules = ['Use ANY WORDS except the name itself, including other card text',
'Use only ONE WORD',
'NO LANGUAGE allowed, only physical gestures and imitations.',
'Only use your hands.',
'No words, no movement, just a singular noise.'
];

document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('start-game');
  btn.addEventListener('click', function() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('table').style.display = 'block';
    document.getElementById('timer-btn').innerHTML = timeLimit + 's';
    setup();
    start();
  });

  // TODO: loading could be optimized
  getCards();

  // setup buttons
  var e = document.getElementById('score-btn');
  e.addEventListener("click", function() {
    scoreCard();
  });
  var e = document.getElementById('skip-btn');
  e.addEventListener("click", function() {
    skipCard();
  });

  // setup swipe handler
  var myElement = document.getElementById('table');
  var hammertime = new Hammer(myElement);
  //hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
  hammertime.on('swipe', function(ev) {
      if (ev.direction === Hammer.DIRECTION_LEFT) {
        scoreCard();
      }
  });
});

function getCards() {
  var request = new XMLHttpRequest();
  request.open('GET', '/cards.json', true);
  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      completeDeck = JSON.parse(this.response);
    } else {
      console.log("We reached our target server, but it returned an error");
    }
  };
  request.onerror = function() {
    console.log("There was a connection error of some sort");
  };
  request.send();
}

function start() {
  var time = timeLimit;
  var myElement = document.getElementById('timer-btn');
  timer = setInterval(function() {
    time--;
    myElement.innerHTML = time + 's';
  }, 1000);
  timeout = setTimeout(function(){
    // stop game, next team
    myElement.innerHTML = '0s';
    clearInterval(timer);
    nextPlayer();

  }, timeLimit * 1000);
}

function setupCard(nodeIndex, cardIndex) {
  if (cards.length-1 < cardIndex) {
    console.log('not enough cards');
    return;
  }

  var card = cards[cardIndex];
  document.querySelector('#card-' + nodeIndex + ' h1').innerHTML = card.Person;
  document.querySelector('#card-' + nodeIndex + ' p').innerHTML = card.Text;
  document.querySelector('#card-' + nodeIndex + ' .genre').innerHTML = card.Genre;
  document.querySelector('#card-' + nodeIndex + ' .points-value').innerHTML = card.Points;

  switch (card.Points) {
    case 1:
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = "#54b899";
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = "#54b899";
      break;
    case 2:
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = "#15ace5";
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = "#15ace5";
      break;
    case 3:
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = "#8f66a5";
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = "#8f66a5";
      break;
    case 4:
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = "#e84735";
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = "#e84735";
      break;
    default:
      console.log("I didn't know I this exists.")
  }
}

function nextCard() {
  currentCard++;
  var f = document.getElementById('card-' + 0);
  var s = document.getElementById('card-' + 1);
  var t = document.getElementById('card-' + 2);
  f.classList.add("card-transform");
  s.classList.add("card-transform");
  t.classList.add("card-transform");
  f.addEventListener('transitionend', function() {
    f.classList.add("notransition");
    s.classList.add("notransition");
    t.classList.add("notransition");
    f.classList.remove("card-transform");
    s.classList.remove("card-transform");
    t.classList.remove("card-transform");
    f.classList.remove("notransition");
    s.classList.remove("notransition");
    t.classList.remove("notransition");
    setupCard(1, currentCard);
    setupCard(2, currentCard+1);
  }, false);
}

function scoreCard() {
  teams[currentTeam].score = teams[currentTeam].score + cards[currentCard].Points;

  if (cards.length == 1) {
    nextRound();
    return;
  }

  cards.splice(currentCard, 1);
  currentCard--;
  nextCard();
}

function skipCard() {
  nextCard();
}

function nextPlayer() {
  currentTeam = currentTeam === 0 ? 1 : 0;
  // reshuffel all skipped cards
  currentCard = 0;
  cards = shuffle(cards);
  setupCard(1, currentCard);
  setupCard(2, currentCard + 1);
  swal({
    title: "Stop, next teams turn",
    text: "Teams take turns giving clues. Each player must take a turn as the clue giver before any teammates repeats the role.",
    }, function(){
      start();
    }
  )
}

function updateSettings() {
  playerCount = document.getElementById('player-count').value;
  timeLimit = document.getElementById('time-limit').value ;

  var t = document.getElementById('group-text');
  if (playerCount % 2 != 0 ) {
    var a = Math.floor(playerCount / 2);
    var b = a+1;
    teams[0].players = a;
    teams[1].players = b;
    t.innerHTML = 'Make two groups with ' + a + ' and ' + b + ' players, <br> the group with ' + a +  ' players goes first.';
  } else {
    t.innerHTML = 'Make two groups with equal amount players.';
  }
}

function setup() {
  var tmp = shuffle(completeDeck);
  // deal 8 cards to each player, and pick 5
  for (var i=0;i<playerCount;i++) {
    for (var j=0;j<5;j++) {
      var n = Math.floor((Math.random() * tmp.length));
      tmp.splice(n, 1);
      deck.push(tmp[n]);
    }
  }

  cards = shuffle(deck).slice(0);
  setupCard(1, currentCard);
  setupCard(2, currentCard + 1);
}

function nextRound() {
  round++;
  clearInterval(timer);
  clearTimeout(timeout);
  swal({
    title: 'Round ' + round + ' is over.',
    text: 'Rules for next Round:\n' + roundRules[round],
    }, function() {
      cards = shuffle(deck).slice(0);
      setupCard(1, currentCard);
      setupCard(2, currentCard + 1);
      start();
    }
  )
}

function shuffle(c) {
  var l = c.length;
  for (var i = l-1; i > 0; i--) {
    var n = Math.floor((Math.random() * i));
    var temp = c[i];
    c[i] = c[n];
    c[n] = temp;
  }
  return c;
}

