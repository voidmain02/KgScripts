// ==UserScript==
// @name        KG_CenterAlignment
// @namespace   klavogonki
// @description Меняет стилевое оформление страницы заезда: поле ввода по центру, настройки скрыты
// @author      voidmain
// @license     MIT
// @version     1.0.0
// @include     http*://klavogonki.ru/g/*
// @grant       GM_addStyle
// @run-at      document-start
// ==/UserScript==
(function() {


var css = '#play-right .tl, #play-right .tr, #play-right .bl, #play-right .br { background: initial; }\
#play-right > div { -webkit-border-radius: 12px; -moz-border-radius: 12px; border-radius: 12px; -webkit-box-shadow: -4px 4px 5px 0px rgba(50, 50, 50, 0.3); -moz-box-shadow: -4px 4px 5px 0px rgba(50, 50, 50, 0.3); box-shadow: -4px 4px 5px 0px rgba(50, 50, 50, 0.3); }\
#play-right > div.play-right-toggle { -webkit-border-top-right-radius: 0; -webkit-border-bottom-right-radius: 0; -moz-border-radius-topright: 0; -moz-border-radius-bottomright: 0; border-top-right-radius: 0; border-bottom-right-radius: 0; }\
#play-right > div:first-child { -webkit-border-top-left-radius: 0; -moz-border-radius-topleft: 0; border-top-left-radius: 0; }\
#play-right { width: 300px; margin-right: -306px; visibility: hidden; z-index: 100; }\
.play-right-toggle { position: absolute; width: 30px; height: 30px; left: -30px; top: 0; cursor: pointer; color: #aaa; font-size: 18px; padding: 4px; }\
.play-right-toggle:hover { color: #444; }';


if (typeof GM_addStyle != "undefined") {
	GM_addStyle(css);
} else if (typeof PRO_addStyle != "undefined") {
	PRO_addStyle(css);
} else if (typeof addStyle != "undefined") {
	addStyle(css);
} else {
	var node = document.createElement("style");
	node.type = "text/css";
	node.appendChild(document.createTextNode(css));
	var heads = document.getElementsByTagName("head");
	if (heads.length > 0) {
		heads[0].appendChild(node); 
	} else {
		document.documentElement.appendChild(node);
	}
}


function main() {
    $$$('.play-wrapper').css({
        position: 'relative',
        overflow: 'hidden'
    });
    
    $$$('#play-overall').detach().css({
        width: '740px',
        margin: '0 auto'
    }).appendTo('.play-wrapper');
    
    $$$('#play-right').detach().css({
        position: 'absolute',
        top: '0',
        right: '0',
        visibility: 'visible',
        'margin-left': '6px',
        'margin-bottom': '6px'
    }).appendTo('.play-wrapper');
    
    var attemptCount = 0;
    var playRightHeightCheckInterval = setInterval(function() {
        var playRightHeight = $$$('#play-right').outerHeight(true);
        if($$$('.play-wrapper').height() < playRightHeight) {
            $$$('.play-wrapper').css({
                'min-height': playRightHeight + 'px'
            });
        }
		attemptCount++;
        if(attemptCount === 30) {
			clearInterval(playRightHeightCheckInterval);
        }
    }, 100);
            
    $$$('.play-overall-table').remove();
        
    $$$('<div class="play-right-toggle" original-title="Показать настройки"><span class="glyphicon glyphicon-cog"></span></div>').tipsy({gravity: 'e'}).click(function() {
        if(parseInt($$$('#play-right').css('margin-right'), 10) == 0) {
            $$$('#play-right').animate({ 'margin-right': -$$$('#play-right').outerWidth(true) });
            $$$(this).attr('original-title', 'Показать настройки');
        } else {
            $$$('#play-right').animate({ 'margin-right': 0 });
            $$$(this).attr('original-title', 'Скрыть настройки');
        }
    }).css({
        'background-color': $$$('#params').css('background-color')
    }).appendTo('#play-right');
}


function exec(fn) {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + fn + ')();';
    document.body.appendChild(script);
    document.body.removeChild(script);
}

var readyStateInteractiveCheckInterval = setInterval(function() {
    if (document.readyState === 'interactive') {
        exec(main);
        clearInterval(readyStateInteractiveCheckInterval);
    }
}, 10);


})();
