// ==UserScript==
// @name           KG_AntiBackspace
// @namespace      klavogonki
// @include        http*://klavogonki.ru/g/*
// @author         Fenex, agile
// @description    Отключает действие «Назад» браузера по нажатию на Backspace в заездах
// @version        1.2.0
// @icon           https://www.gravatar.com/avatar/d9c74d6be48e0163e9e45b54da0b561c?r=PG&s=48&default=identicon
// ==/UserScript==

window.addEventListener('keydown', function(e) {
    var key = e.keyIdentifier || e.keyCode;
    if (key === 'U+0008' || key === 'Backspace' || key === 8) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    }
}, true);
