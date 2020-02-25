// ==UserScript==
// @name           KG_PrivateChatLink
// @namespace      klavogonki
// @include        http*://klavogonki.ru/gamelist/
// @include        http*://klavogonki.ru/g/*
// @author         agile
// @description    Приватный диалог в чате по Shift + клик ЛКМ по нику пользователя в окне сообщений
// @version        1.1.0
// @icon           https://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

(function () {
  var matches = document.body.msMatchesSelector ? 'msMatchesSelector' : 'matches';

  window.addEventListener('click', function (event) {
    if (!event.shiftKey) {
      return;
    }

    var target = event.target;
    if (!target[matches]('.chat .username > span')) {
      return;
    }

    var inputs = document.querySelectorAll('.chat input.text');
    [].forEach.call(inputs, function (input) {
      // Check the input is visible:
      if (input.offsetParent) {
        input.value = '<' + target.textContent + '>';
        input.focus();
      }
    });

    event.stopPropagation();
  }, true);
})();
