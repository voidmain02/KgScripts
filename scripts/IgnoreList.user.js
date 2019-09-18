// ==UserScript==
// @name           IgnoreList
// @namespace      klavogonki
// @include        http*://klavogonki.ru/g*
// @author         Fenex
// @version        4.1.3
// @description    Чёрный список в чате
// @icon           https://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// ==/UserScript==

var BlackList = [];
var logins = [];
var ids = [];

function updateCache() {
    logins = [];
    ids = [];
    
    for(var i=0; i<BlackList.length; i++) {
        logins.push(BlackList[i].login);
        ids.push(BlackList[i].id);
    }
}

if(localStorage['KG_BlackList']) {
    BlackList = JSON.parse(localStorage['KG_BlackList']);
    updateCache();
}

function getLoginFromMem(id) {
    for(var i=0; i<BlackList.length; i++)
        if(BlackList[i].id == id)
            return BlackList[i].login;
    
    return null;
}

function editBlackList() {
    var now = []
    for(var i=0; i<BlackList.length; i++) {
        now.push(BlackList[i].id);
    }
    
    var a = prompt('Введите через запятую ID пользователей для добавления в чёрный список\n'+
                   '(л12345 - скрывать личку; п12345 - публичку; 12345 - скрывать и то и то):', now.toString());
	if(typeof a == 'object')
		return;

    var tmp_BlackList = [];
        
    a = a.split(',');
    
    for(var i=0; i<a.length; i++) {
        a[i] = a[i].trim();
        if(!/^л?п?\d+$/.test(a[i])) { continue }
        
        var userdata = document.querySelector('span[data-user="'+a[i]+'"]');
        if(userdata) {
            userdata = userdata.innerHTML;
        } else {
            userdata = getLoginFromMem(a[i]);
        }
        
        tmp_BlackList.push({
            id: a[i],
            login: userdata
        });
    }
    
    localStorage['KG_BlackList'] = JSON.stringify(tmp_BlackList);
    BlackList = tmp_BlackList;
    updateCache();
}

/* adding UI */
(function() {
    var mm = document.querySelectorAll('#chat-content .messages');
    for(var i=0; i<mm.length; i++) {
        var th = mm[i].getElementsByTagName('td')[1];
        var td = document.createElement('td');
        var img = document.createElement('img');
        img.setAttribute('style', 'cursor:pointer;');
        img.setAttribute('src', 'https://klavogonki.ru/img/exclamation.gif');
        img.setAttribute('title', 'Чёрный список');
        td.appendChild(img);
        th.parentNode.insertBefore(td, th);
        img.addEventListener('click', editBlackList);
    }
})();

function removeOlderMessages() {
    
}

/* monitoring */
setInterval(function() {
    if(!BlackList.length) { return; }
    
    var messages = document.querySelectorAll('.chat .messages-content p');
    for(var i=0; i<messages.length; i++) {
        if(messages[i].hasAttribute('checked')) { continue; }
        
        var username = messages[i].getElementsByClassName('username');
        if(username.length) {
            var id = username[0].getElementsByTagName('span')[0].getAttribute('data-user');
            if(~ids.indexOf(id)) {
                messages[i].style.display = 'none';
            } else {
                var isPrivate = messages[i].getElementsByClassName('private');
                if (isPrivate.length) {
                    if(~ids.indexOf('л'+id))
                        messages[i].style.display = 'none';
                    //TODO: автоответчик
                } else {
                    if(~ids.indexOf('п'+id))
                        messages[i].style.display = 'none';			
                }				
            }

        } else {
            var sm = messages[i].getElementsByClassName('system-message');
            if(sm.length) {
                var login = sm[0].innerHTML.match(/^([^ ]+)/);
                if(login)
                    login = login[0];
                else
                    login = {};
                if(~logins.indexOf(login))
                    messages[i].style.display = 'none';
            }
        }
        
        messages[i].setAttribute('checked', 'BlackList');
    }
    
    // TODO
    // removeOlderMessages();    
}, 10);
