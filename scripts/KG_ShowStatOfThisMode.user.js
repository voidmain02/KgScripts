// ==UserScript==
// @name         KG_ShowStatOfThisMode
// @namespace    klavogonki
// @version      1.2.3
// @description  Показывает в верхней панели статистику по текущему режиму: в заездах, на страницах словарей, на страницах топов
// @author       Phemmer
// @include      http://klavogonki.ru/g/*
// @include      http://klavogonki.ru/vocs/*
// @include      http://klavogonki.ru/top/day/*
// @include      http://klavogonki.ru/top/week/*
// ==/UserScript==

function main(){
	var modeName;
	var modeId;
	var url = document.location.href;
	if (url.substr(21, 4) == 'vocs')
	{
		modeName = document.querySelector("#profile-block.vocview-block .user-title .title");
		if (modeName === null) return;
		modeName = modeName.innerText.split('\n')[0];
		modeId = 'voc-' + url.match(/\d+/)[0];
		change();
	}

	else if (url.substr(21, 3) == 'top')
	{
		modeName = document.querySelector("#toplist ul.mode li.active span");
		if (modeName === null) return;
		modeName = modeName.innerText.replace('\n', '');
		modeId = url.match(/(week\/|day\/)([^\/]+)/)[2];
		change();
	}

	else if (url.substr(24, 4) == 'gmid')
	{
		var gamedesc = document.querySelector("#gamedesc span");
		var gametype = gamedesc.getAttribute("class").replace('gametype-', '');
		if (gametype == 'voc')
		{
			var a = gamedesc.querySelector("a");
			modeName = a.innerText;
			modeId = 'voc-' + a.getAttribute("href").match(/\d+/)[0];
		}
		else
		{
			modeName = gamedesc.innerText;
			modeId = gametype;
		}
		change();
	}

	function change()
	{
		var currentStat = document.getElementById('gametype-link').innerText;
		if (currentStat == modeName) return;
		var select = document.getElementById('gametype-select');
		for (var i = 0; i < select.options.length; i++)
		{
			if (select.options[i].value == modeId)
			{
				select.value = modeId;
				changeGametypeSelect();
				return;
			}
		}
	}
}

function exec(fn) {
    var script = document.createElement('script');
    script.setAttribute('type', 'application/javascript');
    script.textContent = '(' + fn + ')();';
    document.body.appendChild(script);
    document.body.removeChild(script);
}

window.addEventListener('load', function() {
    exec(main);
}, false);
