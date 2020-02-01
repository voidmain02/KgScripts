// ==UserScript==
// @name		KG_antipalevo
// @author		un4given (u.menya.vse@zzzae.biz)
// @version		1.2.0
// @description	Выделяет жирным шрифтом приватные сообщения в процессе набора, предотвращая казусы при ошибочной отправке шёпота в общий чат
// @include		http*://klavogonki.ru/g*
// ==/UserScript==

(function() {

	function antiPalevo(o) {
		if (/^\<.*\>/.test(o.value))
		{
			if (!/private/.test(o.className)) o.className+=" private"
		} else {
			o.className = o.className.replace(" private", "")
		}
	}

	if (window.self != window.top) return;

	var s = document.createElement('script');
	s.innerHTML = antiPalevo;
	document.body.appendChild(s);

	//attaching events...
	inputs = document.getElementsByClassName("text");
	for (i=0; i<inputs.length; i++)
	{
		inputs[i].setAttribute('onkeyup', 'antiPalevo(this)');
		inputs[i].setAttribute('onpaste', 'antiPalevo(this)');
	}
})()
