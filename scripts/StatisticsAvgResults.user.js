// ==UserScript==
// @name           StatisticsAvgResults
// @version        1.4.0
// @namespace      klavogonki
// @author         Fenex
// @description    В статистике показывает среднее арифметическое по результатам скорости и процента ошибок за отображаемый день
// @include        http://klavogonki.ru/u/*
// @icon           http://www.gravatar.com/avatar.php?gravatar_id=d9c74d6be48e0163e9e45b54da0b561c&r=PG&s=48&default=identicon
// @grant          none
// @run-at         document-end
// @license        MIT
// ==/UserScript==

var ANGULAR_USERJS_ID = 'StatisticsAvgResults';
var USERJS_INSTANCE_ID = Math.random().toString(36).substring(2);

function main(ANGULAR_USERJS_ID, USERJS_INSTANCE_ID) {
    var injector = angular.element('body').injector();

    injector.invoke(function($rootScope, $compile) {
        if(!$rootScope.userjs)
            $rootScope.userjs = {};
        
        if($rootScope.userjs[ANGULAR_USERJS_ID])
            return false;
        
        $rootScope.userjs[ANGULAR_USERJS_ID] = USERJS_INSTANCE_ID;
        
        var $scope = $rootScope.$new();
        $scope.$on('$destroy', function() {
            delete $rootScope.userjs[ANGULAR_USERJS_ID];
        });
        
        $scope.$watch(function() {
            return angular.element('.google-visualization-table-table tr').length;
        }, function(a, b) {
            var scope = angular.element('.table-controls').parent().scope();
            if(!scope || !scope.Plain) { return; }

            var symbols = 0, speed = 0, errors = 0, time = 0,
                table = scope.Plain.dataTables.table,
                results = null;
            
            for(var key in table) {
                if(table[key] && table[key][0] && table[key][0]['c']) {
                    results = table[key];
                    break;
                }
            }
            
            if(!results)
                return;
            
            for(var i=0; i<results.length; i++) {
                //time in minutes
                symbols += (results[i]['c'][5].v / 60) * results[i]['c'][4].v;
                time += results[i]['c'][5].v / 60;
                errors += results[i]['c'][7].v;
				speed += results[i]['c'][4].v;
            }

            $scope.symbols = symbols.toFixed();
            $scope.time = time.toFixed();
            $scope.count = results.length;
            
            $scope.avg_speed = (speed / $scope.count).toFixed(2);
            $scope.avg_errors = (errors / $scope.count).toFixed(2);
            
            if(!angular.element('.table-controls > span').length) {
                var element = angular
                    .element('<span>Заездов: {{count}}. Символов: {{symbols}}. Время: {{time}} мин. Средняя скорость: {{avg_speed}}. Ошибки: {{avg_errors}}%</span>')
                    .prependTo(angular.element('.table-controls'));

                $compile(element)($scope);
                $rootScope.$apply();
            }
        });
    });
}

window.addEventListener('load', function() {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + main + ')("'+ ANGULAR_USERJS_ID + '", "' + USERJS_INSTANCE_ID + '");';
    document.body.appendChild(script);
    document.body.removeChild(script);

    var style = document.createElement('style');
    style.innerHTML = '.table-controls > span{color: black; float: left;} .table-controls > span:hover{color: black;}';
    document.head.appendChild(style);
});
