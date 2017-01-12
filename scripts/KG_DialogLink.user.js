// ==UserScript==
// @name           KG_DialogLink
// @namespace      klavogonki
// @include        http://klavogonki.ru/u/*
// @author         agile
// @description    В разделе «Сообщения» добавляет текстовые ссылки для возможности открытия диалогов в новых вкладках браузера
// @version        1.0.5
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var dialogs_box_sel = '.profile-messages',
        dialogs_sel = '.contact > .content';

    function add_links(){
        var dialogs_box = document.querySelector( dialogs_box_sel );
        if( ! dialogs_box )
            return;
        var dialogs = dialogs_box.querySelectorAll( dialogs_sel ),
            link_base = window.location.hash.replace( 'contacts/', '' );
        for( var i = 0; i < dialogs.length; i++ ){
            var childs = dialogs[ i ].children;
            if( childs[ 1 ].children.length )
                continue; // We already have a link
            var href = link_base + childs[ 0 ].href.match( /#\/([0-9]*)\// )[ 1 ],
                link = document.createElement( 'a' );
            link.href = href;
            link.onclick = function( event ){
                event.stopPropagation();
            };
            link.innerHTML = '#';
            link.setAttribute( 'style', 'margin-left: 6px; color: inherit; text-decoration: none; font-style: italic' );
            link.onmouseover = function(){ this.style.color = '#b20'; this.style.textDecoration = 'underline' };
            link.onmouseout = function(){ this.style.color = 'inherit'; this.style.textDecoration = 'none' };
            link.title = 'Открыть диалог';
            // Appending link to the .content > .date element:
            childs[ 1 ].appendChild( link );
        }
        // Watching for possible changes in the dialog list:
        observer.observe( dialogs_box, { childList: true } );
    }

    var proxied = window.XMLHttpRequest.prototype.send,
        observer = new MutationObserver( add_links );

    add_links(); // Force update — ugly fix for the CoolNovo browser

    window.XMLHttpRequest.prototype.send = function () {
        this.addEventListener('load', function () {
            try{
              if ('messages' in JSON.parse(self.responseText)) {
                    add_links();
                }
            } catch (e) {}
        }.bind(this));
        return proxied.apply(this, [].slice.call(arguments));
    };
}

var inject = document.createElement( 'script' );
inject.setAttribute( 'type', 'application/javascript' );
inject.appendChild( document.createTextNode( '(' + main.toString() + ')()' ) );
document.body.appendChild( inject );
