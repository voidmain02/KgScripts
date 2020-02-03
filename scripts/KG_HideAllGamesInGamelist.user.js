// ==UserScript==
// @name           KG_HideAllGamesInGamelist
// @namespace      klavogonki
// @include        http*://klavogonki.ru/gamelist/*
// @author         Fenex
// @description    Добавляет возможность скрытия всех игр в общем списке
// @version        1.1.0
// @icon           https://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// ==/UserScript==

if (!document.getElementById('KTS_HAGIGL')) {
    if (localStorage['KTS_HAGIGL'] && localStorage['KTS_HAGIGL'] != 'NULL') {
        var s = document.createElement('style');
        s.id = 'KTS_HAGIGL_STYLE';
        s.innerHTML = localStorage['KTS_HAGIGL'];
        document.body.appendChild(s);
    }

    var createElem = document.createElement('span');
    createElem.innerHTML = ' <input title="Скрыть заезды" type="button" value="&times;" />';
    document.getElementById('delete').parentNode.insertBefore(createElem, document.getElementById('delete').nextSibling);
    createElem.onclick = function() {
        var e = document.getElementById('KTS_HAGIGL_STYLE');
        if (e) {
            if (e.innerHTML == '#gamelist-active{display:none;}') {
                localStorage['KTS_HAGIGL'] = e.innerHTML = '#gamelist{display:none;}';
            } else {
                document.body.removeChild(document.getElementById('KTS_HAGIGL_STYLE'));
                localStorage['KTS_HAGIGL'] = 'NULL';
            }
        } else {
            var s = document.createElement('style');
            s.id = 'KTS_HAGIGL_STYLE';
            localStorage['KTS_HAGIGL'] = s.innerHTML = '#gamelist-active{display:none;}';
            document.body.appendChild(s);
        }
    };

    var tmp_elem = document.createElement('div');
    tmp_elem.id = 'KTS_HAGIGL';
    tmp_elem.style.display = 'none';
    document.body.appendChild(tmp_elem);
}
