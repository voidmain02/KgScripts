// ==UserScript==
// @name           KG_ImageLoader
// @namespace      klavogonki
// @include        http://klavogonki.ru/u/*
// @author         agile
// @description    Отображает изображения вместо текстовых ссылок в записях разделов «Сводка», «Бортжурнал» и «Друзья».
// @version        1.2.0
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var images_sel = '.journal .img-placeholder', // Selector for links to images elements
        posts_sel = '.journal > .ng-scope',       // Selector for the posts parent element
        comments_sel = '.journal .comments',      // Selector for the comments container element
        img_max_height = 500,                     // max-height for images in pixels
        timer_delay = 250, // Delay in ms between two calls of the update() function
        idle_updates = 0,  // Global counter of idle calls of the update() function
        idle_max = 20;     // Max number of idle update() calls

    function load_images(){
        var images = document.querySelectorAll( images_sel );

        if( ! images.length )
            return false;

        for( var i = 0; i < images.length; i++ ){
            var img = document.createElement( 'img' ),
                prev = images[ i ].previousSibling;
            // Finding the correct previous DOM element (not whitespace or comment node):
            while( prev && prev.nodeType != 1 ){
                prev = prev.previousSibling;
            }
            img.src = images[ i ].href;
            img.alt = images[ i ].innerHTML.replace( /"/g, '' );
            img.style.maxHeight = img_max_height + 'px';
            img.title = img.alt;
            // Waiting for the image load
            img.onload = function(){
                // Quickly checking the real size of the image:
                this.style.maxHeight = 'none';
                if( this.height > img_max_height ){
                    this.style.maxHeight = img_max_height + 'px'; // Return limitation back
                    this.style.cursor = 'pointer';
                    var self = this,
                        zoom_text = this.title + ' (увеличить изображение)',
                        unzoom_text = this.title + ' (уменьшить изображение)';
                    this.title = zoom_text;
                    this.addEventListener( 'click', function(){
                        self.title = self.style.maxHeight != 'none' ? unzoom_text : zoom_text;
                        self.style.maxHeight = self.style.maxHeight != 'none' ? 'none' : img_max_height + 'px';
                    }, true );
                }
            }
            images[ i ].parentNode.parentNode.parentNode.style.maxHeight = 'none'; // Disable overflow for .height-limited elements
            // If the previous element is link with no content (Markdown case [![text](%image url%)](%wrap link url%) ),
            // it will be used as wrap link for the image:
            if( prev && prev.tagName == 'A' && ! prev.innerHTML.length ){
                prev.appendChild( img );
                images[ i ].parentNode.removeChild( images[ i ] );
            }else
                images[ i ].parentNode.replaceChild( img, images[ i ] );
        }

        return true;
    }

    function update( from_observer ){
        idle_updates += ! load_images() && ! from_observer ? 1 : 0;
        if( ! from_observer && idle_updates >= idle_max ){
            idle_updates = 0;
            return;
        }

        // Watching for possible changes in the logbook:
        var logbook = document.querySelector( posts_sel );
        if( logbook )
            observer.observe( logbook, { childList: true } );

        // Watching for possible changes in comments:
        var comments = document.querySelectorAll( comments_sel );
        for( var i = 0; i < comments.length; i++ )
            observer.observe( comments[ i ], { childList: true } );

        setTimeout( update, timer_delay );
    }

    var proxied = window.XMLHttpRequest.prototype.send,
        observer = new MutationObserver( function(){ update( true ); } );

    update(); // Force update — ugly fix for the CoolNovo browser

    window.XMLHttpRequest.prototype.send = function(){
        var self = this;

        var check_response = window.setInterval(function(){
            if( self.readyState != 4 )
                return;
            if( self.responseText.length && self.responseText[ 0 ] != '<' )
                try{
                    var json = JSON.parse( self.responseText );
                    if( 'posts' in json || 'updatedExisting' in json )
                        update();
                }catch( e ){}
            window.clearInterval( check_response );
        }, 1 );
        return proxied.apply( this, [].slice.call( arguments ) );
    }
}

var inject = document.createElement( 'script' );
inject.setAttribute( 'type', 'application/javascript' );
inject.appendChild( document.createTextNode( '(' + main.toString() + ')()' ) );
document.body.appendChild( inject );
