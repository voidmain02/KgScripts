// ==UserScript==
// @name          klavostats_links
// @namespace     klavogonki
// @version       2.2.0
// @description   Добавляет прямые ссылки на профиль игрока в КлавоСтатистике
// @include       http://klavogonki.ru/u/*
// @author        Lexin, Fenex
// ==/UserScript==

function main() {
	setInterval(function() {
        var menu = angular.element('.sidebar');
        
        if(!menu.length) return;
        if(menu.find('.klavostat-links').length) return;
        
        var player = angular.element('profile-header .name').contents().first().text().trim();
        var group = angular.element('<ul class="profile-nav klavostat-links"></ul>');
        
        group.append( angular.element(
            '<li>\
                <a href="http://stat.klavogonki.ru/players.php?extra&n=' + player + '">КлавоСтатистика</a>\
            </li>'
        ) );
        
        group.append( angular.element(
            '<li>\
                <a href="http://stat.klavogonki.ru/history.php#' + player + '">История игрока</a>\
            </li>'
        ) );
        
        group.append( angular.element(
            '<li>\
                <a href="http://klavogonki.ru/vocs/search?section=all&type=all&order=&changed=&searchtext=%D0%B0%D0%B2%D1%82%D0%BE%D1%80%3A' + player + '">\
                    Созданные словари\
                </a>\
            </li>'
        ) );
        
        menu.append(group);
        
    }, 500);
}

function execScript(source) {
	if (typeof source == 'function') {
		source = '(' + source + ')();';
	}
	
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.innerHTML = source;
	document.body.appendChild(script);
}

execScript(main);
