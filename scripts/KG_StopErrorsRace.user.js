// ==UserScript==
// @name         KG_StopErrorsRace
// @namespace    klavogonki
// @version      1.0.0
// @description  Останавливает заезд и создает новый если количество ошибок больше, чем указанное в настройках.
// @author       Akmat
// @include      http://klavogonki.ru/g/*
// ==/UserScript==

"use strict";

function createElements(selected) {
	const div    = document.createElement("div");
	const select = document.createElement("select");
	const label  = document.createElement("label");
	
	label.textContent = 'Выберите количество ошибок';
	select.name = 'stopErrorsSelect';
	label.setAttribute("id", "stopLabelId");
	div.setAttribute("id", "stopSelectedDivId");
	select.setAttribute("id", "stopSelectId");

	const node = document.getElementsByClassName("rc");
	node[2].appendChild(div);
	document.getElementById('stopSelectedDivId').appendChild(label);
	document.getElementById('stopSelectedDivId').appendChild(select);
	document.getElementById('stopLabelId').style.margin = '0 5px 0 0';

	let option = document.createElement("option");
	
	if (!selected) {
		option.innerText = 'off';
		option.selected = selected;
	} else {
		option.innerText = 'off';
	}
	document.getElementById('stopSelectId').appendChild(option);


	for (let i = 1; i < 6; i++) {
		option = document.createElement("option");
		option.value = i;
		option.innerText = i;

		if (localStorage.selectedItem !== 'off') {
			if (Number(localStorage.selectedItem) === i) {
				option.selected = true;
			}
		}
		document.getElementById('stopSelectId').appendChild(option);
	}
}

function checkSelect() {
	document.getElementById("stopSelectId")
	.addEventListener("change", (e) => {
		const value = e.target.selectedOptions[0].innerHTML;
		localStorage.selectedItem = value;
	});
}

if (localStorage.selectedItem === undefined) {
	localStorage.selectedItem = 'off';
}

window.onload = function (){
	const rightUrl = window.location.href;
	const normalRaceX = document.getElementById('gamedesc').innerText.match(/Обычный, соревнование/);

	if (!!rightUrl.match(/gmid/) && normalRaceX === null) {
		const is_on = localStorage.selectedItem !== 'off';
		createElements(is_on);
		checkSelect();
	}
};

function stopGame(input) {
	input.disabled = true;
	input.style.backgroundColor = '#ccc';
}

function createNewGameAndRedirect() {
	const url = window.location.href.match(/[0-9]+/)[0];
	window.location = `/g/${url}.replay`;
}


window.addEventListener("keyup", (event) => {
	const numberAndSymbols = ' !\#$%&\'()*+-./`0123456789:;<=>?@[\\]^_ё';
	const rightUrl = window.location.href;

	if (!!rightUrl.match(/gmid/) && localStorage.selectedItem !== 'off') {
		const errors = document.getElementById("errors-label");
		const input  = document.getElementById("inputtext");
		const constter = event.key.toLowerCase();

		if (constter >= 'a' && constter <= 'z' ||
			constter >= 'а' && constter <= 'я' ||
			numberAndSymbols.indexOf(constter) !== -1) {

			if (errors.innerText >= localStorage.selectedItem) {	
				stopGame(input);
				createNewGameAndRedirect();
			}
		}
	}
});