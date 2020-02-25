// ==UserScript==
// @name           PostOptionsPlus
// @description    Добавляет ссылки для быстрого обращения по имени и цитаты выделенного текста на форуме
// @version        2.2.0
// @author         olimo, Fenex
// @namespace      klavogonki
// @include        http*://klavogonki.ru/forum/*
// ==/UserScript==
function remember_sel() {
	sel_text = $selection.getText().trim();
}
function cite_selected(postnumber) {
	var username = document.getElementById('username-'+postnumber).innerText;
	var cite_sel = '[quote='+username+']'+sel_text+'[/quote]';
	var rep = document.getElementById('fast-reply_textarea');
	if (rep.value == '')
		rep.value += cite_sel;
	else
		rep.value += '\r\n'+cite_sel;
	document.getElementById('write-block').style.display = '';
	document.getElementById('write-link').style.display = 'none';
}
function ins_name(postnumber) {
	var username = document.getElementById('username-'+postnumber).innerText;
	var inserted_name = '[b]'+username+'[/b], ';
	var rep = document.getElementById('fast-reply_textarea');
	if (rep.value == '')
		rep.value += inserted_name;
	else
		rep.value += '\r\n'+inserted_name;
	openWrite();
}

function report_msg(postnumber) {
	var userid = document.getElementById('username-'+postnumber).href.replace(/[^0-9]/g, '');
    abuse(parseInt(userid));
    $('popconfirm').getElementsByTagName('textarea')[0].innerHTML = "Сообщение о нарушении на форуме\r\nURL: " + location.href.replace(/#[a-zA-Z0-9]+/g, '') + '\r\nPost: ' + postnumber;
}

function report_check(j) {
    j = parseInt(document.getElementById("username-"+j).href.replace(/[^0-9]/g, ""));
    var bool = true;
    var a = new Array(82885, 123190, 30297, 218552, 21, 111001);
    for(var i=0;i<a.length;i++) {
        if(a[i]==j)
            return !bool;
    }
    return bool;
}

if(!document.getElementById('KTS_PostOptionsPlus')) {
	if(document.getElementById('fast-reply_textarea')) {
		var cite_links = document.getElementsByClassName('post-opts');
		for(i=0;i<cite_links.length;i++) {
			cite_links[i].setAttribute('style', 'margin-top:25px');
			cite_links[i].getElementsByTagName('table')[0].setAttribute('width', '100%;');
			var postnumber = cite_links[i].parentNode.getElementsByTagName('div')[0].getAttribute('id').substring(5);
			var createElem = document.createElement('td');
			var report = '';
			if(report_check(postnumber))
				report = '<a style="margin-left:0px; margin-right:15px;" onclick = report_msg("'+postnumber+'"); title="Сообщить модераторам о нарушении">Пожаловаться</a>';
			createElem.innerHTML = '<a style="margin-left:0px; margin-right:15px;" onclick = ins_name("'+postnumber+'");>Имя</a> <a style="margin-left:0px; margin-right:15px;" onclick = cite_selected("'+postnumber+'"); onmouseover = remember_sel(); >Цитата</a>'+report;
			createElem.setAttribute('style', 'text-align:left;', 'width:50%');
			cite_links[i].getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0].parentNode.insertBefore(createElem,document.getElementsByClassName('post-opts')[i].getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('td')[0]);
		}
	}

	var s = document.createElement('script');
	s.innerHTML = "var sel_text = '';" + cite_selected + remember_sel + ins_name + report_msg;
	document.body.appendChild(s);

	var tmp_elem = document.createElement('div');
	tmp_elem.id = 'KTS_PostOptionsPlus';
	tmp_elem.style.display = 'none';
	document.body.appendChild(tmp_elem);	
}
