// ==UserScript==
// @name           chat2BBcode
// @namespace      klavogonki
// @include        http*://klavogonki.ru/gamelist*
// @include        http*://klavogonki.ru/g*
// @author         Fenex
// @description    Кнопка, показывающая окно с логом текущего разговора в чате, возможность экспорта лога с форматированием BB-кодов
// @version        2.1.5
// @icon           https://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// ==/UserScript==

function create_BBcode(mode) {
    var active_room = $$('#chat-title .active')[1].innerHTML=="Общий чат" ? 'general' : 'game' + location.href.match(/gmid=([\d]+)/)[1];
    var e = $('chat-'+active_room).getElementsByClassName('messages-content')[0].getElementsByTagName('div')[0].getElementsByTagName('p');
    var txt = '';
    for(var i=0; i<e.length; i++) {
        var m = new Array();
        if(e[i].getElementsByTagName('span')[1].className == "system-message") {
            m[1] = e[i].getElementsByClassName('time')[0].textContent.replace(/[\[\]]/g, '');
            m[2] = 'gray';
            m[3] = 'Клавобот';
            m[4] = e[i].getElementsByTagName('span')[1].innerHTML;
            m[5] = true;
        } else {
            m = e[i].innerHTML.match(/([\d]{2}\:[\d]{2}\:[\d]{2}).+style="color\:([#\d\w]+).+data-user="[\d]+">(.+)<\/span>&gt;<\/span>(.+)/);
        }
        
        if(mode)
            txt += ' [color=gray] ';
        txt += '[' + m[1] + ']';
        if(mode)
            txt += ' [/color] ';
        if(!m[5]){
            if(mode)
                txt += ' [color=' + m[2] + ']';
            txt += ' <' + m[3] + '> ';
            if(mode)
                txt += ' [/color] ';
            txt += m[4] + '\n';
        } else {
            if(mode)
                txt += ' [color=gray]';
            txt += m[4] + '\n';
            if(mode)
                txt += ' [/color] ';
        }
    }
    txt = txt.replace(/<a (.*?)>/ig, '').replace(/<\/a>/ig, '');
    while (true) {
        var regexp = /<img .+src="\/img\/smilies\/([A-Za-z0-9]+)\.gif" .+>/;
        sm = txt.match(regexp);
        if(!sm)
            break;
        if(mode)
            txt = txt.replace(regexp, '[img]'+location.protocol+'//klavogonki.ru/img/smilies/'+sm[1]+'.gif[/img]');
        else
            txt = txt.replace(regexp, ':'+sm[1]+':');
    }
    $('chat2BBcode_txt').innerText = txt;
    popalert('<textarea style="width:400px;height:300px;" id="chat2BBcode_textarea"></textarea><div style="text-align:center;"><input onclick="create_BBcode(1);" type="button" value="с BB-кодом" /><input onclick="create_BBcode(0);" type="button" value="без BB-кода" /></div><script>$("chat2BBcode_textarea").value = $("chat2BBcode_txt").innerText;$("chat2BBcode_textarea").select()</script>');
    
    return;
}

var s = document.createElement('div');
s.id = 'chat2BBcode_txt';
s.style.display = 'none';
document.body.appendChild(s);

s = document.createElement('script');
s.innerHTML = create_BBcode;
document.body.appendChild(s);

var array = [];
var room = null;
array.push('general');

if(room = location.href.match(/^https?:\/\/klavogonki\.ru\/g\/?\?gmid=([\d]{5})/))
    array.push('game'+room[1]);
    
for(var i=0; i<array.length; i++) {
    if(!document.getElementById('chat-'+array[i])) {
        continue;
    }
    
    var node = document.querySelectorAll('#chat-' + array[i] + ' table table td')[0];
        
    var td = document.createElement('td');
    td.innerHTML = '<input type="button" value="BBCode" onclick="create_BBcode(1)" />';
    node.parentNode.insertBefore(td, node.nextSibling);
}
