// ==UserScript==
// @name          Klavogonki: klavostats links
// @namespace     klavogonki
// @version       2.1 KTS
// @description   Добавляет прямые ссылки на профиль игрока в КлавоСтатистике
// @include       http://klavogonki.ru/u/*
// @author        Lexin
// @updateURL     
// @downloadURL   
// ==/UserScript==

function main(){
	function fn() {
		var menu = jQuery('.sidebar');
		if (menu.length) {
			var player = jQuery('.profile-header .name').clone().children().remove().end().text();
			player = jQuery.trim(player);
			var group = jQuery('<ul class="profile-nav"></ul>');
			group.append(jQuery('<li><a href="http://stat.klavogonki.ru/players.php?extra&n=' + player + '">КлавоСтатистика</a></li>'));
			group.append(jQuery('<li><a href="http://stat.klavogonki.ru/history.php#' + player + '">История игрока</a></li>'));
			group.append(jQuery('<li><a href="http://klavogonki.ru/vocs/search?section=all&type=all&order=&changed=&searchtext=%D0%B0%D0%B2%D1%82%D0%BE%D1%80%3A' + player + '">Созданные словари</a></li>'));
			menu.append(group);
		} else {
			setTimeout(fn, 500);
		}
	}
	setTimeout(fn, 500);
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

if(!document.getElementById('KTS_klavostats_links')) {
	execScript(main);

	var tmp_elem = document.createElement('div');
	tmp_elem.id = 'KTS_klavostats_links';
	tmp_elem.style.display = 'none';
	document.body.appendChild(tmp_elem);	
}
