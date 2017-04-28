// ==UserScript==
// @name         KG_AutoNextRace
// @namespace    klavogonki
// @version      1.3.0
// @description  Добавляет возможность автоматического старта заездов и создания следующего после набора
// @author       Phemmer
// @include      http://klavogonki.ru/g/*
// ==/UserScript==

var isCompetition = document.getElementById('gamedesc').innerText.match(/Обычный, соревнование/) !== null;
if (isCompetition) return;

var chbAutoNext;
var waitingForNext = false;
var params = document.getElementById("param_shadow");
if (params) {
	var elem = document.createElement("div");
	elem.id = "auto_next";
	elem.innerHTML = '<input id="auto_next_check" type="checkbox"><label for="auto_next_check">Автоматически играть еще раз</label><input type="hidden" id="auto_next_flag">';
	params.parentNode.insertBefore(elem, params);
	chbAutoNext = document.getElementById("auto_next_check");
	chbAutoNext.addEventListener("click", chbChanged, false);

	if (localStorage.autoNext_STATUS == '1')
	{
		chbAutoNext.checked = 1;
		game.hostStart();
	}
}

function chbChanged() {
	if (chbAutoNext.checked) 	{
		localStorage.autoNext_STATUS = '1';
		game.hostStart();
		CheckRating();
	}
	else {
		localStorage.autoNext_STATUS = '0';
		waitingForNext = false;
	}
}

document.getElementById("userpanel-scores-container").addEventListener("DOMSubtreeModified", CheckRating);

function CheckRating(){
	var rating = document.querySelector(".player.you .rating");
	if (localStorage.autoNext_STATUS == '1' &&
		rating !== null && rating.innerText.match(' место ') !== null &&
		waitingForNext === false)
	{
		waitingForNext = true;
		setTimeout(GoToNext, 2000);
	}
}

function GoToNext() {
	if (localStorage.autoNext_STATUS == '1')
		window.location='/g/' + document.location.href.substr(29, 5) + '.replay';
}


