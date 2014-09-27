// ==UserScript==
// @name           KG_ChatHotkey
// @namespace      klavogonki
// @include        http://klavogonki.ru/*
// @author         agile
// @description    Добавляет возможность сворачивания чата в заезде по определенной пользователем комбинации клавиш.
// @version        1.0.3
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var default_combination = 'Shift + C',
        minimize_btn_sel = '#chat-content td.mostright',
        script_template =
    '<form class="journal-prefs prefs-block">' +
        '<h4>Пользовательский скрипт <span style="text-transform: none">KG_ChatHotkey</span></h4>' +
        '<label class="drop-pref" style="display: block; font-weight: 400">' +
            'Комбинация клавиш для сворачивания чата в заезде:' +
            '<input type="text" class="form-control" ng-model="KG_ChatHotkey.combination" ng-change="KG_ChatHotkey.save_settings()">' +
        '</label>' +
    '</form>';

    function KG_ChatHotkey( default_combination ){
        this.callback = function(){};
        this.combination = default_combination;
        this.store = window.localStorage;
        this.prefix = 'KG_ChatHotkey';
        this.load_settings();
        // Map for the localization specific characters
        this.keycode_map = {
            186: ';',
            187: '=',
            188: ',',
            189: '-',
            190: '.',
            191: '/',
            192: '`',
            219: '[',
            220: '\\',
            221: ']',
            222: '\''
        };
        // Map for the US keyboards
        this.shift_map = {
             '`' : '~',
             '1' : '!',
             '2' : '@',
             '3' : '#',
             '4' : '$',
             '5' : '%',
             '6' : '^',
             '7' : '&',
             '8' : '*',
             '9' : '(',
             '0' : ')',
             '-' : '_',
             '=' : '+',
             ';' : ':',
            '\'' : '"',
             ',' : '<',
             '.' : '>',
             '/' : '?',
            '\\' : '|'
        };
        this.special_map = {
            'esc' : 27,
            'escape' : 27,
            'tab' : 9,
            'space' : 32,
            'return' : 13,
            'enter' : 13,
            'backspace' : 8,
            'meta' : 91,
            'win' : 91,
            'win_left' : 91,
            'winleft' : 91,
            'win_right' : 92,
            'winright' : 92,
            'context' : 93,
            'context_menu' : 93,
            'menu' : 93,
            'alt_gr' : 93,
            'altgr' : 93,

            'scrolllock' : 145,
            'scroll' : 145,
            'capslock' : 20,
            'caps_lock' : 20,
            'caps' : 20,
            'numlock' : 144,
            'num_lock' : 144,
            'num' : 144,

            'pause' : 19,
            'break' : 19,

            'insert' : 45,
            'home' : 36,
            'delete' : 46,
            'end' : 35,

            'pageup' : 33,
            'page_up' : 33,
            'pu' : 33,

            'pagedown' : 34,
            'page_down' : 34,
            'pd' : 34,

            'left' : 37,
            'up' : 38,
            'right' : 39,
            'down' : 40,

            'f1' : 112,
            'f2' : 113,
            'f3' : 114,
            'f4' : 115,
            'f5' : 116,
            'f6' : 117,
            'f7' : 118,
            'f8' : 119,
            'f9' : 120,
            'f10' : 121,
            'f11' : 122,
            'f12' : 123
        };
    }

    KG_ChatHotkey.prototype.load_settings = function(){
        var stored = this.store.getItem( this.prefix + '_combination' );
        if( stored )
            this.combination = stored;
    };

    KG_ChatHotkey.prototype.save_settings = function(){
        this.store.setItem( this.prefix + '_combination', this.combination );
    };

    KG_ChatHotkey.prototype.handler = function( event ){
        var character = String.fromCharCode( event.keyCode ).toLowerCase(),
            keys = this.combination.replace( /\s/g, '' ).toLowerCase().split( '+' ),
            valid_pressed = 0;

        for( var i = 0; k = keys[ i ], i < keys.length; i++ )
            if( k == 'ctrl' || k == 'control' ){
                if( event.ctrlKey ) valid_pressed++;

            }else if( k == 'shift'){
                if( event.shiftKey ) valid_pressed++;

            }else if( k == 'alt' ){
                if( event.altKey ) valid_pressed++;

            }else if( k.length > 1 ){
                if( this.special_map[ k ] == event.keyCode ) valid_pressed++;

            }else
                if( character == k )
                    valid_pressed++;
                else if( this.keycode_map[ event.keyCode ] && ( this.keycode_map[ event.keyCode ] == k ||
                         event.shiftKey && this.shift_map[ this.keycode_map[ event.keyCode ] ] == k ) )
                    valid_pressed++;
                else if( this.shift_map[ character ] && event.shiftKey && this.shift_map[ character ] == k )
                    valid_pressed++;
        if( valid_pressed === keys.length )
            this.callback( event );
    };

    KG_ChatHotkey.prototype.bind = function( func ){
        this.callback = func;
        window.addEventListener( 'keydown', this.handler.bind( this ), true );
    };

    function game_route(){
        Game.KG_ChatHotkey = new KG_ChatHotkey( default_combination );
        Game.KG_ChatHotkey.bind(function( event ){
            if( event.target.tagName.toLowerCase() == 'input' )
                return;
            event.preventDefault();
            var minimize_btn = document.querySelector( minimize_btn_sel );
            if( minimize_btn )
                minimize_btn.click();
            return false;
        });
    }
    function profile_route(){
        angular.element( document.body ).scope().$on( 'routeSegmentChange', function( event, route ){
            if( route.segment && route.segment.name == 'prefs' ){
                var scope = event.targetScope,
                    template = route.segment.locals.$template,
                    index = template.lastIndexOf( '</div>' );
                route.segment.locals.$template = template.substring( 0, index ) + script_template + template.substring( index );
                scope.KG_ChatHotkey = new KG_ChatHotkey( default_combination );
            }
        });
    }

    if( window.location.href.match( /klavogonki.ru\/u\// ) )
        profile_route();
    else if( window.location.href.match( /klavogonki.ru\/g\// ) )
        game_route();
}

window.addEventListener( 'load', function(){
    if( Storage === void( 0 ) ){
        throw 'LocalStorage isn\'t supported.';
        return;
    }
    var inject = document.createElement( 'script' );
    inject.setAttribute( 'type', 'application/javascript' );
    inject.appendChild( document.createTextNode( '(' + main.toString() + ')()' ) );
    document.body.appendChild( inject );
});
