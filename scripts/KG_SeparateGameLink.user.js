// ==UserScript==
// @name          KG_SeparateGameLink
// @namespace     klavogonki
// @include       http://klavogonki.ru/g/*
// @author        agile
// @description   Добавляет ссылку на создание нового заезда по текущему режиму (исключает возможность попадания в заезды других игроков).
// @version       1.0.0
// @icon          http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// @grant         none
// ==/UserScript==

function main () {
  function SeparateGame (params) {
    var urlParams = {
      submit: 1,
      gametype: params.gametype_clean,
      type: params.type,
      level_from: params.level_from,
      level_to: params.level_to,
      timeout: params.timeout,
    };
    if (params.gametype_clean === 'voc' && params.voc) {
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
    if (game.params) {
      game.separateGame = new SeparateGame(game.params);
      var again = document.querySelector('#again');
      if (again) {
        game.separateGame.createLink(again);
      }
    }
  });
  observer.observe(scores, { childList: true, subtree: true, characterData: true });
}

window.addEventListener('load', function () {
  var script = document.createElement('script');
  script.setAttribute('type', 'application/javascript');
  script.textContent = '(' + main.toString() + ')();';
  document.body.appendChild(script);
  document.body.removeChild(script);
}, false);
