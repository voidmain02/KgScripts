// ==UserScript==
// @name           KG_PointsSender
// @namespace      klavogonki
// @include        http*://klavogonki.ru/u/*
// @author         agile
// @description    В разделе «Сообщения» позволяет сделать множественную отправку очков нескольким пользователям
// @version        1.2.0
// @icon           https://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    var dialogs_box_sel = '.messages-content',
        dialogs_h3_sel = '.messages-content h3',
        points_form_id = '#send_points',
        get_id_url = '/.fetchuser?login=',
        send_points_url = '/api/profile/send-scores',
        requests_delay = 1000; // delay between two requests to API (in ms)

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
        function show_error( row, text ){
            row.addClass( 'has-error' );
            var error_text = document.createElement( 'div' );
            error_text.addClass( 'help-block' );
            error_text.innerHTML = text; ;
            row.appendChild( error_text );
            all_successed = false;
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
                                show_error( row, 'Невозможно отправить очки — пользователь не найден.' );
                                check_complete( ++processed_rows );
                            }else
                                $http.post( send_points_url, {
                                    amount: points,
                                    respondentId: data.id,
                                    message: message
                                }).success(function( data ){
                                    if( data && data.err == 'permission blocked' )
                                        show_error( row, 'Невозможно отправить очки — пользователь заблокировал отправку личных сообщений.' );
                                    else
                                        row.parentNode.removeChild( row );
                                    check_complete( ++processed_rows );
                                }).error(function( data ){
                                    show_error( row, 'Неизвестная ошибка при отправке очков пользователю.' );
                                    console.error( data );
                                    check_complete( ++processed_rows );
                                });
                        }).error(function( data ){
                            show_error( row, 'Ошибка при получении id пользователя.' );
                            console.error( data );
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
        wrapper.appendChild( username );
        wrapper.appendChild( points );
        wrapper.appendChild( message );
        wrapper.appendChild( create_button({ text: 'X',
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
        form.appendChild( create_row() );
        form.appendChild( create_button({ text: 'Добавить получателя',
            click: function(){
                form.insertBefore( create_row(), this );
            }
        }) );
        form.appendChild( create_button({ text: 'Отправить очки',
            click: function(){
                send_points( this, form.querySelectorAll( 'div.form-group' ), common_text.value );
            }
        }) );

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
    var style = document.createElement( 'style' );
    style.setAttribute( 'type', 'text/css' );
    style.appendChild(
        document.createTextNode(
            '#send_points{ margin-bottom: 15px; display: block }' +
            '#send_points input.form-control{ color: #000 }' +
            '#send_points input.form-control::-webkit-input-placeholder { color: #bbb }' +
            '#send_points input.form-control::-moz-placeholder { color: #bbb }' +
            '#send_points > div.form-group > input{ display: inline-block; width: 20%; margin-right: 5% }' +
            '#send_points > div.form-group > input:nth-child(3){ width: 40%; margin-right: 0 }' +
            '#send_points > div.form-group > button{ display: inline-block; width: 5%; margin-left: 5% }' +
            '#send_points > button.btn:nth-of-type(2){ margin-left: 15px }' +
            '#send_points > input.form-control{ display: inline-block; float: right; width: 50% }'
        )
    );
    document.head.appendChild( style );
}, false );
