// ==UserScript==
// @name           KG_YandexTranslator
// @namespace      klavogonki
// @include        http://klavogonki.ru/g/*
// @include        http://klavogonki.ru/vocs/*
// @author         agile
// @description    Выводит перевод иностранных текстов в заездах при помощи сервиса «Яндекс.Перевод»
// @version        0.2.1
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var mainBlock = document.getElementById( 'main-block' ),
        vocBlock = document.querySelector( '.vocview-block tr' ),
        vocLink = document.querySelector( '#gamedesc .gametype-voc > a' ),
        scores = document.getElementById( 'userpanel-scores-container' ),
        vocRE = /klavogonki.ru\/vocs\/(\d+)/,
        gamePageRE = /klavogonki.ru\/g\//,
        prefix = 'KG_YandexTranslator';

    function KG_YandexTranslator( text, jsonpCallback ){
        this.text = text;
        this.jsonpCallback = jsonpCallback;
        this.apiURL = 'https://translate.yandex.net/api/v1.5/tr.json/';
        this.apiKey = 'trnsl.1.1.20150403T084848Z.4e5190c8dafcd485.02e5d0d8055b490d68398cb06508d30e906898b0';
        this.yandexText = 'Переведено сервисом «<a href="http://translate.yandex.ru/">Яндекс.Перевод</a>»';
        this.container = null;
        this.translatedFrom = {
            sq: 'албанского',
            en: 'английского',
            ar: 'арабского',
            hy: 'армянского',
            az: 'азербайджанского',
            be: 'белорусского',
            bg: 'болгарского',
            bs: 'боснийского',
            vi: 'вьетнамского',
            hu: 'венгерского',
            nl: 'голландского',
            el: 'греческого',
            ka: 'грузинского',
            da: 'датского',
            he: 'иврита',
            id: 'индонезийского',
            it: 'итальянского',
            is: 'исландского',
            es: 'испанского',
            ca: 'каталанского',
            zh: 'китайского',
            ko: 'корейского',
            lv: 'латышского',
            lt: 'литовского',
            ms: 'малайского',
            mt: 'мальтийского',
            mk: 'македонского',
            de: 'немецкого',
            no: 'норвежского',
            pl: 'польского',
            pt: 'португальского',
            ro: 'румынского',
            ru: 'русского',
            sr: 'сербского',
            sk: 'словацкого',
            sl: 'словенского',
            th: 'тайского',
            tr: 'турецкого',
            uk: 'украинского',
            fi: 'финского',
            fr: 'французского',
            hr: 'хорватского',
            cs: 'чешского',
            sv: 'шведского',
            et: 'эстонского',
            ja: 'японского'
        };
    }

    KG_YandexTranslator.prototype.addContainer = function(){
        this.container = document.createElement( 'div' );
        this.container.setAttribute( 'id', 'text-translation' );
        this.container.innerHTML = 'Переводим текст заезда...';
        mainBlock.parentNode.insertBefore( this.container, mainBlock.nextSibling );
    };

    KG_YandexTranslator.prototype.removeContainer = function(){
        if( this.container )
            this.container.parentNode.removeChild( this.container );
    };

    KG_YandexTranslator.prototype.showTranslation = function( result ){
        if( result.code != 200 ){
            this.container.innerHTML = '<p>Произошла ошибка при переводе текста заезда.</p>';
            console.error( result );
            return;
        }
        var text = result.text.join( ';' );
        var fromLang = result.lang.split( '-' )[ 0 ],
            fromText = '<b>' + this.translatedFrom[ fromLang ] + '</b> ';
        fromText += fromLang != 'he' ? 'языка' : '';
        this.container.innerHTML = '<p>Машинный перевод текста заезда с ' + fromText + ':</p>' +
            '<p>' + text + '</p>' +
            '<p class="yandex">' + this.yandexText + '</p>';
    };

    KG_YandexTranslator.prototype.jsonp = function( url, callback ){
        var inject = document.createElement( 'script' );
        inject.setAttribute( 'type', 'application/javascript' );
        inject.setAttribute( 'src', url + '&callback=' + callback );
        document.body.appendChild( inject );
    };

    KG_YandexTranslator.prototype.textURLParams = function(){
        return '&text=' + this.text.split( ';' ).join( '&text=' );
    };

    KG_YandexTranslator.prototype.detectForeign = function( callbackOrResult ){
        if( typeof callbackOrResult == 'string' ){
            var url = this.apiURL + 'detect?key=' + this.apiKey + this.textURLParams();
            this.jsonp( url, callbackOrResult );
        }else{
            var result = callbackOrResult;
            if( result.code != 200 ){
                console.error( result );
                return;
            }
            if( result.lang != 'ru' && result.lang != '' )
                this.translate( result.lang )
        }
    };

    KG_YandexTranslator.prototype.translate = function( fromLang ){
        var url = this.apiURL + 'translate?key=' + this.apiKey + '&lang=' + fromLang + '-ru' + this.textURLParams();
        this.jsonp( url, this.jsonpCallback );
        this.addContainer();
    };


    try{
        var foreignVocs = JSON.parse( localStorage[ prefix + '_vocs' ] );
    }catch( error ){
        var foreignVocs = {};
        console.error( error );
    }

    var vocPage = window.location.href.match( vocRE );

    if( vocPage ){
        var vocId = vocPage.pop(),
            td = document.createElement( 'td' ),
            checkbox = document.createElement( 'input' ),
            label = document.createElement( 'label' );
        td.className = 'links';
        checkbox.id = 'translation-checkbox';
        checkbox.type = 'checkbox';
        checkbox.checked = foreignVocs[ vocId ] ? true : false;
        label.setAttribute( 'for', 'translation-checkbox' );
        label.appendChild( checkbox );
        label.appendChild( document.createTextNode( ' Перевод текстов словаря' ) );
        vocBlock.appendChild( td.appendChild( label ) );
        checkbox.onchange = function(){
            if( this.checked )
                foreignVocs[ vocId ] = true;
            else
                delete foreignVocs[ vocId ];
            localStorage[ prefix + '_vocs' ] = JSON.stringify( foreignVocs );
        }
        return;
    }

    if (window.location.href.match(gamePageRE)) {
        var forceTranslate = false;
        if (vocLink) {
            forceTranslate = foreignVocs[vocRE.exec(vocLink.href).pop()] ? true : false;
        }

        // Saving the original prototype method:
        var proxied = window.XMLHttpRequest.prototype.send;
        var initialized = false;

        window.XMLHttpRequest.prototype.send = function () {
            this.addEventListener('load', function () {
                try {
                    var json = JSON.parse(this.responseText);
                    if ('text' in json && !initialized) {
                        initialized = true;
                        init(json.text.text);
                    }
                } catch (e) {}
            });
            return proxied.apply(this, [].slice.call(arguments));
        };

        function init (text) {
            if ((text.match( /[A-Za-z]+/g ) || []).join('').length < 20 && !forceTranslate) {
                return false;
            }
            var observer = new MutationObserver(function(mutations){
                observer.disconnect();
                window.KG_YandexTranslator = new KG_YandexTranslator(text,
                    'KG_YandexTranslator.showTranslation');
                window.KG_YandexTranslator.detectForeign('KG_YandexTranslator.detectForeign');
            });
            observer.observe(scores, { childList: true, subtree: true, characterData: true });
        }
    }
}

window.addEventListener( 'load', function(){
    var inject = document.createElement( 'script' );
    inject.setAttribute( 'type', 'application/javascript' );
    inject.appendChild( document.createTextNode( '(' + main.toString() + ')()' ) );
    document.body.appendChild( inject );
    var style = document.createElement( 'style' );
    style.setAttribute( 'type', 'text/css' );
    style.appendChild(
        document.createTextNode(
            '#text-translation{' +
                'background: #ebebeb; border-radius: 15px; text-align: left;' +
                'padding: 15px; margin: 15px 0; max-width: 740px' +
            '}' +
            '#text-translation :last-child{ margin: 0 }' +
            '#text-translation .yandex{' +
                'text-align: right; font-size: 0.8em;' +
                'color: #888; margin-top: 1.6em' +
            '}' +
            '#text-translation .yandex > a{ color: #888 !important }' +
            'label[for="translation-checkbox"]{ padding-left: 20%; font-weight: 400 }' +
            '#translation-checkbox{ vertical-align: text-bottom }'
        )
    );
    document.head.appendChild( style );
});
