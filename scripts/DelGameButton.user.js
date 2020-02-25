// ==UserScript==
// @name           DelGameButton
// @namespace      klavogonki
// @include        http*://klavogonki.ru/g/*
// @author         Fenex, agile
// @description    Кнопка удаления результата в соревнованиях (работает только для Премиум-аккаунтов)
// @version        2.2.0
// @icon           https://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// ==/UserScript==

function delGameButton () {

  function deleteResult (gameId, playerRow) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/g/' + gameId + '.delresult');
    xhr.onload = function () {
      if (this.status !== 200) {
        throw new Error('Something went wrong while deleting the game result.');
      }

      playerRow.querySelector('.stats').textContent = 'Результат отменён.';
    }
    xhr.send();
  }

  function createButton (playerRow) {
    // Check the non-rating competition case:
    if (playerRow.querySelector('.delresult')) {
      return false;
    }

    var place = playerRow.querySelector('.rating .place');
    if (!place) {
      throw new Error('.player.you .rating .place not found.');
    }

    var gameIdMatches = window.location.href.match(/\?gmid=(\d+)/);
    if (!gameIdMatches) {
      throw new Error('Can\'t get the game id from the URL');
    }

    var gameId = gameIdMatches[1];
    var container = document.createElement('div');
    container.classList.add('delresult');
    // Adjusting position because the .rating_gained element will overlap us:
    container.style.left = '0';
    container.style.top = '-20px';
    var link = document.createElement('a');
    link.title = 'Отменить результат (только для Премиум)';
    link.addEventListener('click', deleteResult.bind(null, gameId, playerRow));
    var img = document.createElement('img');
    img.src = '/img/delete-16.gif';
    link.appendChild(img);
    container.appendChild(link);
    place.parentNode.insertBefore(container, place.nextSibling);
  }

  var scores = document.getElementById('userpanel-scores');
  if (!scores) {
    throw new Error('#userpanel-scores not found.');
  }

  var observer = new MutationObserver(function () {
    var finished = document.querySelector('.player.you .rating');
    // Are we finished the race yet?
    if (!finished || finished.style.display === 'none') {
      return false;
    }

    observer.disconnect();
    return createButton(document.querySelector('.player.you'));
  });
  observer.observe(scores, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

var script = document.createElement('script');
script.textContent = '(' + delGameButton.toString() + ')();';
document.body.appendChild(script);
