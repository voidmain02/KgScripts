// ==UserScript==
// @name          DailyScores
// @namespace     klavogonki
// @version       2.1.8
// @description   Показывает на верхней панели количество очков, полученных в заездах за день и за заезд, количество полученного в соревнованиях рейтинга
// @include       http://klavogonki.ru/*
// @author        Lexin13, agile
// @grant         none
// @run-at        document-idle
// ==/UserScript==

function main () {
  function DailyScores (scoresRow, bonusesRow, rating, ratingUpperBound) {
    this.scoresNode = this.createScoresPanel(scoresRow);
    this.ratingNode = this.createRatingPanel(bonusesRow);
    this.store = window.localStorage;
    this.prefix = 'DailyScores';
    this.values = {
      scores: { gained: 0, spent: 0 },
      rating: {
        gained: 0,
        total: rating,
        upperBound: ratingUpperBound,
      },
    };
    this.load();
  }

  DailyScores.prototype.createPanel = function (row, settings) {
    var caption = document.createElement('td');
    caption.textContent = settings.text;
    var target = document.createElement('td');
    target.align = 'left';
    target.className = settings.className;
    row.appendChild(caption);
    return row.appendChild(target);
  };

  DailyScores.prototype.setPanel = function (panel) {
    var elements = Array.prototype.slice.call(arguments);
    while (panel.firstChild) {
      panel.removeChild(panel.firstChild);
    }

    elements.forEach(function (element, index) {
      if (index === 0) {
        return;
      }

      if (element instanceof HTMLElement) {
        panel.appendChild(element);
      } else {
        element = document.createTextNode(element);
        panel.appendChild(element);
      }
    });
  };

  DailyScores.prototype.createScoresPanel = function (row) {
    return this.createPanel(row, {
      text: 'За день:',
      className: 'daily-scores',
    });
  };

  DailyScores.prototype.createRatingPanel = function (row) {
    return this.createPanel(row, {
      text: 'Рейтинг:',
      className: 'daily-rating',
    });
  };

  DailyScores.prototype.load = function () {
    var stored = this.store.getItem(this.prefix);
    if (stored) {
      try {
        var data = JSON.parse(stored);
        var time = new Date(data.time);
        // 23:30 UTC — the time of the last x2 competition of the day:
        time.setUTCHours(23);
        time.setUTCMinutes(40);
        var currentRating = this.values.rating.total;
        var currentRatingUpperBound = this.values.rating.upperBound;

        if (data.rating.upperBound === undefined) {
          data.rating.upperBound = currentRatingUpperBound;
        }

        if (new Date() < time) {
          this.values = data;
        }

        if (currentRatingUpperBound === this.values.rating.upperBound) {
          this.update({ rating: currentRating - this.values.rating.total });
        } else {
          var diff = this.values.rating.upperBound - this.values.rating.total;
          this.update({
            rating: diff + currentRating,
            ratingUpperBound: currentRatingUpperBound,
          });
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      this.update();
    }
  };

  DailyScores.prototype.save = function () {
    this.values.time = new Date();
    this.store.setItem(this.prefix, JSON.stringify(this.values));
  };

  DailyScores.prototype.update = function (diff) {
    diff = diff || {};
    if (diff.scores) {
      if (diff.scores > 0) {
        this.values.scores.gained += diff.scores;
      } else {
        this.values.scores.spent -= diff.scores;
      }
    }

    if (diff.rating) {
      this.values.rating.gained += diff.rating;
      this.values.rating.total += diff.rating;

      if (this.values.rating.total >= this.values.rating.upperBound) {
        this.values.rating.total -= this.values.rating.upperBound;
        this.values.rating.upperBound = undefined;
      }

      if (diff.ratingUpperBound) {
        this.values.rating.upperBound = diff.ratingUpperBound;
      }
    }

    function format (n) {
      return n % 1 === 0 ? n : n.toFixed(3);
    }

    this.save();
    var scores = this.values.scores;
    var scoresGainedTotal = (scores.gained > 0 ? '+' : '') + format(scores.gained);
    var scoresChange = document.createElement('small');
    scoresChange.textContent = diff.scores ? ' (' + format(diff.scores) + ') ' : ' ';
    var scoresSpent = scores.spent > 0 ? '−' + scores.spent : '';
    this.setPanel(this.scoresNode, scoresGainedTotal, scoresChange,
        scoresSpent);
    this.setPanel(this.ratingNode, this.values.rating.gained);
  };

  DailyScores.prototype.setLastRatingGameId = function (id) {
    this.values.rating.lastRaceId = id;
    this.save();
  };

  DailyScores.prototype.getLastRatingGameId = function () {
    return this.values.rating.lastRaceId;
  };

  var scoresCell = document.getElementById('userpanel-scores-container');
  if (!scoresCell) {
    throw new Error('#userpanel-scores-container element not found.');
  }

  var bonusesCell = document.getElementById('userpanel-bonuses');
  if (!bonusesCell) {
    throw new Error('#userpanel-bonuses element not found.');
  }

  var level = document.getElementById('userpanel-level');
  if (!bonusesCell) {
    throw new Error('#userpanel-level element not found.');
  }

  var link = document.querySelector('.dropmenu a');
  if (!link) {
    throw new Error('.dropmenu a element not found.');
  }

  // Extract the user id:
  var userId = parseInt(link.href.match(/\/u\/#\/(\d+)/)[1]);

  // Extract the current rating value and amount of rating needed for the next level:
  var matches = level.getAttribute('original-title').match(/Опыт:\s+(\d+)\s+\/\s+(\d+)/);
  var rating = parseInt(matches[1] || 0);
  var ratingUpperBound = parseInt(matches[2] || 0);

  var dailyScores = new DailyScores(scoresCell.parentNode,
    bonusesCell.parentNode, rating, ratingUpperBound);

  // Check each XMLHttpRequest response for required JSON with scores_gained field:
  function checkJSON (response) {
    try {
      var json = JSON.parse(response);
      if (!('players' in json)) {
        return false;
      }

      for (var i = 0; i < json.players.length; i++) {
        if ('record' in json.players[i] && json.players[i].record.user === userId) {
          return json.players[i].record.scores_gained;
        }
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  // Monitor rating changes at the active competition page:
  function observeRating () {
    if (!checkGameDesc(/соревнование/)) {
      return false;
    }

    var old = 0;
    window.setInterval(function () {
      var container = document.querySelector('.player.you .rating .rating_gained');
      if (!container) {
        return false;
      }

      var gained = parseInt(container.textContent) - old;
      old += gained;
      dailyScores.update({ rating: gained });
    }, 1000);
  }

  // Test the current game description text for the given RegExp object:
  function checkGameDesc (re) {
    var desc = document.getElementById('gamedesc');
    if (!desc) {
        throw new Error('#gamedesc element not found.');
    }

    return re.test(desc.textContent);
  }

  if (/\/\/klavogonki.ru\/g\/\?gmid=/.test(window.location.href)) {
    // Saving the original prototype method:
    var proxied = window.XMLHttpRequest.prototype.send;

    window.XMLHttpRequest.prototype.send = function () {
      this.addEventListener('load', function () {
        var scoresGained = checkJSON(this.responseText);
        // In single games and games with friends scores are not gained immediately:
        if (scoresGained && !checkGameDesc(/одиночный|друзьями/)) {
          dailyScores.update({ scores: scoresGained });
          observeRating();
        }
      }.bind(this));
      return proxied.apply(this, [].slice.call(arguments));
    };

    // Scores value gained for the challenge of the day completion can be obtained only
    // via listening of the existing WebSocket connection:
    var injector = angular.element(document.body).injector();
    injector.invoke(function ($rootScope, Me, Socket) {
      Socket.bindEventToScope($rootScope,
        sprintf("counters:%s/scores", Me.id),
          function (data) {
        var finished = document.querySelector('.player.you .rating');
        // Are we finished the race yet?
        if (!finished || finished.style.display === 'none') {
          return false;
        }

        var scores = data.newAmount - parseInt(scoresCell.textContent);
        dailyScores.update({ scores: scores });
      });
    });

    var gameObserver = window.setInterval(function () {
      var gameLoading = document.getElementById('gameloading');
      if (!gameLoading) {
          throw new Error('#gameloading element not found.');
      }

      if (gameLoading.style.display !== 'none') {
        return false;
      }

      window.clearInterval(gameObserver);

      // Extract the game id from the URL:
      var matches = window.location.href.match(/\/\/klavogonki.ru\/g\/\?gmid=(\d+)/);

      if (checkGameDesc(/соревнование/) && matches[1] !== dailyScores.getLastRatingGameId()) {
        dailyScores.setLastRatingGameId(matches[1]);
        // Each "x" competition costs 50 score points:
        var cost = 50;
        var re = /\(x\d+\)/;
        var desc = document.getElementById('gamedesc').textContent;

        if (checkGameDesc(re)) {
          cost *= desc[desc.search(re) + 2];
        }

        dailyScores.update({ scores: -cost });
      }
    }, 1000);
  }
}

var script = document.createElement('script');
script.setAttribute('type', 'application/javascript');
script.textContent = '(' + main.toString() + ')();';
document.body.appendChild(script);
var style = document.createElement('style');
style.setAttribute('type', 'text/css');
style.appendChild(
  document.createTextNode(
    '.scores-table .daily-scores, .scores-table .daily-rating{' +
      'font-size: 14px; font-weight: 700' +
    '}' +
    '.scores-table .daily-scores{' +
      'color: #b7ffb3' +
    '}' +
    '.scores-table .daily-rating{' +
      'color: #f9dd80; text-align: left !important' +
    '}' +
    '.scores-table small{' +
      'font-weight: 400' +
    '}'
  )
);
document.head.appendChild(style);
