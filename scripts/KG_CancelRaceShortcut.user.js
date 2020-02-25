// ==UserScript==
// @name        KG_CancelRaceShortcut
// @namespace   klavogonki
// @description Добавляет сочетание Ctrl + Shift + Z для отмены результатов заезда
// @author      voidmain, unnamed777, novkostya
// @license     MIT
// @version     1.2.0
// @include     http*://klavogonki.ru/g/*
// @grant       none
// @run-at      document-end
// ==/UserScript==

function cancelRaceShortcut() {
  function deleteResult (gameId, playerStats) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/g/' + gameId + '.delresult');
    xhr.onload = function () {
      if (this.status !== 200) {
        throw new Error('Something went wrong while deleting the game result.');
      }

      playerStats.textContent = 'Результат отменён.';
    };
    xhr.send();
  }

  // Extract the game id from the URL:
  var matches = window.location.href.match(/\/\/klavogonki.ru\/g\/\?gmid=(\d+)/);
  if (!matches) {
      throw new Error('game id was not parsed.');
  }

  document.addEventListener('keydown', function(event) {
    // Shift + Ctrl + Z:
    if(event.shiftKey && event.ctrlKey && event.keyCode == 90) {
      var finished = document.querySelector('.player.you .rating');
      // Are we finished the race yet?
      if (!finished || finished.style.display === 'none') {
        return false;
      }

      deleteResult(matches[1], document.querySelector('.player.you .stats'));
    }
  }, false);
}

var script = document.createElement('script');
script.textContent = '(' + cancelRaceShortcut.toString() + ')();';
document.body.appendChild(script);
