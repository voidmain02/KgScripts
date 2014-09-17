// ==UserScript==
// @name           KG_InfiniteScroll
// @namespace      klavogonki
// @include        http://klavogonki.ru/u/*
// @author         agile
// @description    В разделах «Бортжурнал», «Друзья» и «Сообщения» автоматически подгружает старые записи при скроллинге колесом мыши
// @version        1.0.7
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var scroll_down_btn_sel = '.full-btn:not(.ng-hide)', // Button in the logbook
        scroll_up_btn_sel = '.loadmore', // Button in the dialog
        scrollable_win_sel = '.dialog-content', // Scrollable container in the dialog
        dlg_segment_name = 'respondent', // AngularJS segment name for the dialog page
        win_cache = null, // A scrollable element cache
        old_hash = null,  // The window.location.hash old value
        pre_dy = 200,     // Minimal distance for autoload in px
        busy = false;

    window.addEventListener( 'scroll', function( event ){
        if( window.location.hash != old_hash ){
            old_hash = window.location.hash;
            return; // The content may be isn't fully loaded — skip the first onscroll event
        }
        if( busy )  // FireFox generates too many onscroll events — prevent several simultaneous clicks with this global flag
            return;

        var button;
        if( ! event.target.tagName && ( window.pageYOffset >= document.body.clientHeight - window.innerHeight - pre_dy ) ){
            button = document.querySelector( scroll_down_btn_sel );
            if( button && button.innerHTML.indexOf( 'Перейти' ) < 0 ){
                button.click();
                busy = true;
            }
        }else if( event.target.tagName ){
            if( ! win_cache || ! document.contains( win_cache ) )
                win_cache = document.querySelector( scrollable_win_sel );
            if( win_cache && win_cache.scrollTop <= pre_dy ){
                button = document.querySelector( scroll_up_btn_sel );
                if( button ){
                    button.click();
                    busy = true;
                }
            }
        }
        if( busy )
            window.setTimeout(function(){
                busy = false;
            }, 500 );
    }, true );
}

window.addEventListener( 'load', function(){
    var inject = document.createElement( 'script' );
    inject.setAttribute( 'type', 'application/javascript' );
    inject.appendChild( document.createTextNode( '(' + main.toString() + ')()' ) );
    document.body.appendChild( inject );
}, false );
