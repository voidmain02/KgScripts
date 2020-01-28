// ==UserScript==
// @name         KG_OpacityBeforefocusTextRace
// @namespace    klavogonki
// @version      1.0.0
// @description  Набранный текст в текущей игре будет отображаться серым цветом (помогает легко ориентироваться в тексте).
// @author       Akmat
// @include      http://klavogonki.ru/g/*
// ==/UserScript==

"use strict";

function injectionCss() {
	const style = document.createElement('style');
	style.textContent = "#beforefocus { color: #cccccc !important; }";
	style.id = 'styleBeforefocus';
	if (!document.getElementById("styleBeforefocus"))
		document.head.appendChild(style);
}

function removeInjectionCss() {
	const delStyleTag = document.getElementById("styleBeforefocus");
	delStyleTag.parentNode.removeChild(delStyleTag);
}

function createElements() {
	const div    = document.createElement("div");
	const label  = document.createElement("label");
	const checkboxInput  = document.createElement("input");
	const node = document.querySelector('#params .rc');
	
	label.textContent = 'Набранный текст серый';
	label.htmlFor = 'opacityCheckboxInputId';

	checkboxInput.id = 'opacityCheckboxInputId';
	checkboxInput.type = 'checkbox';

	if (!!localStorage.getItem("opacityCheckboxStatus")) injectionCss();
	checkboxInput.checked = !!localStorage.getItem("opacityCheckboxStatus");

	node.appendChild(div);
	div.appendChild(checkboxInput);
	div.appendChild(label);
}

function is_gameRace() {
	const rightUrl = window.location.href;
	return !!rightUrl.match(/gmid/);
}

function checkInputOpacity() {
	document.getElementById("opacityCheckboxInputId")
	.addEventListener("change", (e) => {
		if (e.target.checked) {
			injectionCss();
			localStorage.setItem("opacityCheckboxStatus", 1);
		} else {
			removeInjectionCss();
			localStorage.setItem("opacityCheckboxStatus", "");
		}
	});
}

window.addEventListener("load", () => {
	if (is_gameRace()) {
		createElements();
		checkInputOpacity();
	}
});