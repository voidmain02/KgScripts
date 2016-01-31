// ==UserScript==
// @name           QuickVocsStart
// @namespace      klavogonki
// @include        http://klavogonki.ru/vocs/*
// @author         Fenex
// @version        5.0.0+kts
// @description    Добавляет на страницу словаря три ссылки для быстрого старта игры. Параметры заездов для ссылок можно настроить
// @icon           http://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// ==/UserScript==
if(!document.getElementById('KTS_QuickVocsStart')) {
	(function() {
		var voc = location.href.match(/^http:\/\/klavogonki.ru\/vocs\/([\d]+)/);
		if(!voc)
			return;
		
		function getIDofUser() {
			var tmp = document.getElementsByClassName('user-block')[0];
			if(!tmp)
				return 0;
			return tmp.getElementsByClassName('btn')[0].href.match(/u\/#\/([\d]+)/)[1];
		}
		
		function generateLink(param) {
			var href = 'http://klavogonki.ru/create/?submit=1&gametype=voc';
			if(param.qual)
				href += '&qual=on';
			href += '&voc=' + param.vocid;
			href += '&type=' + param.type;
			href += '&level_from=' + param.level_from;
			href += '&level_to=' + param.level_to;
			href += '&timeout=' + param.timeout;
			return href;
		}
		
		function getBlock(block) {
			var td = document.createElement('td');
			td.setAttribute('class', 'links');
			td.setAttribute('style', 'padding-left:10px;');
			if(block) {
				td.innerHTML = '<a href="' + generateLink({
											vocid: vocid,
											type: "practice",
											level_from: 1,
											level_to: 9,
											timeout: 5,
											qual: false
										}) + '"><span>Одиночный, 5 сек</span></a>';
				td.innerHTML += '<a href="' + generateLink({
											vocid: vocid,
											type: "normal",
											level_from: 1,
											level_to: 9,
											timeout: 10,
											qual: false
										}) + '"><span>Открытый, 10 сек</span></a>';
				td.innerHTML += '<a href="' + generateLink({
											vocid: vocid,
											type: "normal",
											level_from: 1,
											level_to: 9,
											timeout: 20,
											qual: false
										}) + '"><span>Открытый, 20 сек</span></a>';
			} else {
				td.innerHTML = '<a href="' + generateLink({
											vocid: vocid,
											type: "private",
											level_from: 1,
											level_to: 9,
											timeout: 10,
											qual: false
										}) + '"><span>Дружеский, 10 сек</span></a>';
				td.innerHTML += '<a href="' + generateLink({
											vocid: vocid,
											type: "practice",
											level_from: 1,
											level_to: 9,
											timeout: 10,
											qual: true
										}) + '"><span>Квалификация, 10 сек</span></a>';
				td.innerHTML += '<a href="http://klavogonki.ru/profile/'+userid+'/stats/?gametype=voc-'+vocid+'"><span>Статистика</span></a>';
			}
			return td;
		}
		
		var userid = getIDofUser();
		var vocid = voc[1];
		var elem = document.getElementsByClassName('user-title')[0].getElementsByClassName('remove')[0].parentNode;
		elem.setAttribute('class', 'links');
		elem.parentNode.insertBefore(getBlock(0), elem.nextSibling);
		elem.parentNode.insertBefore(getBlock(1), elem.nextSibling);
	})();
	
	var tmp_elem = document.createElement('div');
	tmp_elem.id = 'KTS_QuickVocsStart';
	tmp_elem.style.display = 'none';
	document.body.appendChild(tmp_elem);
}
