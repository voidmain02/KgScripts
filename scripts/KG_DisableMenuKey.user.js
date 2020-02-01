// ==UserScript==
// @name        KG_DisableMenuKey
// @namespace   klavogonki
// @description Отключает кнопку ContextMenu в поле ввода текста во время заезда
// @author      agile
// @version     1.0.1
// @include     http*://klavogonki.ru/g/*
// @grant       none
// @run-at      document-end
// ==/UserScript==

function main() {
  var textbox = document.getElementById('inputtext');
  if (textbox) {
    window.addEventListener('contextmenu', function (event) {
      if (event.target === textbox) {
        event.preventDefault();
      }
    });
  } else {
    throw new Error('#inputtext element not found.');
  }
}

window.addEventListener('load', function() {
  var script = document.createElement('script');
  script.textContent = '(' + main.toString() + ')();';
  document.body.appendChild(script);
  document.body.removeChild(script);
});
