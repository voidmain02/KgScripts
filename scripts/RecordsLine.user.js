// ==UserScript==
// @name           RecordsLine
// @version        1.0.0
// @namespace      klavogonki
// @author         Fenex
// @description    Создаёт линейки рекордов
// @include        http://klavogonki.ru/u/*
// @icon           http://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// @grant          none
// @run-at         document-start
// @license        MIT
// ==/UserScript==

var ANGULAR_USERJS_ID = 'RecordsLine';
var USERJS_INSTANCE_ID = Math.random().toString(36).substring(2);

function main(ANGULAR_USERJS_ID, USERJS_INSTANCE_ID) {
    var injector = angular.element('body').injector();

    injector.invoke(function($rootScope, Me, $timeout, $routeParams, $modal2) {
        if(!$rootScope.userjs)
            $rootScope.userjs = {};
        
        if($rootScope.userjs[ANGULAR_USERJS_ID])
            return false;
        
        $rootScope.userjs[ANGULAR_USERJS_ID] = USERJS_INSTANCE_ID;
        
        var $scope = $rootScope.$new();
        $scope.$on('routeSegmentChange', onRouteSegmentChanged);
        $scope.$on('$destroy', function() {
            $scope.$off('routeSegmentChange', onreadystatechange);
            delete $rootScope.userjs[ANGULAR_USERJS_ID];
        });
        
        function onRouteSegmentChanged(e) {
            if($routeParams.user == Me.id.toString()) {
                $timeout(function() { //pass one digest cycle
                    if(!angular.element('.table-controls .kts-liner-btn').length) {
                        var element = angular.element('<a class="kts-liner-btn table-control">Линейка</a>')
                            .appendTo('.table-controls')
                            .on('click', uploadCSV);
                    }
                }, 1);
            }
        }
        
        function controller($scope, Me, $modalInstance, $routeParams, $http) {
            $scope.Me = Me;
            $scope.data = null;
            
            $scope.onCancel = function() {
                $modalInstance.dismiss();
            };
            
            $scope.onRefreshRecordsLine = function() {
                var url = 'http://klavogonki.ru/profile/' +
                    $routeParams.user + '/' +
                    $routeParams.gametype + '.csv' ;

                var params = {
                    userId: $routeParams.user,
                    gametype: $routeParams.gametype,
                    fromDate: $routeParams.fromDate,
                    toDate: $routeParams.toDate,
                    grouping: $routeParams.grouping
                };
                
                return $http.get(url)
                .then(function(res) {
                    return $http.post('http://net.lib54.ru/KTS/userStats.php', {
                        inf: params,
                        records: res.data
                    },
                    {
                        headers : {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        }
                    });
                }).then(function(res) {
                    $scope.data = res.data;
                });
            };
        }
        
        function uploadCSV() {            
            $modal2.open({
                template: templateModal,
                controller: controller
            });
        }
        
        var templateModal = '\
            <div class="modal2-header">\
                <button class="close" ng:click="onCancel()">&times</button>\
                <h4 class="modal-title">Линейка рекордов</h4>\
            </div>\
            <div class="modal-body" ng:if="!Me.pro">\
                Для того, чтобы создать линейку рекордов необходим премиум-аккаунт.\
            </div>\
            <div class="modal-body" ng:if="Me.pro">\
                <div>Вы можете создать или обновить линейку рекордов по данному режиму, нажав на кнопку "Обновить".</div>\
                <div style="padding-top: 6px;" ng:if="data.url">Линейка рекордов будет доступна по этой ссылке: <a ng:href="{{data.url}}" target="_blank" ng:bind="data.url"></a></div>\
            </div>\
            <div class="modal-footer">\
                <button class="btn btn-link" ng:if="Me.pro" app:click-animated="onRefreshRecordsLine()">Обновить</button>\
                <button class="btn btn-primary" ng:click="onCancel()">Закрыть</button>\
            </div>\
        ';
    });
}

document.addEventListener('load', function() {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + main + ')("'+ ANGULAR_USERJS_ID + '", "' + USERJS_INSTANCE_ID + '");';
    document.body.appendChild(script);
    document.body.removeChild(script);
});
