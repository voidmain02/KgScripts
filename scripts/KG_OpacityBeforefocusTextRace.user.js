// ==UserScript==
// @name         KG_OpacityBeforefocusTextRace
// @namespace    klavogonki
// @version      1.0.0
// @description  Набранный текст в текущей игре будет отображаться серым цветом (помогает легко ориентироваться в тексте).
// @author       Akmat
// @include      http*://klavogonki.ru/g/*
// ==/UserScript==

"use strict";

function injectionCss() {
	const style = document.createElement('style');
	style.textContent = "#beforefocus { opacity: 0.1 !important; }";
	document.head.appendChild(style);
}

function is_gameRace() {
	const rightUrl = window.location.href;
	return !!rightUrl.match(/gmid/);
}

window.addEventListener("load", () => {
	if (is_gameRace()) injectionCss();
});
