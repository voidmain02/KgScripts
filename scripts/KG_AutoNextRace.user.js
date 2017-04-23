// ==UserScript==
// @name         KG_AutoNextRace
// @namespace    klavogonki
// @version      1.2.0
// @description  Добавляет возможность автоматического старта заездов и создания следующего после набора
// @author       Phemmer
// @include      http://klavogonki.ru/g/*
// ==/UserScript==

var interval_auto_next_check = 0;
function chbChanged() {
	var param = document.getElementById("auto_next_check");
	if (param.checked) 	{
		localStorage.autoNext_STATUS = '1';
		game.hostStart();
		interval_auto_next_check = setInterval(CheckArrive, 500);
	}
	else {
		localStorage.autoNext_STATUS = '0';
		clearInterval(interval_auto_next_check);
	}
}

function CheckArrive()
{
	if (document.title[0] == '[' && localStorage.autoNext_STATUS == '1')
	{
		modeName = document.querySelector(".you");
		if (modeName !== null && modeName.innerText.match(' место ') !== null)
		{
			setTimeout(GoToNext, 1500);
		}
	}
}

function GoToNext() {
	window.location='/g/' + document.location.href.substr(29, 5) + '.replay';
}


var IsCompetition = document.getElementById('gamedesc').innerText.match(/Обычный, соревнование/) !== null;
if (IsCompetition) return;

var params = document.getElementById("param_shadow");
if (params) {
	var elem = document.createElement("div");
	elem.id = "auto_next";
	elem.innerHTML = '<input id="auto_next_check" type="checkbox" onChange="chbChanged();"><label for="auto_next_check">Автоматически играть еще раз</label>' + '<input type="hidden" id="auto_next_flag">';
	params.parentNode.insertBefore(elem, params);
}

var script = document.createElement("script");
script.innerHTML = chbChanged + CheckArrive + GoToNext;
document.body.appendChild(script);

var param = document.getElementById("auto_next_check");

if (localStorage.autoNext_STATUS == '1')
{
    param.checked = 1;
    chbChanged();
}