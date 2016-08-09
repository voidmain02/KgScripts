// ==UserScript==
// @name           KlavoEvents
// @version        3.0
// @namespace      klavogonki
// @author         Fenex
// @description    Лента событий
// @include        http://klavogonki.ru/*
// @icon           http://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// @grant          none
// @run-at         document-start
// @license        MIT
// ==/UserScript==

var ANGULAR_USERJS_ID = 'KlavoEvents';
var USERJS_INSTANCE_ID = Math.random().toString(36).substring(2);

function main(ANGULAR_USERJS_ID, USERJS_INSTANCE_ID) {
    'use strict';
    
    angular.element('#head .menu a.active').addClass('real');
    
    var item = angular.element('<a id="UserJS_KlavoEvents">События</a>')
    .on('click', function(e) {
        var target = angular.element(e.target);
        if(target.hasClass('active')) {
            target.removeClass('active').parent()
                .find('.real').addClass('active');
            angular.element('#content').show();
            angular.element('#content_KE').hide();
        } else {
            target.addClass('active').parent()
                .find('.real').removeClass('active');
            angular.element('#content').hide();
            show();
        }
    })
    .appendTo(angular.element('#head .menu'));
    
    var root = null;
    
    function show() {
        if(root) {
            return root.show();
        }
        
        var table = angular.element('\
            <table class="list" ng:if="topics.length > 0">\
                <tr class="header">\
                    <td style="width: 20px;">№</td>\
                    <td>Дата {{asdf}}</td>\
                    <td style="width: 200px;">Название</td>\
                </tr>\
                <tr ng:init="isHover=false" ng:mouseenter="isHover=true" ng:mouseleave="isHover=false" class="item"\
                    ng:class="{\'past\': isPast(topic.uTime), \'soon\': isSoon(topic.uTime), \'hover\': isHover}"\
                    ng:repeat="topic in topics | orderBy:\'-uTime\' track by $index">\
                        \
                    <td ng:bind="$index + 1"></td>\
                    <td class="tddate" ng:bind="topic.date"></td>\
                    <td class="title">\
                        <a ng:href="{{topic.href}}">\
                            <noindex ng:bind="topic.title"></noindex>\
                        </a>\
                        <a class="go" ng:href="{{topic.last_post}}" title="Перейти"><img alt="Перейти" src="/img/bullet_go.gif"></a>\
                    </td>\
                    <td>\
                        <span class="viewer-btn" ng:click="Show(topic)">Показать</span>\
                    </td>\
                </tr>\
            </table>');
        
        root = angular.element('<div id="content_KE">')
        .append('<h4>Лента событий</h4>')
        .append('<div class="loading" ng:if="topics.length == 0 && !error">Загрузка {{loading}}%</div>')
        .append('<div class="loading" ng:if="topics.length == 0 && error">Не удалось построить ленту событий =(</div>')
        .append(table);
        
        angular.element('#content').before(root);
        
        angular.module('userjs.' + ANGULAR_USERJS_ID, ['ng'])
        .factory('Cache', function() {
            var cache = {};
            
            function has(key) {
                return !!cache[key];
            }
            
            function add(key, value) {
                cache[key] = angular.copy(value);
            }
            
            function get(key) {
                return angular.copy(cache[key]);
            }
            
            return {
                get: get,
                add: add,
                has: has
            }
        })
        .factory('Request', function(Cache, $q, $http, $log) {
            function getTopics() {
                var count = 1;
                var length = 120;
                var pages = 10;
                var topics = [];
                
                var defer = $q.defer();
                
                function getTopics(page) {
                    return $http.get('http://klavogonki.ru/forum/events/page' + page)
                    .then(function(res) {
                        var results = res.data.match(new RegExp(REG_EXP_TOPIC, 'g'));
                        topics = topics.concat(results);
                        
                        defer.notify((topics.length / length * 100).toFixed());
                        if(topics.length > length || count > pages)
                            return topics;
                        
                        return getTopics(++count);
                    });
                }
                
                getTopics(count).then(function(topics) {
                    if(topics.length < 50) return $q.reject();
                    var tmp = _.map(topics, parseTopic);
                    tmp = _.sortBy(_.compact(tmp), 'uTime');
                    defer.resolve(_.first(tmp.reverse(), 50));
                });
                
                return defer.promise;
            }
                        
            function getHead(href) {
                return $q.when(Cache.get(href))
                .then(function(res) {
                    return res ? res : requestHeadTopic(href);
                }).catch(function(err) {
                    $log.log('KE: load head topic fail', err);
                    return $q.reject(err);
                });
            }
            
            var REG_EXP_HEAD = /(<tr class="posth[\s\S]+?)<tr class="posth/;
            var REG_EXP_TOPIC = "<a.+?class=['\"]?topic\-title['\"]?.+?href=['\"]?([^'\" ]+)['\"]?.+?<noindex>\\s*(\\[[^\\]]+\\])(.+?)<\/noindex>[\\s\\S]+?class=['\"]?go['\"]?\\s+href=['\"]?([^\\s'\"]+)";
            
            function requestHeadTopic(href) {
                return $http.get(href)
                .then(function(res) {
                    var tmp = res.data.match(REG_EXP_HEAD);
                    if(!tmp) return $q.reject('not found');
                    tmp = tmp[1]
                        .replace(/<textarea[\s\S]+?<\/textarea>/, '')
                        .replace(/<!--.+?-->/g, '');
                    
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(tmp, "text/html");
                    
                    var head = {user: {}};
                    head.user.id = doc.getElementsByClassName('user')[0].getAttribute('href').replace(/[^\d]/g, '');
                    head.user.login = doc.getElementsByClassName('user')[0].textContent;
                    head.user.avatar = doc.getElementsByClassName('avatar_big')[0].
                        getElementsByTagName('img')[0].src;

                    //expand hideblocks
                    var hiddens = doc.getElementsByClassName('hidetop');
                    var hideconts = doc.getElementsByClassName('hidecont');
                    
                    for(var i=0; i<hiddens.length; i++)
                        hiddens[i].addClassName('expand');
                    
                    for(var i=0; i<hideconts.length; i++)
                        hideconts[i].style.display = 'block';
                    
                    head.text = doc.getElementsByClassName('text')[0].innerHTML;
                    
                    Cache.add(href, head);
                    
                    return head;
                });
            }
            
            function parseTopic(str) {
                if(!_.isString(str)) return null;
                var topic = str.match(new RegExp(REG_EXP_TOPIC));
                if(!topic) return null;
                
                try {
                    var time, date, sDate = [];
                    if(time = topic[2].match(/\d{2}:\d{2}/)) {
                        topic[2] = topic[2].replace(time, '');
                    }
                    
                    var duration = topic[2].indexOf('-');
                    if(duration != -1) {
                        topic[2] = topic[2].substr(0, duration);
                    }
                    
                    if(date = topic[2].match(/\d+/g)) {
                        date = _.first(date, 3);
                        
                        //day
                        if(date[0].length < 2)
                            sDate.push('0');
                        sDate.push(date[0]);
                        
                        sDate.push('.');
                        
                        //month
                        if(date[1].length < 2)
                            sDate.push('0');
                        sDate.push(date[1]);
                        
                        sDate.push('.');
                        
                        //year
                        if(!date[2]) {
                            sDate.push(new Date().getFullYear());
                        } else {
                            if(date[2] < 100)
                                sDate.push('20');
                            sDate.push(date[2]);
                        }
                        
                        //time
                        if(time) {
                            sDate.push(' в ');
                            sDate.push(time);
                        }
                        
                        sDate = sDate.join('');
                        
                        return {
                            date: sDate,
                            uTime: getUnixTime(sDate),
                            title: topic[3].trim(),
                            href: topic[1],
                            last_post: topic[4]
                        };
                        
                    } else {
                        return null;
                    }
                } catch(e) {
                    return null;
                }
                
                return null;
            }
            
            function getUnixTime(str) {
                var rgx = "(\\d+)\\.(\\d+)\\.(\\d+)";
                if(str.indexOf('в')) {
                    rgx += ".*?(\\d{1,2}):(\\d{1,2})";
                }
                
                var m = str.match(new RegExp(rgx));
                return new Date(Date.UTC(m[3], parseInt(m[2])-1, m[1], m[4]-3, m[5]));
            }
            
            return {
                getHead: getHead,
                getTopics: getTopics
            };
        });
        
        var injectorKE = angular.injector(['userjs.' + ANGULAR_USERJS_ID]);
        
        angular.element('body').injector()
        .invoke(function($rootScope, $compile, $modal2, $q, $log) {
            if(!$rootScope.userjs)
                $rootScope.userjs = {};
            
            if($rootScope.userjs[ANGULAR_USERJS_ID])
                return false;
            
            $rootScope.userjs[ANGULAR_USERJS_ID] = USERJS_INSTANCE_ID;
            
            Request = injectorKE.get('Request');
            
            var $scope = $rootScope.$new(true);
            $compile(root)($scope);
            
            $scope.topics = [];
            $scope.loading = 0;
            $scope.error = false;
            
            Request.getTopics().then(function(topics) {
                $scope.topics = topics;
            }, void 0, function onUpdated(status) {
                $scope.loading = status;
                $scope.$apply();
            })
            .catch(function(err) {
                $log.log('KE: load topics list fail', err);
                $scope.error = true;
            }).finally(function() {
                $scope.$apply();
            });
            
            $scope.isPast = function(time) {
                return new Date() > time;
            };
            
            $scope.isSoon = function(time) {
                var delay = (time - new Date());
                return delay > 0 && delay < 1000 * 60 * 60 * 24;
            };
            
            $scope.Show = function(topic) {
                return $modal2.open({
                    template: document.getElementById('templateOpenEvent').textContent,
                    controller: dlgOpenEventCtrl,
                    resolve: {
                        topic: function() {
                            return $q.when(topic);
                        }
                    }
                }).result;
            }
        });
        
        function dlgOpenEventCtrl($scope, $log, $modalInstance, topic, $q, $sce) {
            $scope.topic = topic;
            $scope.loading = true;
            
            Request = injectorKE.get('Request');
            
            Request.getHead(topic.href).then(function(head) {;
                $scope.head = head;
                head.text = $sce.trustAsHtml(head.text);
                $scope.loading = false;
            });
                        
            $scope.onClose = function() {
                $modalInstance.dismiss();
            };
        }
    }
}

window.addEventListener('load', function() {
if(!document.getElementById('UserJS_KlavoEvents')) {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + main + ')("'+ ANGULAR_USERJS_ID + '", "' + USERJS_INSTANCE_ID + '");';
    document.body.appendChild(script);
    document.body.removeChild(script);
    
    var style = document.createElement('style');
    style.textContent = json2css({
        '.list': {
            'border-collapse': 'collapse',
            'width': '100%'
        },
        '.list .item td': {
            'border-bottom': '1px solid #DDDDDD',
            'border-top': '1px solid #DDDDDD',
            'white-space': 'nowrap',
            'padding': '6px 6px'
        },
        '.list .item .tddate': {
            'color': '#888888',
            'width': '1pt'
        },
        '.list .item .tddate:before': {
            'content': "'['"
        },
        '.list .item .tddate:after': {
            'content': "']'"
        },
        '.list .item': {
            'background-color': '#ddeeff'
        },
        '.list .item.past': {
            'background-color': '#efefef'
        },
        '.list .item.soon': {
            'background-color': '#9adc9a'
        },
        '.loading': {
            'font-size': '20px',
            'margin': 'auto',
            'display': 'inline-block',
            'width': '100%',
            'color': 'grey',
            'text-align': 'center',
            'padding': '40px'
        },
        '.list .item.hover .viewer-btn': {
            'display': 'inline-block'
        },
        '.list .item .viewer-btn': {
            'display': 'none',
            'cursor': 'pointer',
            'color': 'gray'
        },
    }, '#content_KE') + json2css({
        '.about-user': {
            'position': 'absolute',
            'top': '11px',
            'left': '12px'
        },
        '.about-user > a': {
            'height': '36px'
        },
        '.about-user > img': {
            'height': '37px',
            'width': '37px'
        },
        '.text img': {
            'max-width': '100%'
        }
    }, '.dlg-klavoevents-open-event');
    document.head.appendChild(style);
    
    var templateOpenEvent = document.createElement('script');
    templateOpenEvent.setAttribute('type', 'text/ng-template');
    templateOpenEvent.id = 'templateOpenEvent';
    templateOpenEvent.textContent = "\
        <div class='dlg-klavoevents-open-event'>\
            <div class='modal-header'>\
                <button class='close' ng:click='onClose()'>&times;</button>\
                <h4 class='modal-title' ng:bind='topic.title'></h4>\
                <div ng:if='!loading' class='about-user'>\
                    <img ng:src='{{head.user.avatar}}' />\
                    <a target='_blank' ng:href='/u/#/{{head.user.id}}/' ng:bind='head.user.login'></a>\
                </div>\
            </div>\
            <div class='modal-body' ng:if='loading'>\
                Loading...\
            </div>\
            <div class='modal-body' ng:if='!loading'>\
                <div class='text' ng:bind-html='head.text'></div>\
            </div>\
            <div class='modal-footer'>\
                <a class='btn btn-link' ng:href='{{topic.href}}'>Перейти</a>\
                <button ng:click='onClose()' class='btn btn-primary'>Закрыть</button>\
            </div>\
        </div>";
    document.body.appendChild(templateOpenEvent);
}
});


function json2css(obj, root) {
    var out = [];
    for(var selector in obj) {
        if(root)
            out.push(root + ' ');
        out.push(selector + '{');
        for(var css in obj[selector]) {
            out.push(css + ':' + obj[selector][css] + ' !important;');
        }
        out.push('}');
    }
    return out.join('');
} 
