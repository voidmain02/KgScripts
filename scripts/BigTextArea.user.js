// ==UserScript==
// @name           BigTextArea
// @namespace      klavogonki
// @include        http*://klavogonki.ru/forum*
// @author         Fenex
// @description    Увеличивает область для ввода текста на форуме.
// @version        1.2.0+kts
// @icon           https://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// ==/UserScript==
//edit width and height of textBox
if(!document.getElementById('KTS_BigTextArea')) {
	var fnx_rows = '15';
	var fnx_cols = '125';
	var textareas = document.getElementsByTagName('textarea');
	for (var i=0;i<textareas.length;i++) {
		textareas[i].rows = fnx_rows;
		textareas[i].cols = fnx_cols;
	}
}
