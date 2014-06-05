// ==UserScript==
// @name           IgnoreList
// @namespace      klavogonki
// @include        http://klavogonki.ru/g*
// @author         Fenex
// @version        3.1.4 KTS
// @icon           http://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// ==/UserScript==

var ILC = {};

ILC.init = function() {
	var ch = document.getElementsByClassName('chat');
	for(var i=0; i<ch.length; i++) {
		this.chats[ch[i].id.split('-')[1]] = {
			timer: false,
			count: 0
		};
	}
	
	var _this = this;
	
	setInterval(function() {
		for(var key in _this.chats) {
			var msgs = document.getElementById('chat-'+key).getElementsByTagName('p');
			if(msgs.length==_this.chats[key].count)
				continue;
			
			var start = _this.chats[key].count;
			_this.chats[key].count = msgs.length;
			
			for(var i=start; i<_this.chats[key].count; i++) {
				var user_elem = msgs[i].getElementsByClassName('username')[0];
				if(!user_elem)
					continue;
				var user_id = parseInt(user_elem.getElementsByTagName('span')[0].getAttribute('data-user'));
				if(_this.list.indexOf(user_id) != -1)
					msgs[i].style.display = 'none';
			}
		}
	}, 10);
}

ILC.openWin = function() {
	var a = prompt('Введите через запятую ID пользователей для добавления в чёрный список:', this.list);
	if(typeof a == 'object')
		return;
		
	a = a.split(',');
	for(var i=0; i<a.length; i++)
		a[i] = parseInt(a[i]);
	
	this.list = a;
	localStorage['ignoreList'] = JSON.stringify(a);		
}

ILC.__constructor = function() {
	this.list = localStorage['ignoreList'] ? JSON.parse(localStorage['ignoreList']) : '';
	this.chats = {};
}

var INNERHTML = 'var IgnoreListClass = '+ILC.__constructor;
for(var key in ILC) {
	if(key!='__constructor')
		INNERHTML += ';\r\n IgnoreListClass.prototype.' + key + ' = ' + ILC[key];
}
INNERHTML += '\r\n var IgnoreList = new IgnoreListClass; \r\n IgnoreList.init();';

if(!document.getElementById('KTS_IgnoreList')) {
	(function() {
		if(!document.getElementById('chat-content'))
			return;

		var m_c = document.getElementById('chat-content').getElementsByClassName('messages-content');

		var mm = document.getElementById('chat-content').getElementsByClassName('messages');
		for(var i=0; i<mm.length; i++) {
			var th = mm[i].getElementsByTagName('td')[1];
			var td = document.createElement('td');
			td.innerHTML = '<img style="cursor:pointer;" src="http://klavogonki.ru/img/exclamation.gif" title="Чёрный список" onclick="IgnoreList.openWin();" />';
				
			th.parentNode.insertBefore(td, th);
		}

		var s = document.createElement('script');
		s.innerHTML = INNERHTML;
		s.id = 'KTS_IgnoreList';
		document.body.appendChild(s);		

	})();
}