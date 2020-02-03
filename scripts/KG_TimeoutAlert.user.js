// ==UserScript==
// @name        KG_TimeoutAlert
// @author      Andre_Macareno, Fenex, un4given, agile
// @version     3.0.6
// @description Звуковое оповещение о старте игры
// @include     http*://klavogonki.ru/g/*
// ==/UserScript==

function timeoutAlert() {
  var sound = new Audio('/typo.mp3');

  var desc = document.getElementById('gamedesc');
  if (!desc) {
      throw new Error('#gamedesc element not found.');
  }

  var matches = desc.textContent.match(/таймаут\s(\d+)\s(сек|мин)/);
  // No alert if the game timeout less than 45 seconds:
  if (matches && matches[1] < 45 && matches[2] === 'сек') {
    return false;
  }

  var timeContainer = document.getElementById('waiting_timeout');
  if (!timeContainer) {
    throw new Error('#waiting_timeout element not found.');
  }

  var timer = setInterval(function() {
    var remainingTime = timeContainer.textContent.match(/(\d{2}).(\d{2})/);
    if (!remainingTime) {
      throw new Error('remaining time was not parsed.');
    }

    // Make a sound alert in ≈ 17 seconds before the game start:
    if (parseInt(remainingTime[1]) === 0 && parseInt(remainingTime[2]) < 18) {
      clearInterval(timer);
      sound.play();
    }
  }, 500);
}

window.addEventListener('load', function () {
  var inject = document.createElement('script');
  inject.appendChild(document.createTextNode('(' + timeoutAlert.toString() + ')()'));
  document.body.appendChild(inject);
});
