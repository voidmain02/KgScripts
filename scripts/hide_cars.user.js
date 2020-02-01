// ==UserScript==
// @name           hide_cars
// @version        0.7.2
// @namespace      klavogonki
// @description    Скрытие машинок во время набора текста
// @include        http*://klavogonki.ru/g/*
// @author         rgall, Fenex
// ==/UserScript==

function HideCars() {
	var param = document.getElementById("hide_cars_check");

	if (localStorage["hideCars_STATUS"] == '1')
		param.checked = 1;
	else
		return;

	var status = document.getElementById("status").className;
	if (status == "steady")
		hidecars_toggle("hide");
	
	var you = document.getElementById("players").getElementsByClassName("you")[0];
	if (you.getElementsByClassName("rating")[0].style.display == "") {
		clearInterval(document.getElementById("hide_cars_flag").value);
		hidecars_toggle("show");
	}
}

function hidecars_toggle(act){
	var dsp = "none";
	if (act == "show") {
		dsp = "";
	}
	/*var players = document.getElementsByClassName("player");
	for(var i=0;i<players.length; i++)
		players[i].style.display = dsp;
	*/
	document.getElementById('players').style.display = dsp;
}

function changeHideCars() {
	var param = document.getElementById("hide_cars_check");
	if (param.checked) {
		localStorage['hideCars_STATUS'] = '1';
	}
	else {
		localStorage['hideCars_STATUS'] = '0';
	}
}

if(!document.getElementById('KTS_taghide')) {
	var params = document.getElementById("param_shadow");
	if(params) {
		var elem = document.createElement("div");
		elem.id = "hide_cars_hidden";
		elem.innerHTML = '<input id="hide_cars_check" type="checkbox" onChange="changeHideCars();"><label for="hide_cars_check">Скрывать машины</label>' + '<input type="hidden" id="hide_cars_flag">';
			
		params.parentNode.insertBefore(elem, params);

		var script = document.createElement("script");
		script.innerHTML = HideCars + changeHideCars + hidecars_toggle +
		' document.observe("keydown", function(event){if (event.ctrlKey && event.keyCode == 38) hidecars_toggle("show");}); ' +
		' document.getElementById("hide_cars_flag").value = setInterval("HideCars()", 500); ';
		document.body.appendChild(script);
	}
	
	var tmp_elem = document.createElement('div');
	tmp_elem.id = 'KTS_taghide';
	tmp_elem.style.display = 'none';
	document.body.appendChild(tmp_elem);	
}
