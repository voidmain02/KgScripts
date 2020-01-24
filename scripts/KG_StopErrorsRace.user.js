// ==UserScript==
// @name         KG_StopErrorsRace
// @namespace    klavogonki
// @version      1.1.1
// @description  Останавливает заезд и создает новый если количество ошибок больше, чем указанное в настройках.
// @author       Akmat
// @include      http://klavogonki.ru/g/*
// ==/UserScript==

"use strict";

function addStylesForFailRaceText() {
    const css = `.stop-error-fail {
        color: red;
        border-radius: 3px;
        font-size: 49px;
        font-weight: bold;
        text-align: center;
        border: 2px solid red;
        padding: 20px 20px;}`,
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
    head.appendChild(style);

    style.type = 'text/css';
    if (style.styleSheet){
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
}

function createElements() {
	const is_on = localStorage.getItem("selectedItem") !== 'off';
	const div    = document.createElement("div");
	const select = document.createElement("select");
	const label  = document.createElement("label");
	const checkboxInput  = document.createElement("input");
	const checkboxLabel  = document.createElement("label");
	
	label.textContent = 'Лимит ошибок:';
	checkboxLabel.innerHTML = 'Авто&#8594;';
	checkboxLabel.htmlFor = 'checkboxInputId';
	select.name = 'stopErrorsSelect';
	label.id = 'stopLabelId';

	div.id = 'stopSelectedDivId';
	select.id = 'stopSelectId';
	checkboxInput.id = 'checkboxInputId';
	checkboxInput.type = 'checkbox';

	checkboxInput.checked = !!localStorage.getItem("autoNextErrorCheckbox");
	
	const node = document.getElementsByClassName("rc");
	node[2].appendChild(div);
	div.appendChild(label);
	div.appendChild(select);
	div.appendChild(checkboxInput);
	div.appendChild(checkboxLabel);
	checkboxInput.style.margin = '0 0 0 15px';
	label.style.margin = '0 31px 0 0';

	let option = document.createElement("option");

	if (!is_on) {
		option.selected = true;
		checkboxInput.disabled = true;
	}
	option.innerText = 'off';
	
	select.appendChild(option);


	for (let i = 0; i < 6; i++) {
		option = document.createElement("option");
		option.value = i;
		option.innerText = i;

		if (localStorage.getItem("selectedItem") !== 'off' &&
		 +localStorage.getItem("selectedItem") === i) {
			option.selected = true;
		}
		select.appendChild(option);
	}
}

function checkSelect() {
	document.getElementById("stopSelectId")
	.addEventListener("change", (e) => {
		const value = e.target.selectedOptions[0].textContent;
		localStorage.setItem("selectedItem", value);
		document.getElementById("checkboxInputId").disabled = value === 'off';
	});
}

function checkInputAutoNext() {
	document.getElementById("checkboxInputId")
	.addEventListener("change", (e) => {
		localStorage.setItem("autoNextErrorCheckbox", (e.target.checked) ? 1 : '');
	});
}


if (localStorage.getItem("selectedItem") === undefined) {
	localStorage.setItem("selectedItem", "off");
}

if (localStorage.getItem("autoNextErrorCheckbox") === undefined) {
	localStorage.setItem("autoNextErrorCheckbox", 1);
}

function is_competition() {
	const rightUrl = window.location.href;
	const xRace = document.getElementById('gamedesc').innerText.match(/Обычный, соревнование/);
	return !!rightUrl.match(/gmid/) && !xRace;
}

function stopGame() {
	const input  = document.getElementById("inputtext");
	input.disabled = true;
	input.style.backgroundColor = '#ccc';
}

function createNewGameAndRedirect() {
	const url = window.location.href.match(/[0-9]+/)[0];
	window.location = `/g/${url}.replay`;
}

function creatFailWord() {
    const p = document.createElement("p");
    p.innerText = 'Провал';
    p.setAttribute( 'class', 'stop-error-fail');
    
    if (document.getElementsByClassName('stop-error-fail').length === 0) {
        const textRace = document.getElementById('typetext');
        textRace.style.color = '#ccc';
        textRace.appendChild(p);
    }
}

window.addEventListener("load", () => {
	if (is_competition()) {
		createElements();
		checkSelect();
		addStylesForFailRaceText();
		checkInputAutoNext();

		const errors = document.getElementById("errors-label");

		window.addEventListener("keyup", (event) => {
			if (localStorage.getItem("selectedItem") !== 'off') {
				if (localStorage.getItem("selectedItem") === "0" &&
					errors.innerText === "1") {
					stopGame();
					creatFailWord();
					if (localStorage.getItem("autoNextErrorCheckbox"))
						createNewGameAndRedirect();
				}

				if (errors.innerText > localStorage.getItem("selectedItem")) {
					stopGame();
					creatFailWord();
					if (localStorage.getItem("autoNextErrorCheckbox"))
						createNewGameAndRedirect();
				}
			}
		});
	}
});