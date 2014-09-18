// ==UserScript==
// @name           KG_FastDialog
// @namespace      klavogonki
// @include        http://klavogonki.ru/u/*
// @author         agile
// @description    В разделе «Сообщения» добавляет текстовое поле для быстрого открытия диалога по нику пользователя
// @version        1.0.0
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var dialogs_box_sel = '.messages-content',
        dialogs_h3_sel = '.messages-content h3',
        get_id_url = '/.fetchuser?login=';

    function open_dialog( input, form ){
        if( ! input.value.length )
            return;
        form.className.replace( ' has-error', '' );
        function error(){
            form.className += ' has-error';
            input.value = '';
        }
        angular.element( 'body' ).injector().invoke(function( $http ){
            $http.get( get_id_url + input.value ).success(function( data ){
                if( ! data || ! data.id )
                    error();
                else
                    window.location.href = '/u/' + window.location.hash.replace( 'contacts', data.id );
            }).error( error );
        });
    }

    function init(){
        var header = document.querySelector( dialogs_h3_sel );
        if( header.parentNode.querySelector( '.open-dialog' ) )
            return; // We already have our form

        var form = document.createElement( 'form' ),
            input = document.createElement( 'input' );
        form.className = 'open-dialog';
        form.style.marginTop = '20px';
        input.placeholder = 'Введите ник игрока и нажмите Enter для перехода к диалогу';
        input.className = 'form-control';
        form.appendChild( input );
        form.addEventListener( 'submit', function( event ){
            event.preventDefault();
            open_dialog( input, form );
            return false;
        });
        header.parentNode.insertBefore( form, header.nextSibling );
        input.focus();
    }

    angular.element( 'body' ).scope().$on( 'routeSegmentChange', function( e, obj ){
        if( obj.segment && obj.segment.name == 'contacts' )
            angular.element( dialogs_box_sel ).scope().$watch( '$$childTail', function( scope ){
                scope.$watch( 'data.contacts.messages', init );
            })
    });
}

window.addEventListener( 'load', function(){
    var inject = document.createElement( 'script' );
    inject.setAttribute( 'type', 'application/javascript' );
    inject.appendChild( document.createTextNode( '(' + main.toString() + ')()' ) );
    document.body.appendChild( inject );
}, false );
