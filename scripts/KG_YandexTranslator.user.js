// ==UserScript==
// @name           KG_YandexTranslator
// @namespace      klavogonki
// @include        http://klavogonki.ru/g/*
// @author         agile
// @description    Выводит перевод иностранных текстов в заездах при помощи сервиса «Яндекс.Перевод»
// @version        0.0.9
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var mainBlock = document.getElementById( 'main-block' ),
        scores = document.getElementById( 'userpanel-scores-container' );

    /*
     * Compares similarity of two strings and returns amount of equal letters
     */
    function similarity( a, b ){
        var pos1 = 0,
            pos2 = 0,
            max = 0;

        for( var p = 0; p < a.length; p++)
            for( var q = 0; q < b.length; q++){
                for( l = 0; ( p + l < a.length ) &&
                            ( q + l < b.length ) &&
                            ( a.charAt( p + l ) === b.charAt( q + l ) ); l++ );
                if( l > max ){
                    max = l;
                    pos1 = p;
                    pos2 = q;
                }
            }
        var sum = max;

        if( sum ){
            if( pos1 && pos2 )
                sum += similarity( a.substr( 0, pos1 ), b.substr( 0, pos2 ) );
            if( ( pos1 + max < a.length ) && ( pos2 + max < b.length ) )
                sum += similarity(
                    a.substr( pos1 + max, a.length - pos1 - max ),
                    b.substr( pos2 + max, b.length - pos2 - max )
                );
        }
        return sum;
    };

    /*
     * Removes all whitespaces and frequently used punctuation from the string
     */
    function stripPunct( str ){
        return str.replace( /[\s\-=_!"#%&'*{},.\/:;?\(\)\[\]@\\$\^*+<>~`]/g, '' );
    }

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
        if( similarity( stripPunct( this.text ), stripPunct( text ) ) > 20 ){
            this.removeContainer();
            return;
        }
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

    KG_YandexTranslator.prototype.prepareTextURL = function(){
        return '&text=' + this.text.split( ';' ).join( '&text=' );
    };

    KG_YandexTranslator.prototype.detectForeign = function( callbackOrResult ){
        if( typeof callbackOrResult == 'string' ){
            var url = this.apiURL + 'detect?key=' + this.apiKey + this.prepareTextURL();
            this.jsonp( url, callbackOrResult );
        }else{
            var result = callbackOrResult;
            if( result.code != 200 ){
                console.error( result );
                return;
            }
            if( result.lang != 'ru' )
                this.translate()
        }
    };

    KG_YandexTranslator.prototype.translate = function(){
        var url = this.apiURL + 'translate?key=' + this.apiKey + '&lang=ru' + this.prepareTextURL();
        this.jsonp( url, this.jsonpCallback );
        this.addContainer();
    };

    var observer = new MutationObserver(function( mutations ){
        observer.disconnect();
        game.translator = new KG_YandexTranslator( game.text, 'game.translator.showTranslation' );
        game.translator.detectForeign( 'game.translator.detectForeign' );
    });
    observer.observe( scores, { childList: true, subtree: true, characterData: true });
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
                'padding: 15px 15px 5px; margin: 15px 0; max-width: 740px' +
            '}' +
            '#text-translation .yandex{ text-align: right }' +
            '#text-translation .yandex > a{ color: #000 !important }'
        )
    );
    document.head.appendChild( style );
});
