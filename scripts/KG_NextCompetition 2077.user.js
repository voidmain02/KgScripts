// ==UserScript==
// @name           KG_NextCompetition 2077
// @version        0.14
// @description    Добавляет в блок ввода текста таймер со ссылкой на следующий икс
// @namespace      klavogonki
// @author         http://klavogonki.ru/u/#/490344/
// @include        http*://klavogonki.ru/g/*
// @run-at         document-end
// @grant          none
// ==/UserScript==

(function() {

    function httpGet(url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open("Get", url);
            xhr.onload = () => resolve(JSON.parse(xhr.responseText));
            xhr.onerror = () => reject(console.log(xhr.statusText));
            xhr.send();
        });
    }


    function getGamelist() {
        let url = location.protocol + '//klavogonki.ru/gamelist.data/';
        return httpGet(url)
    }


    async function init() {
        let resp = await getGamelist();
        resp.gamelist.forEach(x => {
            if (x.params.competition && x.type == 'open') {
                begintime = x.begintime;
                multiplier = x.params.regular_competition;
                gmid = x.id;
                return;
            }
        });

        updateBackBtn();

        if (begintime != null) {
            return updateTimer();
        } else {
            timer.innerText = 'иксы отдыхают';
            return setTimeout(init, 10000);
        }
    }


    function share() {
        if (gmid != null) {
            gamechatInput(location.protocol + '//klavogonki.ru/g/?gmid=' + gmid + ' ' + min + ':' + sec);
            gamechatSend();
        } else {
            console.log('чето беда какая-то картинка есть, а гмида нет');
        }
    }


    async function updateBackBtn() {
        let data = JSON.parse(localStorage[localStorageName]);
        let gmidcurrent = document.URL.match(/(\d+)/)[0];
        if (gmidcurrent == gmid) {
            backLink = data.currentGame.link;
            backBtn.style.display = '';
            backBtn.addEventListener('click', () => { window.location.href = backLink });
            return;
        }
        backBtn.addEventListener('click', () => { window.location.href = backLink })
        let info = await httpGet(location.protocol + '//klavogonki.ru/g/' + gmidcurrent + '.info');
        let currentMode = info.params.type;
        let currentMin = info.params.level_from;
        let currentMax = info.params.level_to;
        let currentTimeout = info.params.timeout;
        let currentGametypeId = info.params.gametype.match(/(\d+)/) ?
            info.params.gametype.match(/(\d+)/)[0] : info.params.gametype;
        if (currentGametypeId.match(/(\d+)/))
            currentGametypeId = 'voc&voc=' + currentGametypeId;
        let currentGameLink = location.protocol + '//klavogonki.ru/create/' +
            '?gametype=' + currentGametypeId +
            '&type=' + currentMode +
            '&level_from=' + currentMin +
            '&level_to=' + currentMax +
            '&timeout=' + currentTimeout +
            '&submit=1';

        data.currentGame.link = currentGameLink;
        data.currentGame.gmid = gmidcurrent;
        localStorage[localStorageName] = JSON.stringify(data);
    }


    function updateTimer() {
        if (begintime) {
            let timenow = Date.now().toString().slice(0, -3);
            let remaining = begintime - timenow;
            if (remaining > 0) {
                if (remaining < 30 && color == 'red !important')
                    color = '#af0000 !important';
                else if (remaining < 30)
                    color = 'red !important';
                else if (remaining < 60)
                    color = '#af0000 !important';
                else if (remaining < 300)
                    color = '#222222 !important';
                else
                    color = 'darkgrey !important';

                min = (() => {
                    if ((remaining / 60).floor().toString().length == 2)
                        return (remaining / 60).floor();
                    if ((remaining / 60).floor() >= 1)
                        return '0' + (remaining / 60).floor();
                    if ((remaining / 60).floor() == 0)
                        return '00';
                })();
                sec = (() => {
                    if ((remaining % 60).toString().length == 2)
                        return (remaining % 60);
                    if ((remaining % 60).toString().length == 1)
                        return '0' + (remaining % 60);
                })();
                if (multiplier > 0) {
                    timer.innerHTML = '<a style="color:' + color + '" href="/g/?gmid=' + gmid +
                    '" id="next-competition-2077-link" title="Перейти"><span style="color: #c1a300">x'
                    + multiplier + '</span> ' + min + ':' + sec + '</a>';
                } else {
                    timer.innerHTML = '<a style="color:' + color + '" href="/g/?gmid=' + gmid +
                    '" id="next-competition-2077-link" title="Перейти"><span style="color: darkgrey">x1</span> '
                        + min + ':' + sec + '</a>';
                }
                shareBtn.display = '';
                shareBtn.style.cursor = 'pointer';
                shareBtn.addEventListener('click', share);
                setTimeout(updateTimer, 1000);
            } else {
                shareBtn.display = 'none';
                shareBtn.style.cursor = 'auto';
                shareBtn.removeEventListener('click', share);
                timer.style.color = 'darkgrey';
                begintime = multiplier = gmid = min = sec = null;
                init();
            }
        } else {
            console.log('updateTimer: begintime error', begintime);
            setTimeout(init, 10000);
        }
    }


    function initSettings() {
        if (localStorage[localStorageName] === undefined) {
            localStorage[localStorageName] = defaultSettings;
        } else {
            let data = JSON.parse(localStorage[localStorageName]);
            if (JSON.parse(localStorage[localStorageName]).version !== version) {
                localStorage[localStorageName] = defaultSettings;
            } else {
                // verification


                //localStorage[localStorageName] = JSON.stringify(data);
            }
        }
    }


    const version = '0.14';
    const localStorageName = 'NextCompetition2077';
    const defaultSettings = JSON.stringify({
        //previousGame: {link: location.protocol +
        //               '//klavogonki.ru/create/?gametype=normal&type=normal&level_from=1&level_to=9&timeout=10&submit=1',
        //               gmid: 0},
        currentGame: {link: location.protocol +
                      '//klavogonki.ru/create/?gametype=normal&type=normal&level_from=1&level_to=9&timeout=10&submit=1',
                      gmid: 0},
        version: version
    });
    initSettings();

    let gamechatInput = (value) => { document.querySelectorAll('.chat')[1].querySelector('.text').value = value};
    let gamechatSend = () => { document.querySelectorAll('.chat')[1].querySelector('.send').click() };
    let shareBtn = '<svg id="next-competition-2077-share" viewBox="0 0 24 24"><title>Отправить в чат</title>'+
        '<path d="m18.5 20c-.061 0-.121-.011-.18-.033l-13-5c-.193-.074-.32-.26-.32-.467v-6c0-.207.127-.393.32-.467l13-5c.155-.06.326-.038.463.055.136.093.217.247.217.412v16c0 .165-.081.319-.217.412-.085.058-.183.088-.283.088zm-12.5-5.844 12 4.616v-14.544l-12 4.616z"/><path d="m5.5 15h-3.5c-1.103 0-2-.897-2-2v-3c0-1.103.897-2 2-2h3.5c.276 0 .5.224.5.5v6c0 .276-.224.5-.5.5zm-3.5-6c-.552 0-1 .448-1 1v3c0 .552.448 1 1 1h3v-5z"/><path d="m7.5 22h-3c-.249 0-.46-.183-.495-.43l-1-7c-.039-.273.151-.526.425-.565.268-.034.526.151.565.425l.939 6.57h2.006l-.668-5.954c-.03-.274.167-.521.441-.553.265-.029.521.167.553.441l.73 6.51c.016.142-.029.283-.124.389-.094.106-.229.167-.372.167z"/><path d="m20.5 9c-.161 0-.319-.078-.416-.223-.153-.229-.091-.54.139-.693l3-2c.228-.152.539-.092.693.139.153.229.091.54-.139.693l-3 2c-.085.057-.181.084-.277.084z"/><path d="m23.5 18c-.096 0-.192-.027-.277-.084l-3-2c-.229-.153-.292-.464-.139-.693.154-.23.466-.291.693-.139l3 2c.229.153.292.464.139.693-.097.145-.255.223-.416.223z"/><path d="m23.5 12.5h-3c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h3c.276 0 .5.224.5.5s-.224.5-.5.5z"/>';
    let backBtn = '<svg id="next-competition-2077-back" viewBox="0 0 512.001 512.001" style="display:none"><title>Вернуться в прошлый режим</title>' +
        '<path d="M384.834,180.699c-0.698,0-348.733,0-348.733,0l73.326-82.187c4.755-5.33,4.289-13.505-1.041-18.26 c-5.328-4.754-13.505-4.29-18.26,1.041l-82.582,92.56c-10.059,11.278-10.058,28.282,0.001,39.557l82.582,92.561	c2.556,2.865,6.097,4.323,9.654,4.323c3.064,0,6.139-1.083,8.606-3.282c5.33-4.755,5.795-12.93,1.041-18.26l-73.326-82.188 c0,0,348.034,0,348.733,0c55.858,0,101.3,45.444,101.3,101.3s-45.443,101.3-101.3,101.3h-61.58	c-7.143,0-12.933,5.791-12.933,12.933c0,7.142,5.79,12.933,12.933,12.933h61.58c70.12,0,127.166-57.046,127.166-127.166 C512,237.745,454.954,180.699,384.834,180.699z"/></svg>';
    let backLink = '';
    let timer = document.createElement('div');
    timer.id = 'next-competition-2077-timer';
    let container = document.createElement('div');
    container.id = 'next-competition-2077';
    let insertNode = document.querySelector('#typeplayblock').parentNode;
    container.insert(backBtn);
    container.append(timer);
    container.insert(shareBtn);
    insertNode.append(container);
    shareBtn = document.querySelector('#next-competition-2077-share');
    backBtn = document.querySelector('#next-competition-2077-back');


    let begintime;
    let multiplier;
    let gmid;
    let min;
    let sec;
    let color;
    init();


    (() => {
        let css = document.createElement('style');
        css.innerHTML =
            " #next-competition-2077 { " +
            " text-align: right; " +
            " font-family: monospace; " +
            " } " +

            " #next-competition-2077-timer { " +
            " display: contents; " +
            " } " +

            " #next-competition-2077-link { " +
            " outline: none; " +
            " margin: 0px 3px; " +
            " border: none !important; " +
            " } " +

            " #next-competition-2077-share, #next-competition-2077-back { " +
            " width: 1em; " +
            " margin: -2px 3px; " +
            " opacity: .5; " +
            " } " +
            " #next-competition-2077-share:hover, #next-competition-2077-back:hover { " +
            " opacity: 1; " +
            " } " +

            " #next-competition-2077-back:hover { " +
            " cursor: pointer; " +
            " } " +

            "";
        document.head.append(css);
    })();

})();
