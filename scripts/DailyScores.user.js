// ==UserScript==
// @name          DailyScores
// @namespace     klavogonki
// @version       2.1.2
// @description   Показывает на верхней панели количество очков, полученных в заездах за день и за заезд, количество полученного в соревнованиях рейтинга
// @include       http://klavogonki.ru/*
// @author        Lexin13, agile
// @grant         none
// ==/UserScript==

function main () {
  function DailyScores (scoresRow, bonusesRow, rating) {
    this.scoresNode = this.createScoresPanel(scoresRow);
    this.ratingNode = this.createRatingPanel(bonusesRow);
    this.store = window.localStorage;
    this.prefix = 'DailyScores';
    this.values = {
      scores: { gained: 0, spent: 0 },
      rating: { gained: 0, total: rating },
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
        var element = document.createTextNode(element);
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
        if (new Date() < time) {
          this.values = data;
        }
        this.update({ rating: currentRating - this.values.rating.total });
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
    }

    this.save();
    var scores = this.values.scores;
    var scoresGainedTotal = (scores.gained > 0 ? '+' : '') + scores.gained;
    var scoresChange = document.createElement('small');
    scoresChange.textContent = diff.scores ? ' (' + diff.scores + ') ' : ' ';
    var scoresSpent = scores.spent > 0 ? '−' + scores.spent : '';
    this.setPanel(this.scoresNode, scoresGainedTotal, scoresChange,
        scoresSpent);
    this.setPanel(this.ratingNode, this.values.rating.gained);
  };

  DailyScores.prototype.setLastRatingGameId = function (id) {
    this.values.rating.lastRaceId = id;
    this.save();
  }

  DailyScores.prototype.getLastRatingGameId = function () {
    return this.values.rating.lastRaceId;
  }

  var scoresCell = document.getElementById('userpanel-scores-container');
  var bonusesCell = document.getElementById('userpanel-bonuses');
  var level = document.getElementById('userpanel-level');

  if (!scoresCell || !bonusesCell || !level) {
    return;
  }

  // Extract the current rating value:
  var rating = parseInt(/\d+/.exec(level.getAttribute('original-title')) || 0);

  var dailyScores = new DailyScores(scoresCell.parentNode,
    bonusesCell.parentNode, rating);

  function scoresChanged () {
    game.players.every(function (player) {
      if (player.you && player.info && player.info.record
          && player.info.record.scores_gained) {
        dailyScores.update({
          scores: parseInt(player.info.record.scores_gained)
        });
        return false;
      }
      return true;
    });
    if (game.params.competition) {
      var old = 0;
      window.setInterval(function () {
        if (game.ratings && game.ratings[window.__user__]) {
          var gained = game.ratings[window.__user__].g - old;
          old += gained;
          dailyScores.update({ rating: gained });
        }
      }, 1000);
    }
  }

  if (/http:\/\/klavogonki.ru\/g\/\?gmid=/.test(window.location.href)) {
    var observer = new MutationObserver(function () {
      observer.disconnect();
      scoresChanged();
    });
    observer.observe(scoresCell, {
      characterData: true,
      subtree: true,
      childList: true,
    });
    var injector = angular.element(document.body).injector();
    injector.invoke(function ($rootScope, Me, Socket) {
      Socket.bindEventToScope($rootScope,
        sprintf("counters:%s/scores", Me.id),
          function (data) {
        var finished = game.players.some(function (player) {
          return player.you && game.finished;
        });
        if (finished) {
          // Obtained scores for the completion of the challenge of the day:
          var scores = data.newAmount - parseInt(scoresCell.textContent);
          dailyScores.update({ scores: scores });
        }
      })
    });
    var gameObserver = window.setInterval(function () {
      if (!game || !game.params) {
        return;
      }

      window.clearInterval(gameObserver)
      if (game.params.competition &&
          game.id !== dailyScores.getLastRatingGameId()) {
        // Each rating game costs 150 score points:
        dailyScores.setLastRatingGameId(game.id);
        dailyScores.update({ scores: -150 });
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
