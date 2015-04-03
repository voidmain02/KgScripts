// ==UserScript==
// @name           KG_YandexTranslator
// @namespace      klavogonki
// @include        http://klavogonki.ru/g/*
// @author         agile
// @description    Выводит перевод английских текстов в заездах при помощи сервиса «Яндекс.Перевод»
// @version        0.0.2
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var mainBlock = document.getElementById( 'main-block' ),
        scores = document.getElementById( 'userpanel-scores-container' );

    function KG_YandexTranslator( jsonpCallback ){
        this.jsonpCallback = jsonpCallback;
        this.apiURL = 'https://translate.yandex.net/api/v1.5/tr.json/';
        this.apiKey = 'trnsl.1.1.20150403T084848Z.4e5190c8dafcd485.02e5d0d8055b490d68398cb06508d30e906898b0';
        this.yandexText = 'Переведено сервисом «<a href="http://translate.yandex.ru/">Яндекс.Перевод</a>»';
        this.container = null;
    }

    KG_YandexTranslator.prototype.addContainer = function(){
        this.container = document.createElement( 'div' );
        this.container.setAttribute( 'id', 'text-translation' );
        this.container.innerHTML = 'Переводим текст заезда...';
        mainBlock.parentNode.insertBefore( this.container, mainBlock.nextSibling );
    };

    KG_YandexTranslator.prototype.showTranslation = function( result ){
        if( result.code != 200 ){
            this.container.innerHTML = '<p>Произошла ошибка при переводе текста заезда.</p>';
            console.error( result );
            return;
        }
        this.container.innerHTML = '<p>Машинный перевод текста заезда:</p>' +
            '<p>' + result.text.join( ';' ) + '</p>' +
            '<p class="yandex">' + this.yandexText + '</p>';
    };

    KG_YandexTranslator.prototype.translate = function( text ){
        var inject = document.createElement( 'script' );
        inject.setAttribute( 'type', 'application/javascript' );
        text = text.split( ';' ).join( '&text=' );
        var url = this.apiURL + 'translate?key=' + this.apiKey + '&lang=en-ru&text=' + text + '&callback=' + this.jsonpCallback;
        inject.setAttribute( 'src', url );
        document.body.appendChild( inject );
        this.addContainer();
    };

    if( /[A-Za-z]+/.test( game.text ) ){
        var observer = new MutationObserver(function( mutations ){
            observer.disconnect();
            game.translator = new KG_YandexTranslator( 'game.translator.showTranslation' );
            game.translator.translate( game.text );
        });
        observer.observe( scores, { childList: true, subtree: true, characterData: true });
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
                'padding: 15px 15px 5px; margin: 15px 0; max-width: 740px' +
            '}' +
            '#text-translation .yandex{ text-align: right }' +
            '#text-translation .yandex > a{ color: #000 !important }'
        )
    );
    document.head.appendChild( style );
});
