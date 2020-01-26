// ==UserScript==
// @name         KG_OpacityBeforefocusTextRace
// @namespace    klavogonki
// @version      1.0.0
// @description  Набранный текст в текушей игре будет выглядет серым цветом тем самым помогает легко ориентироваться в тексте когда набираете.
// @author       Akmat
// @include      http://klavogonki.ru/g/*
// ==/UserScript==

"use strict";

function createElements() {
	const div    = document.createElement("div");
	const label  = document.createElement("label");
	const checkboxInput  = document.createElement("input");

	label.textContent = 'Набранный текст серый';
	label.htmlFor = 'opacityCheckboxInputId';
	label.id = 'opacityLabel';

	div.id = 'opacityDiv';
	checkboxInput.id = 'opacityCheckboxInputId';
	checkboxInput.type = 'checkbox';

	checkboxInput.checked = !!localStorage.getItem("opacityCheckboxStatus");

	const node = document.getElementsByClassName("rc");
	node[2].appendChild(div);
	div.appendChild(checkboxInput);
	div.appendChild(label);
}

function is_competition() {
	const rightUrl = window.location.href;
	const xRace = document.getElementById('gamedesc').innerText.match(/Обычный, соревнование/);
	return !!rightUrl.match(/gmid/) && !xRace;
}

function checkInputOpacity() {
	document.getElementById("opacityCheckboxInputId")
	.addEventListener("change", (e) => {
		localStorage.setItem("opacityCheckboxStatus", (e.target.checked) ? 1 : '');
	});
}

if (localStorage.getItem("opacityCheckboxStatus") === undefined) {
	localStorage.setItem("opacityCheckboxStatus", 1);
}

window.addEventListener("load", () => {
	if (is_competition()) {
		createElements();
		checkInputOpacity();

		window.addEventListener("keyup", () => {
			const beforeFocus = document.getElementById("beforefocus");
			if (beforeFocus && +localStorage.getItem("opacityCheckboxStatus")) {
				beforeFocus.style.color = "#ccc";
			}
		});
	}
});