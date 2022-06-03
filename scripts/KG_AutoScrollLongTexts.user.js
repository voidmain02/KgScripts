// ==UserScript==
// @name           KG_AutoScrollLongTexts
// @version        1.0.3
// @namespace      klavogonki
// @author         NIN
// @description    Автоматическая прокрутка длинных текстов, чтобы помещались на экране
// @include        http*://klavogonki.ru/g/*
// @grant          none
// ==/UserScript==

(function() {
	var targetNode = document.getElementById('typetext');
	var config = { attributes: true, childList: true, subtree: true };
	const lines_max_threshold = 8;
	let lines = 5;
	let lines_bottom = 4;
	if (true) { // поблочно, как в марафоне
		lines = 8;
		lines_bottom = 2;
	}
	const lines_skip_qual = 3;
	var observer;

	if ($$(".gametype-sign.qual").length !== 1) { // не квалификация
		var init = 0;
		var h = 0;
		var init2 = 0;
		var lineHeight = 0;

		const callback = function(mutationsList, observer) {
			let a;
			if ( (!init2) && (a = jQuery("#fontsize_cont")) ) {
				if (game.getGametype() === 'marathon') {
					observer.disconnect();
					return;
				}
				lineHeight = parseInt(a.css("line-height"),10);
				targetNode.style.maxHeight = lines_max_threshold*lineHeight+"px";
				init2 = 1;
			}
			for(let mutation of mutationsList) {
				if (mutation.type === 'childList') {
					//if (mutation.target.getOpacity() === 1) {

						let el = document.getElementById('typefocus');
						if (!init) {
							init = 1;
							let prevH = targetNode.getHeight();
							h = Math.min(lines*lineHeight, prevH);
							if (prevH/lineHeight < lines_max_threshold) {
								observer.disconnect();
								return;
							}
							targetNode.style.height = h+"px";
							targetNode.style.overflow = "auto";
						};
						let h2 = el.offsetTop-(targetNode.offsetTop+targetNode.scrollTop);
						if (h2 > h-(lines_bottom+0.5)*lineHeight)
							targetNode.scrollTop = el.offsetTop-targetNode.offsetTop;
					//}
				}
			}
		};
		observer = new MutationObserver(callback);
		observer.observe(targetNode, config);
		let inject_css = document.createElement("style");
		inject_css.setAttribute("type", "text/css");
		inject_css.innerHTML = ''+
		'div#typetext:after {'+
			'content: " ";'+
			'white-space: pre;'+
			'height: 100%;'+
			'float: right;'+
		'}'+
		'';
		document.body.appendChild(inject_css);
	}
	else { // квалификация
		let g_font = document.createElement("link");
		g_font.href = "https://fonts.googleapis.com/css2?family=Manrope&display=swap";
		g_font.rel = "stylesheet";
		document.getElementsByTagName('head')[0].appendChild(g_font);

		const qual_font = "Manrope";
		const qual_fontsize = "20.2px";
		var lineHeight = 20.2*1.5;

		// https://stackoverflow.com/questions/9185630/find-out-the-line-row-number-of-the-cursor-in-a-textarea
		function trackRows() {

			var ininitalHeight, currentRow, firstIteration = true;
			var textarea = $("inputtext");

			var createMirror = function() {
				let textarea2 = jQuery('#inputtext');
				textarea2.after('<div class="autogrow-textarea-mirror"></div>');
				return textarea2.next('.autogrow-textarea-mirror')[0];
			}

			var growTextarea = function () {
				mirror.innerHTML = String(textarea.value.substring(0,textarea.selectionStart-1)).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />').replace(/ - /g,' ..... ') + '.<br/>.';
				calculateRowNumber();
			}

			var calculateRowNumber = function () {
				let currentHeight = 0;
				if(firstIteration){
					ininitalHeight = mirror.getHeight();
					currentHeight = ininitalHeight;
					firstIteration = false;
				} else {
					currentHeight = mirror.getHeight();
				}
				// Assume that textarea.rows = 2 initially
				currentRow = currentHeight/(ininitalHeight/2) - 1;

				targetNode.scrollTop = (currentRow-1-lines_skip_qual)*lineHeight;
			}

			// Create a mirror
			var mirror = createMirror();

			ininitalHeight = mirror.getHeight();

			// Bind the textarea's event
			textarea.onkeydown = growTextarea;
		};

		const callback2 = function(mutationsList, observer) {
			for(let mutation of mutationsList) {
				if (mutation.type === 'attributes') {
					observer.disconnect();
					let prevH = targetNode.getHeight();
					h = Math.min((1+lines_skip_qual*2)*lineHeight, prevH)
					if (prevH/lineHeight > lines_max_threshold) {
						targetNode.style.height = h+"px";
						targetNode.style.overflow = "auto";
					}
					if (mutation.target.getOpacity() === 1) {
						trackRows();
						return;
					} else {
						observer.observe(targetNode, config);
					}
				}
			}
		};
		observer = new MutationObserver(callback2);
		observer.observe(targetNode, config);

		var inject_css = document.createElement("style");
		inject_css.setAttribute("type", "text/css");
		inject_css.innerHTML = ''+
		'#typeblock div.correct_errors_text {'+
			'box-sizing: content-box;'+
			'padding: 1px 3px;'+
			'overflow: hidden;'+
			'width: 704px;'+
			'font-size: '+qual_fontsize+" !important;"+
			'font-family: '+qual_font+";"+
			'line-height: normal;'+
		'}'+
		'.autogrow-textarea-mirror {'+
			'display: none;'+
			'overflow-wrap: break-word;'+
			'white-space: normal;'+
			'width: 704px;'+
			'font-size: '+qual_fontsize+";"+
			'font-family: '+qual_font+";"+
			'line-height: normal;'+
		'}'+
		'textarea#inputtext {'+
			'overflow-wrap: break-word;'+
			'white-space: normal;'+
			'overflow: hidden;'+
			'padding: 1px 3px !important;'+
			'box-sizing: content-box;'+
			'width: 704px !important;'+
			'font-size: '+qual_fontsize+" !important;"+
			'font-family: '+qual_font+" !important;"+
			'line-height: normal;'+
		'}'+
		'';
		document.body.appendChild(inject_css);
	}
})();

