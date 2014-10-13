// ==UserScript==
// @name           StatisticsAvgResults
// @version        1.0
// @namespace      klavogonki
// @author         Fenex
// @include        http://klavogonki.ru/u/*
// @icon           http://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// @grant          none
// @run-at         document-end
// @license        MIT
// ==/UserScript==

function main () {
    var injector = angular.element('body').injector();
  
    injector.invoke(function($rootScope, $compile) {
        var $scope = $rootScope.$new();
        
        $scope.$watch(function() {
            return angular.element('.google-visualization-table-table tr').length;
        }, function(a, b) {
            var scope = angular.element('.table-controls').parent().scope();
            if(!scope) { return; }
            
            var speed = 0;
            var errors = 0;
            var results = scope.Plain.dataTables.table.tf;
            for(var i=0; i<results.length; i++) {
                speed += results[i]['c'][4].v;
                errors += results[i]['c'][7].v;
            }
            
            $scope.avg_speed = (speed / results.length).toFixed(2);
            $scope.avg_errors = (errors / results.length).toFixed(2);
            $scope.count = results.length;
            
            if(!angular.element('.table-controls > span').length) {
                var element = angular
                    .element('<span>Заездов: {{count}}. Средняя скорость: {{avg_speed}}. Ошибки: {{avg_errors}}%</span>')
                    .prependTo(angular.element('.table-controls'));            
                
                $compile(element)($scope);
                $rootScope.$apply();
            }
        });
    });
}

var script = document.createElement('script');
script.setAttribute("type", "application/javascript");
script.textContent = '(' + main + ')();';
document.body.appendChild(script);
document.body.removeChild(script);

var style = document.createElement('style');
style.innerHTML = '.table-controls > span{color: black; float: left;} .table-controls > span:hover{color: black;}';
document.head.appendChild(style);
