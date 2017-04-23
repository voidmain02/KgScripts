// ==UserScript==
// @name          KG_SeparateGameLink
// @namespace     klavogonki
// @include       http://klavogonki.ru/g/*
// @author        agile
// @description   Добавляет ссылку на создание нового заезда по текущему режиму (исключает возможность попадания в заезды других игроков).
// @version       1.0.2
// @icon          http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// @grant         none
// ==/UserScript==

function main () {
  function SeparateGame (params) {
    var urlParams = {
      submit: 1,
      gametype: params.gametype,
      type: params.type,
      level_from: params.level_from,
      level_to: params.level_to,
      timeout: params.timeout,
    };

    if (params.gametype === 'voc' && params.voc) {
      urlParams.voc = params.voc.id;
    }

    var arr = [];
    for (var i in urlParams) {
      arr.push(i + '=' + encodeURIComponent(urlParams[i]));
    }

    this.url = '/create/?' + (arr.join('&'));
    this.bindGlobalHandlers();
  }

  SeparateGame.prototype.createGame = function () {
    window.location.href = this.url;
  };

  SeparateGame.prototype.bindGlobalHandlers = function () {
    window.addEventListener('keydown', function (event) {
      // [Shift] + [Alt] + [N]:
      if (event.shiftKey && event.altKey && event.keyCode == 78) {
        event.preventDefault();
        event.stopPropagation();
        this.createGame();
        return false;
      }
    }.bind(this));
  };

  SeparateGame.prototype.createLink = function (node) {
    var link = document.createElement('a');
    link.href = this.url;
    link.innerHTML = 'Создать новый заезд';
    link.title = 'Горячая клавиша: Shift + Alt + N';
    link.style.display = 'inline-block';
    link.style.marginTop = '10px';
    node.parentNode.appendChild(link);
  };

  var scores = document.getElementById('userpanel-scores-container');
  var observer = new MutationObserver(function (mutations) {
    observer.disconnect();

    var desc = document.getElementById('gamedesc');
    if (!desc) {
      throw new Error('#gamedesc element not found.');
    }

    var span = desc.querySelector('span');
    if (!span) {
      throw new Error('#gamedesc span element not found.');
    }

    var descText = desc.textContent;
    if (/соревнование/.test(descText) || /квалификация/.test(descText)) {
      return false;
    }

    var gameType = span.className.split('-').pop();
    var vocId = gameType === 'voc' ? parseInt(span.querySelector('a').href.match(/vocs\/(\d+)/)[1]) : '';

    var type = 'normal';
    if (/одиночный/.test(descText)) {
      type = 'practice';
    } else if (/друзьями/.test(descText)) {
      type = 'private';
    }

    var levelFrom = 1;
    var levelTo = 9;
    var matches = descText.match(/для (\S+)–(\S+),/);
    var ranks = {
      'новичков': 1,
      'любителей': 2,
      'таксистов': 3,
      'профи': 4,
      'гонщиков': 5,
      'маньяков': 6,
      'суперменов': 7,
      'кибергонщиков': 8,
      'экстракиберов': 9,
    };
    if (matches) {
      levelFrom = ranks[matches[1]];
      levelTo = ranks[matches[2]];
    }

    matches = descText.match(/таймаут\s(\d+)\s(сек|мин)/);
    var timeout = matches[2] === 'сек' ? parseInt(matches[1]) : parseInt(matches[1]) * 60;

    var gameParams = {
      gametype: gameType,
      type: type,
      level_from: levelFrom,
      level_to: levelTo,
      timeout: timeout,
      voc: {
        id: vocId,
      }
    };

    var separateGame = new SeparateGame(gameParams);
    var again = document.querySelector('#again');
    if (!again) {
      throw new Error('#again element not found.');
    }

    separateGame.createLink(again);
  });
  observer.observe(scores, { childList: true, subtree: true, characterData: true });
}

var script = document.createElement('script');
script.textContent = '(' + main.toString() + ')();';
document.body.appendChild(script);
