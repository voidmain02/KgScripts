// ==UserScript==
// @name         WordHighlighting
// @namespace    klavogonki
// @version      0.12
// @author       490344
// @include      http://klavogonki.ru/g/*
// @include      https://klavogonki.ru/g/*
// @grant        none
// ==/UserScript==

(function() {

//settings initialization

	const version = '0.10';
	const defaultSettings = JSON.stringify({
		color: '#6fff7d',
		TFColor: '#222222',
		transparency: 128,
		highlightMode: 'слово + слово',
		transparencyBF: 0.4,
		widthText: 0,
		widthInput: 0,
		removeBr: 0,
		version: version
	});

	if (localStorage.wordHighlighting === undefined) {
		localStorage.wordHighlighting = defaultSettings;
	} else if (JSON.parse(localStorage.wordHighlighting).version !== version) {
		localStorage.wordHighlighting = defaultSettings;
	} else {
		let data = JSON.parse(localStorage.wordHighlighting);
		if ((data.color.slice(0, 1) !== '#') && (data.color.length !== 7)) {
			data.color = '#6fff7d';
		}
		if ((data.TFColor.slice(0, 1) !== '#') && (data.TFColor.length !== 7)) {
			data.TFColor = '#6fff7d';
		}
		if ((data.transparency < 0) || (data.transparency > 255)) {
			data.transparency = 128;
		}
		if (!['слово + слово',
			  'слово + символ',
			  'символ + символ',
			  'нет'].includes(data.highlightMode)) {
			data.highlightMode = 'слово + слово';
		}
		if ((data.transparencyBF > 1) || (data.transparencyBF < 0)) {
			data.transparencyBF = 0.4;
		}
		if ((typeof(data.widthText) !== 'number') || (isNaN(data.widthText))) {
			data.widthText = 0;
		}
		if ((typeof(data.widthInput) !== 'number') || (isNaN(data.widthText))) {
			data.widthInput = 0;
		}
		if (![0, 1, 2, '0', '1', '2'].includes(data.removeBr)) {
			data.removeBr = 0;
		}
		localStorage.wordHighlighting = JSON.stringify(data);
	}

//#typefocus change observation

	var targetNode = document.getElementById('typetext');
	var config = { attributes: true, childList: true, subtree: true };
	const callback = function(mutationsList, observer) {
		for(let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				if (mutation.target.getOpacity() === 1) {
					observer.disconnect();
					if (document.getElementById('WH-span') !== null) {
						document.getElementById('WH-span').remove();
					}
					var el = document.createElement('span');
					el.setAttribute('id', 'WH-span');
					document.getElementById('typefocus').insert(el);
					//document.getElementById('typefocus').setAttribute('class', 'highlight');
					highlightCss(document.getElementById('typefocus').getWidth(),
								 document.getElementById('typefocus').getHeight()
								);
					removeBrInText();
					observer.observe(targetNode, config);
				}
			}
		}
	};
	var observer = new MutationObserver(callback);

	const paragraph = function(mutationsList, observer) {
		for(let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				if (mutation.target.getOpacity() === 1) {
					observerParagraph.disconnect();
					removeBrInText();
					observerParagraph.observe(targetNode, config);
				}
			}
		}
	};
	var observerParagraph = new MutationObserver(paragraph);

//making error observation

	var ifError = function(mutationsList, observer) {
		for(let mutation of mutationsList) {
			if (mutation.target.className === 'highlight_error') {
				observerIfError.disconnect();
				if (eHighlightBtn.innerText === 'слово + слово') {
					changeHL('слово');
				} else if (eHighlightBtn.innerText === 'слово + символ') {
					changeHL('символ');
				} else if (eHighlightBtn.innerText === 'символ + символ') {
					changeHL('символ');
				} else {
					changeHL('выкл');
				}
				observerIfNotError.observe(targetNode, config);
			}
		}
	};
	var ifNotError = function(mutationsList, observer) {
		for(let mutation of mutationsList) {
			if (mutation.target.className === 'highlight') {
				observerIfNotError.disconnect();
				if (eHighlightBtn.innerText === 'слово + слово') {
					changeHL('слово');
				} else if (eHighlightBtn.innerText === 'слово + символ') {
					changeHL('слово');
				} else if (eHighlightBtn.innerText === 'символ + символ') {
					changeHL('символ');
				} else {
					changeHL('выкл');
				}
				observerIfError.observe(targetNode, config);
			}
		}
	};
	var observerIfError = new MutationObserver(ifError);
	var observerIfNotError = new MutationObserver(ifNotError);
	var highlightBtn = document.getElementById('param_highlight');
	highlightBtn.style.setProperty('display', 'none');


//color button and transparency range

	var injPlace = document.getElementById('param_highlight').parentNode;

	var settingsContainer = document.createElement('div');
	var color = document.createElement('input');
	var transparency = document.createElement('input');

	settingsContainer.setAttribute('id', 'WH-settingsContainer');

	color.setAttribute('class', 'WH-colorInput');
	color.type = 'color';
	color.addEventListener('input', function() {
		highlightCss(document.getElementById('typefocus').getWidth(),
					 document.getElementById('typefocus').getHeight()
		);
		let data = JSON.parse(localStorage.wordHighlighting);
		data.color = color.value;
		localStorage.wordHighlighting = JSON.stringify(data);
	});
	color.value = JSON.parse(localStorage.wordHighlighting).color;

	transparency.setAttribute('id', 'WH-transparency');
	transparency.type = 'range';
	transparency.min = 0;
	transparency.max = 255;
	transparency.step = 1;
	transparency.valueAsNumber = 0;
	transparency.addEventListener('input', function() {
		highlightCss(document.getElementById('typefocus').getWidth(),
					 document.getElementById('typefocus').getHeight()
		);
		let data = JSON.parse(localStorage.wordHighlighting);
		data.transparency = transparency.valueAsNumber;
		localStorage.wordHighlighting = JSON.stringify(data);
	});
	transparency.value = JSON.parse(localStorage.wordHighlighting).transparency;

	settingsContainer.insert(color);
	settingsContainer.insert(transparency);
	injPlace.insertBefore(settingsContainer, injPlace.getElementsByTagName('br')[0]);

//error highlight button

	var eHighlightContainer = document.createElement('div');
	var eHighlightBtn = document.createElement('a');

	eHighlightBtn.setAttribute('id', 'WH-eHLBtn');
	eHighlightBtn.innerText = JSON.parse(localStorage.wordHighlighting).highlightMode;
	function hlmode () {
		if (this.innerText === 'нет') {
			this.innerText = 'слово + слово';
			observer.observe(targetNode, config);
			changeHL('слово');
			observerIfError.disconnect();
		} else if (this.innerText === 'слово + слово') {
			this.innerText = 'слово + символ';
			changeHL('слово');
			observerIfError.disconnect();
			observerIfError.observe(targetNode, config);
		} else if (this.innerText === 'слово + символ') {
			this.innerText = 'символ + символ';
			changeHL('символ');
			observerIfError.disconnect();
		} else if (this.innerText === 'символ + символ') {
			this.innerText = 'нет';
			changeHL('выкл');
			observerIfError.disconnect();
			observer.disconnect();
			try {
				document.getElementById('WH-style').remove();
			} catch(e) {}
		}
		let data = JSON.parse(localStorage.wordHighlighting);
		data.highlightMode = this.innerText;
		localStorage.wordHighlighting = JSON.stringify(data);
	}
	eHighlightBtn.addEventListener('click', hlmode);

	eHighlightContainer.style.setProperty('display', 'inline');

	eHighlightContainer.insert(eHighlightBtn);
	injPlace.insertBefore(eHighlightContainer, injPlace.getElementsByTagName('div')[0]);

//transparency #beforefocus

	var transparencyBFContainer = document.createElement('div');
	var transparencyBFRange = document.createElement('input');
	var transparencyBFLabel = document.createElement('div');

	transparencyBFRange.setAttribute('id', 'WH-transparencyBFRange');
	transparencyBFRange.type = 'range';
	transparencyBFRange.value = JSON.parse(localStorage.wordHighlighting).transparencyBF * 100;
	transparencyBFRange.addEventListener('input', function () {
		settingsCss();
		let data = JSON.parse(localStorage.wordHighlighting);
		data.transparencyBF = this.value / 100;
		localStorage.wordHighlighting = JSON.stringify(data);
	});

	transparencyBFLabel.setAttribute('class', 'WH-label');
	transparencyBFLabel.innerText = 'Прозрачность набранного текста';

	transparencyBFContainer.setAttribute('id', 'WH-transparencyBFContainer');

	transparencyBFContainer.insert(transparencyBFLabel);
	transparencyBFContainer.insert(transparencyBFRange);
    injPlace.insert(transparencyBFContainer);

//#typefocus color

	var TFColorContainer = document.createElement('div');
	var TFColorLabel = document.createElement('div');
	var TFColorInput = document.createElement('input');

	TFColorLabel.setAttribute('class', 'WH-label');
	TFColorLabel.innerText = 'Цвет текста — ';

	TFColorInput.setAttribute('class', 'WH-colorInput');
	TFColorInput.type = 'color';
	TFColorInput.value = JSON.parse(localStorage.wordHighlighting).TFColor;
	TFColorInput.addEventListener('input', function () {
		settingsCss();
		let data = JSON.parse(localStorage.wordHighlighting);
		data.TFColor = this.value;
		localStorage.wordHighlighting = JSON.stringify(data);
	});

	TFColorContainer.setAttribute('id', 'WH-TFColorContainer');

	TFColorContainer.insert(TFColorLabel);
	TFColorContainer.insert(TFColorInput);
	injPlace.insert(TFColorContainer);

//#typeblock #inputtext width

	var widthContainer = document.createElement('div');
	var widthTextLabel = document.createElement('div');
	var widthTextInput = document.createElement('input');
	var widthInputLabel = document.createElement('div');
	var widthInputInput = document.createElement('input');

	widthTextLabel.setAttribute('class', 'WH-label');
	widthTextLabel.innerText = 'Ширина текста — ';

	widthInputLabel.setAttribute('class', 'WH-label');
	widthInputLabel.innerText = 'Ширина ввода — ';

	widthTextInput.setAttribute('class', 'WH-widthInput');
	if (JSON.parse(localStorage.wordHighlighting).widthText !== 0)
		widthTextInput.value = JSON.parse(localStorage.wordHighlighting).widthText;
	widthTextInput.placeholder = 740;
	widthTextInput.addEventListener('keypress', function (e) {
		if (e.key.match(/\D/g) !== null)
			e.preventDefault();
	});
	widthTextInput.addEventListener('input', function () {
		settingsCss();
		let data = JSON.parse(localStorage.wordHighlighting);
		data.widthText = +this.value;
		localStorage.wordHighlighting = JSON.stringify(data);
	});

	widthInputInput.setAttribute('class', 'WH-widthInput');
	if (JSON.parse(localStorage.wordHighlighting).widthInput !== 0)
		widthInputInput.value = JSON.parse(localStorage.wordHighlighting).widthInput;
	widthInputInput.placeholder = 710;
	widthInputInput.addEventListener('keypress', function (e) {
		if (e.key.match(/\D/g) !== null)
			e.preventDefault();
	});
	widthInputInput.addEventListener('input', function () {
		settingsCss();
		let data = JSON.parse(localStorage.wordHighlighting);
		data.widthInput = +this.value;
		localStorage.wordHighlighting = JSON.stringify(data);
	});

	widthContainer.insert(widthTextLabel);
	widthContainer.insert(widthTextInput);
	widthContainer.insert(document.createElement('br'));
	widthContainer.insert(widthInputLabel);
	widthContainer.insert(widthInputInput);
	injPlace.insert(widthContainer);

//removeBrInText()

	var removeBrContainer = document.createElement('div');
	var removeBrSelect = document.createElement('select');
	var removeBrLabel = document.createElement('span');

	removeBrSelect.setAttribute('id', 'WH-removeBrSelect');
	function opt (value, text) {
		let el = document.createElement('option');
		el.value = value;
		el.text = text;
		return el;
	};
	removeBrSelect.insert(opt(0, 'Нет'));
	removeBrSelect.insert(opt(1, 'Кроме последнего'));
	removeBrSelect.insert(opt(2, 'Все'));
	removeBrSelect.value = JSON.parse(localStorage.wordHighlighting).removeBr;
	removeBrSelect.addEventListener('change', function() {
		let data = JSON.parse(localStorage.wordHighlighting);
		data.removeBr = this.value;
		localStorage.wordHighlighting = JSON.stringify(data);
	});

	removeBrLabel.innerText = 'Удалять абзацы ';

	removeBrContainer.insert(removeBrLabel);
	removeBrContainer.insert(removeBrSelect);
	injPlace.insert(removeBrContainer);

//START
	init();
	injPlace.getElementsByTagName('br')[0].remove();
	waitingForStart();
	settingsCss();

//FUNCTIONS

	async function init() {
		try {
			while (document.getElementById('main-block').style.getPropertyValue('display') === 'none') {
				await sleep(100);
				init();
				return;
			}
			if (eHighlightBtn.innerText.slice(1,2) === 'л') {
				changeHL('слово');
			} else if (eHighlightBtn.innerText.slice(1,2) === 'и') {
				changeHL('символ');
			} else {
				changeHL('выкл');
			}

			if (['слово + слово', 'слово + символ',
				 'символ + символ'].includes(eHighlightBtn.innerText)) {
				observerIfError.observe(targetNode, config);
			}
		} catch (error) {
			await sleep(100);
			init();
		}
	}

	async function waitingForStart() {
		if (!document.getElementById('typefocus')) {
			await sleep(100);
			waitingForStart();
		} else if (['слово + слово', 'слово + символ',
					'символ + символ'].includes(eHighlightBtn.innerText)) {
			observer.observe(targetNode, config);
		} else {
			observerParagraph.observe(targetNode, config);
		}
	}

	function changeHL(mode) {
		while (highlightBtn.innerText !== mode) {
			highlightBtn.click();
		}
	}

	function removeBrInText() {
		var br = document.getElementById('typetext').getElementsByTagName('br').length;
		if (removeBrSelect.value === '1') {
			if (game.getGametype() === 'marathon') {
				for (let i = 0; i < br - 2; i++) {
					document.getElementsByTagName('br')[0].remove()
				}
			} else {
				for (let i = 0; i < br - 1; i++) {
					document.getElementsByTagName('br')[0].remove()
				}
			}
		} else if (removeBrSelect.value === '2') {
			for (let i = 0; i < br; i++) {
				document.getElementsByTagName('br')[0].remove()
			}
		}
	}

	function highlightCss(w, h) {
		if (document.getElementById('WH-style') !== null) {
			document.getElementById('WH-style').remove();
		}

		var css =
			' #typeblock { ' +
			' z-index: 10; } ' +

			' .highlight { ' +
			' position: relative; ' +
			' text-decoration: none !important; }' +

			' #WH-span::before { ' +
			' content: ""; ' +
			' position: absolute; ' +
			' border-radius: 10px; ' +
			' background: ' + color.value + decimalToHex(transparency.valueAsNumber) + '; ' +
			' top: -2px; ' +
			' left: -4px; ' +
			' width: ' + (w + 7) + 'px; ' +
			' height: ' + (h + 5) + 'px; ' +
			' z-index: -1; } ' +

			' .highlight_error { ' +
			' position: relative; ' +
			' text-decoration: none !important; ';

		var style = document.createElement('style');
		style.setAttribute('id', 'WH-style');
		if (style.styleSheet) {
			style.stylesheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(style);
	}

	function settingsCss() {
		if (document.getElementById('WH-settings') !== null) {
			document.getElementById('WH-settings').remove();
		}
		var playersScale = 1;
		var left = 0;
		if ((+widthTextInput.value < 740) && (widthTextInput.value !== '')) {
			let inj = document.getElementById('paused');
			inj.insertBefore(document.createElement('br'), inj.childNodes[1]);
			playersScale = (1 / (740 / widthTextInput.value));
			left = (-(740 - widthTextInput.value) / 2);
		}
		var css =
			' div#typetext.full span span#typefocus { ' +
			' color: ' + TFColorInput.value + ' !important; } ' +

			' div#typetext.full span span#typefocus.highlight { ' +
			' color: ' + TFColorInput.value + ' !important; } ' +

			' div#typetext.full span span#typefocus.highlight_error { ' +
			' color: red !important; } ' +

			' #typeblock, #main-block { ' +
			' width: ' + widthTextInput.value + 'px; } ' +

			' #inputtextblock { ' +
			' display: flex; } ' +

			' #inputtext { ' +
			' margin-left: auto; ' +
			' margin-right: auto; ' +
			' width: ' + widthInputInput.value + 'px; } ' +

			' #status-block, #sortable { ' +
			' width: ' + widthTextInput.value + 'px; } ' +

			' #players-block { ' +
			' left: ' + left + 'px; ' +
			' transform: scaleX(' + playersScale + '); } ' +

			' .WH-colorInput { ' +
			' border: none; ' +
			' padding: 0 0; ' +
			' margin: 0 5px; ' +
			' width: 15px; ' +
			' top: 4px !important; ' +
			' height: 15px; } ' +

			' #WH-transparency { ' +
			' padding: 0 0; ' +
			' top: 8px !important; ' +
			' width: 73px; } ' +

			' #param_highlight { ' +
			' position: absolute; ' +
			' margin: 0 5px; ' +
			' height: 20px; } ' +

			' #WH-eHLLabel { ' +
			' display: ; } ' +

			' .WH-label { ' +
			' display: inline; } ' +

			' #WH-settingsContainer { ' +
			' display: inline; } ' +

			' #typetext { ' +
			' word-break: keep-all; ' +
            ' display: -webkit-box; } ' +

			' #beforefocus { ' +
			' opacity: ' + transparencyBFRange.value / 100 + '; } ' +

			' #WH-transparencyBFRange { ' +
			' width: 73px; ' +
			' padding: 0 0; } ' +

			' #WH-transparencyBFContainer { ' +
			' display: inline-flex; } ' +

			' #WH-transparencyBFContainer > div:nth-child(1) { ' +
			' min-width: 200px; } ' +

			' #WH-TFColorContainer { ' +
			' display: inline-flex; } ' +

			' .WH-widthInput { ' +
			' border: solid 1px #d5d5d5; ' +
			' text-align: center; ' +
			' max-width: 40px; } ';


		var style = document.createElement('style');
		style.setAttribute('id', 'WH-settings');
		if (style.styleSheet) {
			style.stylesheet.cssText = css;
		} else {
			style.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(style);
	}

	function decimalToHex(d) {
		var hex = d.toString(16);
		while (hex.length < 2) {
			hex = "0" + hex;
		}
		return hex;
	}

	function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();
