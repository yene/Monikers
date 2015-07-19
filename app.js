var completeDeck = [];
var generatedDeck = [];
var cards = [];

var teamA = {score: 0, players: 2};
var teamB = {score: 0, players: 2};
var teams = [teamA, teamB];
var currentTeam = 0;

var playerCount = 4;
var timeLimit = 60;

var round = 0;
var roundRules = ['Use ANY WORDS except the name itself, \nincluding other card text.',
'Use only ONE WORD.',
'NO LANGUAGE allowed, \nonly physical gestures and imitations.',
'Only use your hands.',
'No words, no movement, \njust a singular noise.'
];

// TODO: loading could be optimized
loadCardsFromJSON();

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('start-screen').addEventListener('start', function(e) {
    // GAME SETUP
    playerCount = e.detail.playerCount;
    timeLimit = e.detail.timeLimit;
    var a = Math.floor(playerCount / 2);
    var b = a+1;
    teams[0].players = a;
    teams[1].players = b;
    document.querySelector('start-screen').style.display = 'none';
    document.getElementById('table').style.display = 'block';

    createDeck();

    document.querySelector('round-timer').style.display = 'inline-block';
    document.querySelector('round-timer').addEventListener('timeout', function() {
      nextPlayer();
    });

    nextRound();

  });

  // LISTEN FOR WHEN CARDS ARE SCORED
  document.getElementById('table').addEventListener('scored', function(e) {
    var index = e.detail.index;
    teams[currentTeam].score = teams[currentTeam].score + cards[index].Points;
    cards[index] = null;

    var len = cards.filter(function(val) { return val !== null; }).length;
    if (len == 0) {
      document.querySelector('round-timer').stopTimer();
      nextRound();
      return;
    }
  });

});

function setupTable() {
  var html = '';
  cards.forEach(function(card, index, array) {
    if (card) {
      var t = escapeHTML(card.Text);
      html = html + `<moniker-card index="${index}" person="${card.Person}" text="${t}" genre="${card.Genre}" points="${card.Points}"></moniker-card>`
    }
  });
  document.getElementById('table').innerHTML = html;
}

function loadCardsFromJSON() {
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

function nextPlayer() {
  currentTeam = currentTeam === 0 ? 1 : 0;
  // reshuffel all skipped cards
  cards = shuffle(cards);
  setupTable();
  document.getElementById('table').scrollLeft = 0;
  swal({
    title: "Stop! Opponents turn.",
    text: "Teams take turns giving clues. Each player must take a turn as the clue giver before any teammates repeats the role.",
    }, function(){
      document.querySelector('round-timer').startTimer(timeLimit);
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
      generatedDeck.push(tmp[n]);
    }
  }
  cards = shuffle(generatedDeck).slice(0);
}

function nextRound() {
  round++;
  cards = shuffle(generatedDeck).slice(0);
  setupTable();
  document.getElementById('table').scrollLeft = 0;
  swal({
    title: 'Round ' + round,
    text: roundRules[round-1],
    }, function() {
      document.querySelector('round-timer').startTimer(timeLimit);
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
