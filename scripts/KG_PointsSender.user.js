// ==UserScript==
// @name           KG_PointsSender
// @namespace      klavogonki
// @include        http://klavogonki.ru/u/*
// @author         agile
// @description    В разделе «Сообщения» позволяет сделать множественную отправку очков нескольким пользователям
// @version        1.0.9
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var dialogs_box_sel = '.messages-content',
        dialogs_h3_sel = '.messages-content h3',
        points_form_id = '#send_points',
        get_id_url = '/.fetchuser?login=',
        send_points_url = '/api/profile/send-scores',
        requests_delay = 500; // delay between two requests to API (in ms)

    function send_points( button, rows, common_text ){
        var sum = 0;
        for( var i = 0; i < rows.length; i++ ){
            var v = rows[ i ].children[ 1 ].value;
            sum += v.length ? parseInt( v ) : 0;
        }
        if( ! sum )
            return;
        var r = sum % 10,
            endings = [ 'ов', 'о', 'а' ];
        if( r > 1 && r < 5 )
            r = 2;
        if( r >= 5 || ( sum > 10 && sum < 20 ) )
            r = 0;
        if( ! confirm( 'С вашего счета будет снято ' + sum + ' очк' + endings[ r ] + '. Продолжить?' ) )
            return;
        button.addClass( 'striped' );
        button.disabled = true;
        var processed_rows = 0,
            all_successed = true;

        function check_complete( processed ){
            if( processed == rows.length ){
                button.removeClass( 'striped' );
                button.disabled = false;
                if( all_successed )
                    window.location.reload();
            }
        }

        angular.element( 'body' ).injector().invoke(function( $http ){
            for( var i = 0; i < rows.length; i++ ){

                var row = rows[ i ],
                    childs = row.children,
                    username = childs[ 0 ].value,
                    points = childs[ 1 ].value,
                    message = childs[ 2 ].value;

                row.removeClass( 'has-error' );
                var error = row.querySelector( '.help-block' );
                if( error )
                    row.removeChild( error );

                if( ! username.length || ! points.length ){
                    check_complete( ++processed_rows );
                    continue;
                }
                if( ! message.length )
                    message = ' ';
                if( common_text.length )
                    message = common_text + ' ' + message;

                (function( i, username, points, message, row, childs ){
                    window.setTimeout(function(){
                        $http.get( get_id_url + username ).success(function( data ){
                            if( ! data || ! data.id ){
                                row.addClass( 'has-error' );
                                var error_text = document.createElement( 'div' );
                                error_text.addClass( 'help-block' );
                                error_text.innerHTML = 'Невозможно отправить очки — пользователь не найден.';
                                row.appendChild( error_text );
                                all_successed = false;
                                check_complete( ++processed_rows );
                            }else
                                $http.post( send_points_url, {
                                    amount: points,
                                    respondentId: data.id,
                                    message: message
                                }).success(function( data ){
                                    console.info( i, data );
                                    check_complete( ++processed_rows );
                                    row.parentNode.removeChild( row );
                                }).error(function( data ){
                                    console.error( data );
                                    all_successed = false;
                                    check_complete( ++processed_rows );
                                });
                        }).error(function( data ){
                            console.error( data );
                            all_successed = false;
                            check_complete( ++processed_rows );
                        });
                    }, i * requests_delay );
                })( i, username, points, message, row, childs );
            }
        });
    }

    function create_row(){
        var wrapper = document.createElement( 'div' ),
            username = document.createElement( 'input' );
        username.type = 'text';
        username.setAttribute( 'style', 'display: inline-block; width: 20%; margin-right: 5%' );
        username.addClass( 'form-control' );
        var points = username.cloneNode(),
            message = username.cloneNode();
        username.placeholder = 'Введите ник';
        points.placeholder = 'Введите сумму';
        points.oninput = function(){
            var v = this.value;
            this.value = ! isNaN( v ) && parseInt( Number( v ) ) == v && ! isNaN( parseInt( v, 10 ) ) ? v : v.slice( 0, -1 );
        };
        message.placeholder = 'Введите текст сообщения';
        message.style.width = '40%';
        message.style.marginRight = 0;
        wrapper.appendChild( username );
        wrapper.appendChild( points );
        wrapper.appendChild( message );
        wrapper.appendChild( create_button({ text: 'X',
            style: 'width: 5%; margin-left: 5%',
            title: 'Удалить получателя',
            tabindex: -1,
            click: function(){
                this.parentNode.parentNode.removeChild( this.parentNode );
            }
        }) );
        wrapper.addClass( 'form-group' );
        return wrapper;
    }

    function create_form(){
        var form = document.createElement( 'form' ),
            header = document.querySelector( dialogs_h3_sel ),
            common_text = document.createElement( 'input' );

        form.addEventListener( 'submit', function( event ){
            event.preventDefault();
            return false;
        });
        var observer = new MutationObserver(function(){
            var single = form.querySelector( 'div.form-group:only-of-type' ),
                first_remove = form.querySelector( 'button' );
            first_remove.style.display = single ? 'none' : 'inline-block';
            common_text.style.display = single ? 'none' : 'inline-block';
            if( single )
                common_text.value = '';
        });
        observer.observe( form, { childList: true } );

        form.id = points_form_id.slice( 1 );
        form.style.marginBottom = '15px';
        form.appendChild( create_row() );
        form.appendChild( create_button({ text: 'Добавить получателя',
            click: function(){
                form.insertBefore( create_row(), this );
            }
        }) );
        form.appendChild( create_button({ text: 'Отправить очки',
            style: 'margin-left: 15px',
            click: function(){
                send_points( this, form.querySelectorAll( 'div.form-group' ), common_text.value );
            }
        }) );

        common_text.setAttribute( 'style', 'display: inline-block; float: right; width: 50%' );
        common_text.placeholder = 'Общий текст всем (опционально)';
        common_text.addClass( 'form-control' );
        form.appendChild( common_text );
        header.parentNode.insertBefore( form, header.nextSibling );
    }

    function create_button( options ){
        btn = document.createElement( 'button' );
        btn.innerHTML = options.text;
        btn.onclick = options.click;
        btn.addClass( 'btn' );
        if( options.unique_class )
            btn.addClass( options.unique_class );
        for( var i in options )
            if( i != 'text' && i != 'click' && i != 'unique_class' )
                btn.setAttribute( i, options[ i ] );
        return btn;
    }

    function toggle_form(){
        var form = document.querySelector( points_form_id );
        if( ! form )
            create_form();
        else
            form.style.display = window.getComputedStyle( form ).display == 'block' ? 'none' : 'block';
    }

    function init(){
        var header = document.querySelector( dialogs_h3_sel );
        if( header.querySelector( '.points' ) )
            return; // We already have our button
        header.appendChild( create_button({ text: 'Отправка очков', click: toggle_form, unique_class: 'points' }) );
    }

    Element.prototype.addClass = function( className ){
        var classes = this.className.split( ' ' );
        if( classes.indexOf( className ) > -1 )
            return;
        if( classes.length == 1 && classes[ 0 ] === '' )
            classes[ 0 ] = className;
        else
            classes.push( className );
        this.className = classes.join( ' ' );
    }

    Element.prototype.removeClass = function( className ){
        var classes = this.className.split( ' ' ),
            index = classes.indexOf( className );
        if( index > -1 )
            classes.splice( index, 1 );
        this.className = classes.join( ' ' );
    }

    angular.element( 'body' ).scope().$on( 'routeSegmentChange', function( e, obj ){
        if( obj.segment && obj.segment.name == 'contacts' )
            angular.element( dialogs_box_sel ).scope().$watch( '$$childTail', function( scope ){
                scope.$watch( 'data.contacts.messages', init )
            })
    });
}



window.addEventListener( 'load', function(){
    var inject = document.createElement( 'script' );
    inject.setAttribute( 'type', 'application/javascript' );
    inject.appendChild( document.createTextNode( '(' + main.toString() + ')()' ) );
    document.body.appendChild( inject );
}, false );
