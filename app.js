var completeDeck = [];
var deck = [];
var cards = [];
var currentCard = 0;

var teamA = {score: 0, players: 2};
var teamB = {score: 0, players: 2};
var teams = [teamA, teamB];
var currentTeam = 0;

var playerCount = 4;
var timeLimit = 60;
var timer;

var round = 0;
var roundRules = ['Use ANY WORDS except the name itself, including other card text',
'Use only ONE WORD',
'NO LANGUAGE allowed, only physical gestures and imitations.',
'Only use your hands.',
'No words, no movement, just a singular noise.'
];

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('start-screen').addEventListener('start', function(e) {
    playerCount = e.detail.playerCount;
    timeLimit = e.detail.timeLimit;
    var a = Math.floor(playerCount / 2);
    var b = a+1;
    teams[0].players = a;
    teams[1].players = b;

    document.querySelector('start-screen').style.display = 'none';
    document.getElementById('table').style.display = 'block';
    document.getElementById('timer-btn').innerHTML = timeLimit + 's';
    createDeck();

    var html = '';
    cards.forEach(function(card, index, array) {
      var t = escapeHTML(card.Text);
      html = html + `<moniker-card person="${card.Person}" text="${t}" genre="${card.Genre}" points="${card.Points}"></moniker-card>`
    });
    document.getElementById('table').innerHTML = html;

    //setupCard(1, currentCard);
    //setupCard(2, currentCard + 1);
    //start();
  });

  // TODO: loading could be optimized
  getCards();

/*
  // setup buttons
  var scorebtn = document.getElementById('score-btn');
  scorebtn.addEventListener("click", function() {
    scoreCard();
  });
  var skipbtn = document.getElementById('skip-btn');
  skipbtn.addEventListener("click", function() {
    skipCard();
  });
  var timerbtn = document.getElementById('timer-btn');
  timerbtn.addEventListener("click", function() {
    timerbtn.innerHTML = '&#10074;&#10074;';
    timer.toggle();
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
  */
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
  timer = new Timer(function() {
    time--;
    myElement.innerHTML = time + 's';
  }, function() {
    myElement.innerHTML = '0s';
    nextPlayer();
    timer.pause();
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

function createDeck() {
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
}

function nextRound() {
  round++;
  timer.pause();
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

function Timer(cbUpdate, cbEnd, delay) {
  var timeoutId, timerId, start, paused, remaining = delay;

  this.toggle = function() {
    if (paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  this.pause = function() {
    paused = true;
    window.clearTimeout(timeoutId);
    window.clearInterval(timerId);
    remaining -= new Date() - start;
  };

  this.resume = function() {
    paused = false;
    start = new Date();
    window.clearTimeout(timeoutId);
    window.clearInterval(timerId);
    timeoutId = window.setTimeout(cbEnd, remaining);
    timerId = window.setInterval(cbUpdate, 1000);
  };

  this.resume();
}

function escapeHTML(str, escapeQuotes) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  var escaped = str.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/"/g, '&quot;')
                   .replace(/>/g, '&gt;');

  if (escapeQuotes) {
    return escaped.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  return escaped;
}
