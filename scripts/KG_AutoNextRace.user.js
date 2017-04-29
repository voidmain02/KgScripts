// ==UserScript==
// @name         KG_AutoNextRace
// @namespace    klavogonki
// @version      1.4.0
// @description  Добавляет возможность автоматического старта заездов и создания следующего после набора
// @author       Phemmer
// @include      http://klavogonki.ru/g/*
// ==/UserScript==

var isCompetition = document.getElementById('gamedesc').innerText.match(/Обычный, соревнование/) !== null;
if (isCompetition) return;

var params = document.getElementById("param_shadow");
var elem = document.createElement("div");
elem.id = "auto_next";
elem.innerHTML = '<input id="auto_next_check" type="checkbox"><label for="auto_next_check">Автоматически играть еще раз</label>';
params.parentNode.insertBefore(elem, params);
var chbAutoNext = document.getElementById("auto_next_check");
chbAutoNext.addEventListener("click", chbChanged, false);

if (localStorage.autoNext_STATUS == '1'){
	chbAutoNext.checked = 1;
	game.hostStart();
}

var scores = document.getElementById('userpanel-scores-container' );
var observer = new MutationObserver(CheckRating);
observer.observe(scores, { childList: true, subtree: true, characterData: true });

function CheckRating(){
	var rating = document.querySelector(".player.you .rating" );
	if (rating === true && rating.style.display !== 'none' && localStorage.autoNext_STATUS == '1') {
		return false;
	}
	observer.disconnect();
	setTimeout(GoToNext, 1000);
}

function GoToNext() {
	if (localStorage.autoNext_STATUS == '1')
		window.location='/g/' + document.location.href.substr(29, 5) + '.replay';
}
function chbChanged() {
	if (chbAutoNext.checked) 	{
		localStorage.autoNext_STATUS = '1';
		game.hostStart();
		CheckRating();
	}
	else {
		localStorage.autoNext_STATUS = '0';
	}
}
