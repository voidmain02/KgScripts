// ==UserScript==
// @name         ColoredChatlog
// @namespace    klavogonki
// @version      0.1.1
// @description  Окрашивает ники на странице лога чата, а также добавляет счётчик сообщений
// @author       Fenex
// @include      http*://klavogonki.ru/chatlogs/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    var BOT = '<Клавобот>';
    var nicks = {};
    nicks[BOT] = {messages: 0, color: "000000"};
    
    var colors = ["cccc00", "cc0000", "000000", "00cc00", "00cccc", "cc00cc", "0000cc", "ffd700", "ffaf00", "a7cc00", "d700ff", "afafff", "44afd7", "af8700", "af00af", "8700af", "8787af", "5faf87", "5f8700", "5f0000", "800080", "55d733", "6c6c6c", "ff87af", "00005f"];

    var getNextColor = (function() {
        var i = 0;
        return function() {
            if(++i >= colors.length)
                i = 0;
            return colors[i];
        };
    })();
    
    var fonts = document.getElementsByClassName('mn');
    for(var i=0; i<fonts.length; i++) {
        var nick = fonts[i].textContent;
        
        if(!nicks[nick]) {
            nicks[nick] = {
                messages: 0,
                color: getNextColor()
            };
        }
        

        nicks[nick].messages++;
        fonts[i].style.color = '#' + nicks[nick].color;
        if(nick == BOT)
            fonts[i].style.background = 'red';
    }
    
    var rc = document.getElementsByClassName('rc');
    if(!rc.length)
        return;
    
    rc = rc[rc.length - 1];
    
    var div = document.createElement('div');
    div.className = 'rc';
    div.innerHTML = '<div class="rct" onclick="sh(\'ColoredChatlog_Counter\');return false;">Count Messages</div> \
                    <div class="rcos" id="ColoredChatlog_Counter" style="display: none;"><br /><div class="rcot"></div></div>';
    var rcot = div.querySelector('.rcot');
    for(var nick in nicks) {
        var tmp = document.createElement('div');
        tmp.innerHTML = nick.replace(/[<>]/g, '') + ": " + nicks[nick].messages;
        rcot.appendChild(tmp);
    }
    
    rc.parentNode.insertBefore(div, rc.nextSibling);
})();
