var allCards;
var cards;
var currentCard = 0;

var teamA = {score: 0, players: 2};
var teamB = {score: 0, players: 2};
var teams = [teamA, teamB];
var currentTeam = 0;

var playerCount = 4;
var timeLimit = 60;
var timer;

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
  var e = document.getElementById('menu-btn');
  e.addEventListener("click", function() {
    location.reload();
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
      allCards = JSON.parse(this.response);
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
  setTimeout(function(){
    // stop game, next team
    myElement.innerHTML = '0s';
    clearInterval(timer);
    console.log('stop, next teams turn');
  }, timeLimit * 1000);

}

function setupCard(nodeIndex, cardIndex) {
  var card = cards[cardIndex];
  document.querySelector('#card-' + nodeIndex + ' h1').innerHTML = card.Person;
  document.querySelector('#card-' + nodeIndex + ' p').innerHTML = card.Text;
  document.querySelector('#card-' + nodeIndex + ' .genre').innerHTML = card.Genre;
  document.querySelector('#card-' + nodeIndex + ' .points-value').innerHTML = card.Points;

  switch (card.Points) {
    case "1":
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = "#54b899";
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = "#54b899";
      break;
    case "2":
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = "#15ace5";
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = "#15ace5";
      break;
    case "3":
      document.querySelector('#card-' + nodeIndex + ' .genre').style.color = "#8f66a5";
      document.querySelector('#card-' + nodeIndex + ' .points').style.background = "#8f66a5";
      break;
    case "4":
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
  teams[currentTeam].score = teams[currentTeam].score + 1;
  nextCard();
}

function skipCard() {
  nextCard();
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
  // shuffle cards
  allCards = shuffle(allCards);

  // deal 8 cards to each player, and pick 5
  cards = [];
  for (var i=0;i<playerCount;i++) {
    for (var j=0;j<5;j++) {
      var n = Math.floor((Math.random() * allCards.length));
      allCards.splice(n, 1);
      cards.push(allCards[n]);
    }
  }

  // shuffle into one deck
  cards = shuffle(cards);

  setupCard(1, currentCard);
  setupCard(2, currentCard + 1);

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

