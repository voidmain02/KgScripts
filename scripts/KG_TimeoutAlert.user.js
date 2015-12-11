// ==UserScript==
// @name        KG_TimeoutAlert
// @author      Andre_Macareno, Fenex, un4given, agile
// @version     3.0.2
// @description Звуковое оповещение о старте игры
// @include     http://klavogonki.ru/g/*
// @include     http://www.klavogonki.ru/g/*
// ==/UserScript==

function main() {
    if (game.params.timeout < 45) {
        return;
    }

    soundManager.createSound('to_alert', 'http://klavogonki.ru/typo.mp3');

    game.to_alert_timer = setInterval(function() {
        var time = document.getElementById('waiting_timeout').innerHTML.match(/(\d{2}).(\d{2})/);
        if (!time || time.length!=3) {
            return;
        }
        var sec = parseInt(time[2]);
        var min = parseInt(time[1]);
        if (min == 0 && sec < 18) {
            if (game.to_alert_timer) {
                clearInterval(game.to_alert_timer);
            }
            soundManager.play('to_alert');
        }
    }, 500);
}

window.addEventListener('load', function() {
    var inject = document.createElement('script');
    inject.setAttribute('type', 'application/javascript');
    inject.appendChild(document.createTextNode('('+main.toString()+')()'));
    document.body.appendChild(inject);
});
