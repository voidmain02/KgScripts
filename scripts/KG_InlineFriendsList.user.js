// ==UserScript==
// @name           KG_InlineFriendsList
// @namespace      klavogonki
// @include        http://klavogonki.ru/u/*
// @author         agile
// @description    Изменяет вид списка друзей, делая последний более компактным
// @version        1.0.0
// @icon           http://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main(){
    angular.element(document.body).scope().$on('routeSegmentChange', function(event, route) {
        if (!route.segment || route.segment.name != 'list') {
            return;
        }
        var scope = event.targetScope;
        var template = route.segment.locals.$template;
        var pattern = '<app:user-avatar size=\'';
        var i = template.lastIndexOf(pattern);
        if (i > 0) {
            template = template.substring(0, i + pattern.length) + 'small' + 
                       template.substring(i + pattern.length + 3, template.length); // 3 == 'big'.length
        }
        route.segment.locals.$template = template;
    });
}


window.addEventListener( 'load', function() {
    var inject = document.createElement('script');
    inject.setAttribute('type', 'application/javascript');
    inject.appendChild(document.createTextNode('(' + main.toString() + ')()'));
    document.body.appendChild(inject);
    var cssObj = {
        '.profile-friends .friends-content .friends-list .list ul.users > li': {
            'display': 'inline-block',
            'padding': '0', 
            'border-bottom': 'none',
            'line-height': '18px',
            'margin': '10px 1.3em 0 0',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li:hover': {
            'background': 'transparent',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .avatar': {
            'border-radius': 0,
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .avatar img': {
            'width': '16px',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .name': {
            'font-size': '14px',
            'margin-left': 0, 
            'color': '#144e9d !important',
            'text-decoration': 'underline !important',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .name:hover': {
            'color': '#b20 !important',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li div.actions': {
            'position': 'relative',
            'float': 'right',
            'top': '2px',
            'left': '3px',
            'width': 'auto',
        }, 
        '.profile-friends .friends-content .friends-list .list ul.users > li .await': {
            'position': 'static',
            'display': 'inline',
            'vertical-align': 'middle',
            'float': 'none !important',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .btn': {
            'position': 'static',
            'float': 'none !important',
            'margin': '0 2px',
            'padding': '2px 6px',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li div.actions > .dropdown-toggle': {
            'width': '16px',
            'height': '16px',
            'padding': '1px',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li div.actions > .dropdown-toggle > .caret': {
            'border-width': '4px 3.8px 0 3.8px !important',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li div.actions > .dropdown-toggle:hover > .caret': {
            'border-width': '4px 3.8px 0 3.8px !important',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .online': {
            'display': 'none',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .online': {
            'display': 'none',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .online': {
            'display': 'none',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .online:not(.ng-hide) + * > .actions > .dropdown-toggle': {
            'background': '#e8fce8',
            'border-color': '#68b46a',
        }, 
        '.profile-friends .friends-content .friends-list .list ul.users > li .online:not(.ng-hide) + * > .actions > .dropdown-toggle > .caret': {
            'border-top-color': '#68b46a !important',
        },
        '.profile-friends .friends-content .friends-list .list ul.users > li .online:not(.ng-hide) + * > .actions > .dropdown-toggle:hover': {
            'background': '#68b46a',
        }, 
        '.profile-friends .friends-content .friends-list .list ul.users > li .online:not(.ng-hide) + * > .actions > .dropdown-toggle:hover > .caret': {
            'border-top-color': '#fff !important',
        },
    };
    var css = '';
    for (var i in cssObj) {
        css += i + '{';
        for(var j in cssObj[ i ])
            css += j + ':' + cssObj[ i ][ j ] + ';'
        css += '}'
    }
    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.appendChild(document.createTextNode(css));
    document.head.appendChild( style );
});
