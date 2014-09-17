// ==UserScript==
// @name           KG_InfiniteScroll
// @namespace      klavogonki
// @include        http://klavogonki.ru/u/*
// @author         agile
// @description    В разделах «Бортжурнал», «Друзья» и «Сообщения» автоматически подгружает старые записи при скроллинге колесом мыши
// @version        1.0.3
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var scroll_down_btn_sel = '.full-btn:not(.ng-hide)', // Button in the logbook
        scroll_up_btn_sel = '.loadmore', // Button in the dialog
        scrollable_win_sel = '.dialog-content', // Scrollable container in the dialog
        dlg_segment_name = 'respondent', // AngularJS segment name for the dialog page
        dlg_page = false, // Current page is dialog
        pre_dy = 300,     // Minimal distance for autoload in px
        btn_cache = null, // Button element cache
        win_cache = null; // Scrollable element cache

    function check_load( dir_down ){
        var sel = dir_down ? scroll_down_btn_sel : scroll_up_btn_sel;
        if( ! btn_cache || ! document.contains( btn_cache ) ){
            btn_cache = document.querySelector( sel );
            btn_cache = btn_cache && btn_cache.innerHTML.indexOf( 'Перейти' ) > 0 ? null : btn_cache; // Prevent auto-redirect to the logbook
        }
        if( ! btn_cache )
            return;
        if( dir_down && ! dlg_page && ( window.pageYOffset >= document.body.clientHeight - window.innerHeight - pre_dy ) )
            btn_cache.click();
        else if( ! dir_down && dlg_page ){
            if( ! win_cache || ! document.contains( win_cache ) )
                win_cache = document.querySelector( scrollable_win_sel );
            if( win_cache && win_cache.scrollTop <= pre_dy )
                btn_cache.click();
        }
    }

    window.addEventListener( 'wheel', function( event ){
        check_load( event.deltaY > 0 ? true : false );
    });
    // Fix for the old browsers like CoolNovo:
    window.addEventListener( 'mousewheel', function( event ){
        check_load( event.wheelDelta < 0 ? true : false );
    });
    angular.element( 'body' ).scope().$on( 'routeSegmentChange', function( e, obj ){
        dlg_page = obj.segment && obj.segment.name == dlg_segment_name ? true : false;
    });
}

window.addEventListener( 'load', function(){
    var inject = document.createElement( 'script' );
    inject.setAttribute( 'type', 'application/javascript' );
    inject.appendChild( document.createTextNode( '(' + main.toString() + ')()' ) );
    document.body.appendChild( inject );
}, false );
