// ==UserScript==
// @name           KG_InfiniteScroll
// @namespace      klavogonki
// @include        http*://klavogonki.ru/u/*
// @author         agile
// @description    В разделах «Бортжурнал», «Друзья» и «Сообщения» автоматически подгружает старые записи при скроллинге колесом мыши
// @version        1.2.0
// @icon           https://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var scroll_down_btn_sel = '.full-btn:not(.ng-hide)', // Button in the logbook
        scroll_up_btn_sel = '.loadmore', // Button in the dialog
        scrollable_win_sel = '.dialog-content', // Scrollable container in the dialog
        win_cache = null, // A scrollable element cache
        pre_dy = 200,     // Minimal distance for autoload in px
        timer,            // A global timer for the $includeContentLoaded event
        busy = false;

    window.addEventListener( 'scroll', function( event ){
        if( busy )  // Check if the DOM is ready
            return;
        var button;
        if( ! event.target.tagName && ( window.pageYOffset >= document.body.clientHeight - window.innerHeight - pre_dy ) ){
            button = document.querySelector( scroll_down_btn_sel );
            if( button ){
                if( button.hasAttribute( 'href' ) ){
                    // We have a link to the logbook, not a button:
                    button.innerHTML = 'Загрузить еще';
                    button.setAttribute( 'disabled', 'disabled' );
                    var old_class = button.className;
                    button.className += ' striped';
                    angular.element( button.parentNode ).scope().Journal.onLoadMore().then(function(){
                        button.className = old_class;
                        button.removeAttribute( 'disabled' );
                    });
                }else
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

    // We need to wait for the ng-include in the logbook — otherwise ngRepeat:dupes error may occur
    var root = angular.element( document.body ).scope();
    root.$on( '$includeContentLoaded', function(){
        window.clearTimeout( timer );
        timer = window.setTimeout(function(){
            busy = false;
        }, 500 );
    });
    root.$on( '$includeContentRequested', function(){
        busy = true;
    });
}

window.addEventListener( 'load', function(){
    var inject = document.createElement( 'script' );
    inject.setAttribute( 'type', 'application/javascript' );
    inject.appendChild( document.createTextNode( '(' + main.toString() + ')()' ) );
    document.body.appendChild( inject );
}, false );
