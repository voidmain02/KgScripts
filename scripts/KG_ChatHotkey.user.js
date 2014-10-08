// ==UserScript==
// @name           KG_ChatHotkey
// @namespace      klavogonki
// @include        http://klavogonki.ru/*
// @author         agile
// @description    Добавляет возможность сворачивания чата в заезде по определенной пользователем комбинации клавиш.
// @version        1.0.6
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var default_combination = [ { key: 'Shift', code: 16 }, { key: 'C', code: 67 } ], // keyCode is used to make the combination independent to layout changes
        minimize_btn_sel = '#chat-content td.mostright',
        script_template =
    '<form class="journal-prefs prefs-block">' +
        '<h4>Пользовательский скрипт <span style="text-transform: none">KG_ChatHotkey</span></h4>' +
        '<label class="drop-pref" style="display: block; font-weight: 400">' +
            'Комбинация клавиш для сворачивания чата в заезде:' +
            '<input type="text" class="form-control" ng-model="chathotkey.combination_text" ng-keyup="chathotkey.save_settings()" ng-keydown="chathotkey.update($event)">' +
        '</label>' +
    '</form>';

    function KG_ChatHotkey( default_combination ){
        this.combination = default_combination;
        this.temp_combination = [];
        this.pressed = [];
        this.combination_text = default_combination.join( ' + ' );
        this.store = window.localStorage;
        this.prefix = 'KG_ChatHotkey';
        this.load_settings();
        this.shift_map = { // Is used only for the visual "correctness" of the hotkey combination
            '~' : '`',
            '!' : '1',
            '@' : '2',
            '#' : '3',
            '$' : '4',
            '%' : '5',
            '^' : '6',
            '&' : '7',
            '*' : '8',
            '(' : '9',
            ')' : '0',
            '_' : '-',
            '+' : '=',
            ':' : ';',
            '"' : '\'',
            '<' : ',',
            '>' : '.',
            '?' : '/',
            '|' : '\\'
        };
    }

    KG_ChatHotkey.prototype.load_settings = function(){
        var stored = this.store.getItem( this.prefix + '_combination' );
        if( stored ){
            try{
                stored = JSON.parse( stored );
                if( typeof stored[ 0 ] != 'object' )
                    stored = this.combination;
            }catch( error ){
                stored = this.combination; // Falling back to the default combination
                console.error( error );
            }
            this.combination = stored;
            this.combination_text = stored.map(function( obj ){ return obj.key }).join( ' + ' );
        }
    };

    /*
     * A keyup event handler for the text field in settings. Saves the new hotkey combination to the LocalStorage.
     */
    KG_ChatHotkey.prototype.save_settings = function(){
        if( ! this.temp_combination.length )
            return;
        this.store.setItem( this.prefix + '_combination', JSON.stringify( this.temp_combination ) );
        this.combination = this.temp_combination;
        this.temp_combination = [];
    };

    /*
     * A keydown event handler for the text field in settings. Constructs the new hotkey combination without saving.
     */
    KG_ChatHotkey.prototype.update = function( event ){
        event.key = this.code2sym( event.originalEvent.key || event.originalEvent.keyIdentifier );
        event.preventDefault();

        // Prevent adding unidentified key or already existing key:
        if( ! event.which || this.temp_combination.some(function( obj ){ return obj.key === event.key }) )
            return false;

        this.temp_combination.push( { key: event.key, code: event.keyCode } );
        var arr = this.temp_combination.slice();

        for( var i = 0; i < arr.length; i++ ){
            if( arr[ i ] in this.shift_map )
                arr[ i ] = this.shift_map[ arr[ i ] ];
        }
        this.combination_text = arr.map(function( obj ){ return obj.key }).join( ' + ' );
        return false;
    };

    /*
     * Returns a symbol by the unicode 'U+NNNN' string, if the last is present.
     */
    KG_ChatHotkey.prototype.code2sym = function( code ){
        if( code.length != 6 || code.indexOf( 'U+' ) < 0 )
            return code;
        return String.fromCharCode( parseInt( code.split( '+' )[ 1 ], 16 ) );
    };

    /*
     * Binds the hotkey combination to some function.
     */
    KG_ChatHotkey.prototype.bind = function( func ){
        var self = this;
        window.addEventListener( 'keydown', function( event ){
            event.key = self.code2sym( event.key || event.keyIdentifier );
            self.pressed.push( { key: event.key, code: event.keyCode } );

            if( self.pressed.map(function( obj ){ return obj.code }).toString() === self.combination.map(function( obj ){ return obj.code }).toString() )
                func( event, self.combination );
        }, true );
        window.addEventListener( 'keyup', function( event ){
            if( event.shiftKey || event.altKey || event.ctrlKey )
                self.pressed.pop();
            else
                self.pressed = [];
        }, true );
    };

    function game_route(){
        Game.chathotkey = new KG_ChatHotkey( default_combination );
        Game.chathotkey.bind(function( event ){
            if( ! event.ctrlKey && ! event.metaKey && ! event.altKey && event.which != 8 ){
                // Our hotkey combination will produce printable character when the text field is focused on — avoid chat minimization in that case:
                var target = event.target.tagName.toLowerCase();
                if( target == 'input' || target == 'textarea' )
                    return;
            }
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
                scope.chathotkey = new KG_ChatHotkey( default_combination );
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
