// ==UserScript== 
// @name           avgSize_BookPart
// @namespace      klavogonki
// @version        1.1.0+kts
// @include        http*://klavogonki.ru/vocs/*
// @author         Lexin13
// @description    Показывает для словарей-книг примерное количество символов на отрывок
// ==/UserScript== 

function calc(html)
{
    var re = /\d+/g; 
    var parts = re.exec(html); 
    var length = re.exec(html); 
    return length / parts;     
}

function pluralForm(d, b, a, c) {
    d = Math.abs(d) % 100;
    var n1 = d % 10;
    if (d > 10 && d < 20) {
        return c
    }
    if (n1 > 1 && n1 < 5) {
        return a
    }
    if (n1 == 1) {
        return b
    }
    return c
}
	
if(!document.getElementById('KTS_avgSize_BookPart')) {

	if (/https?:\/\/klavogonki.ru\/vocs\/(top\/|search\/?\?)/.test(location.href))
	{
	    var content = document.getElementsByClassName("symbols");
	    for (var i = 0; i < content.length; i++)
	    {
	        var e = content[i];
	        if (e.getElementsByTagName("strong")[0]
	        	&& e.getElementsByTagName("strong")[0].innerHTML.trim() === "Книга")
	        {
	            var partLength = calc(e.innerHTML);
	        	e.innerHTML += "<br>" + partLength.toFixed(0) + " <i>с/о</i>";
	        }
	    }
	}
	else
	{
	    var userContent = document.getElementsByClassName("user-content")[0];
	    if (userContent === undefined)
	        return;

	    var titles = userContent.getElementsByTagName("dt");
	    for (var i = 0; i < titles.length; i++)
	        if (titles[i].innerHTML.indexOf("Содержание:") != -1)
	            var content = userContent.getElementsByTagName("dd")[i];

	    var textPos = content.innerHTML.indexOf("<div"); 
	    var stat = content.innerHTML.substr(0, textPos).trim(); 

	    var text = content.innerHTML.substr(textPos); 
	    var partLength = calc(stat);

	    if (!isNaN(partLength)) 
	        content.innerHTML = stat + ", " + partLength.toFixed(0) + " " 
	        + pluralForm(partLength.toFixed(0), "символ", "символа", "символов") +" на отрывок " + text;
	}
	
	var tmp_elem = document.createElement('div');
	tmp_elem.id = 'KTS_avgSize_BookPart';
	tmp_elem.style.display = 'none';
	document.body.appendChild(tmp_elem);	
}
