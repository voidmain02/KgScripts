// ==UserScript==
// @name        KG_BulkMailer
// @namespace   klavogonki
// @description Массовая рассылка сообщений
// @author      voidmain
// @license     MIT
// @version     0.9.1
// @include     http*://klavogonki.ru/u/*
// @grant       none
// @run-at      document-end 
// ==/UserScript==


function main() {


var bulkMailerButtonTemplate = '<button class="btn" style="float: right;" ng:click="KG_BulkMailer.showModal()">Массовая рассылка</button>';

var icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAjVBMVEUAAADR8PyA0vbf9f0ise4Dp+yL1vZxzvXa8/2N1/Ylr+47ufCH1vdPv/Gy5Pme3vhaw/JDvPGI1va76Pp3zvUGpuwus++P1/cIqO1QwPFAu/HM7/xIvvGc3fgMpesOpuwNqO0utO8Op+x80vUPq+0AneoAqOwAneoAoOoAqewBpuwBo+sAnOoAl+kDpOu33Hr0AAAAJnRSTlMAInUX4uIOBgEV2bNNrU0rnoxZQoDp0GvffKkJgkD++e672WT98skddn0AAAIuSURBVEjH7ZXLcuJADEVl52EGHCeB8IaEx0xLcqv9/583Mi6jSrrAZpcFp9h4cRanrGvgzp1fzSC7nYH+QFlDGoL3dAPeh5DCWvVhDpPP4FzZG+dCNYF8lgFgOMLDLDh2PWEXZg9wDH8BYEH4DvAWPPd0fXgDeEcZDgCefBn2a5gjcS+XcA7ZPpT0eJKdk90rTL6Ee7jyNYHXnTh3lplobOFduWMiNrkOsfDuXM/OZIVLGekbF+JruZJCNpKS3XdZkamGV8KXcyvNnYpTIpkJNXzYhse5Q82t30ksR+FR7kubG8tNeBgBpEgc52IKMAqaG8kGanhh4ZZbwOsTOuWKzOTHkPwI19wExp74omzhG4CXYHFc1blLy41lsyvR8A8hPr/dD82Vit1V2cK3UBByk0sFbP9ZbofMFFKow9tcKFC4U7bh5EsNV7vO3aR2O9dldlIPB2Wl4SFo7krEbueabMNxeEhgPofkgK65Hbn8quLhUJkD5CU5RRbR7dTyoJYt97MeDjYPXtJUPLejsduJZBuOJ26fiRy3OXS6nYojOf5OGHZndjuRfMqFvQ0nAp8SKDxyLDNWRZN7ESbKNVx+yuxELyn31PEBxGUTbnI7nE2UG4fLqgk3uR2O5naChwcoSLiVT8NJFuh6gZWGP4ZGXvjwqLkVcT+ZSU7hqDJM69ylRLld4fVfbFZfxgqrPq4NT8PnuwzWW9hKwBsJeIQkA+X5zJ8uno0B3Lnzm/kPM2QXuyGnBIQAAAAASUVORK5CYII=';

var bulkMailerModalTemplate = '<style>\n\
.dlg-send-user-message .message-respondents { position: relative; }\n\
.dlg-send-user-message .message-respondents .icon-icomoon.icon-users { position: absolute;\n\
top: 10px; right: 4px; width: 14px; height: 14px; font-size: 12px; color: #aaa; cursor: pointer; }\n\
.dlg-send-user-message .message-respondents .icon-icomoon.icon-users:hover { color: #444; }\n\
</style>\n\
<form app:submit="onSend()" class="dlg-send-user-message" name="messageForm">\n\
<div class="modal2-header">\n\
<button class="close" ng:click="onCancel()">&times;</button>\n\
<div class="avatar"><img src="' + icon + '" /></div>\n\
<div class="name">Массовая почтовая рассылка</div>\n\
</div>\n\
<div class="modal2-body">\n\
<div class="form-group message-respondents">\n\
<input type="text" class="form-control" ng:model="KG_BulkMailer.respondentsString" placeholder="Введите идентификаторы получателей">\n\
<div app:jq="tipsy" class="icon-icomoon icon-users" ng:click="appendFriends()" original-title="Добавить друзей"></div>\n\
</div>\n\
<div class="message-text">\n\
<app:edit-preview marked-type="full" set-autofocus="true" write-model="KG_BulkMailer.messageText"></app:edit-preview>\n\
</div>\n\
</div>\n\
<div class="modal2-footer">\n\
<div class="markdown-note">Разрешается использовать <a href="https://klavogonki.ru/wiki/Markdown" target="_blank">разметку Markdown</a></div>\n\
<button class="btn btn-link" ng:click="onCancel()">Отмена</button>\n\
<button app:submit-animated class="btn btn-primary" type="submit" ng:disabled="dirty">Отправить</button>\n\
</div>\n\
</form>';

var angularRootElement = angular.element('body'),
    rootScope = angularRootElement.scope(),
    injector = angularRootElement.injector();

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
};

var showBulkMailerModal = function() {
    injector.invoke(function($modal2, $q, Dialogs, ProfileMessagesContactsLoader, Api, Profile) {
        $modal2.open({
            template: bulkMailerModalTemplate,
            controller: function($scope, $modalInstance) {
                var respondent_ids = [];
                var message = '';
                
                $scope.KG_BulkMailer.respondentsString = '';
                $scope.KG_BulkMailer.messageText = {
                    text: ''
                };
                
                $scope.$watchCollection(function() {
                    return [
                        $scope.KG_BulkMailer.respondentsString,
                        $scope.KG_BulkMailer.messageText.text
                    ]
                }, function(a, b) {
                    var respondents = a[0];
                    message = a[1];
                    
                    respondent_ids = respondents.match(/\d+/ig);
                    if(respondent_ids)
                        respondent_ids = respondent_ids.getUnique();
                    
                    if(!message || !respondent_ids || !respondent_ids.length)
                        return $scope.dirty = true;
                    return $scope.dirty = false;
                });
                
                $scope.onCancel = function() {
                    $modalInstance.dismiss();
                };
                
                $scope.onSend = function() {
                    var sendMessagePromises = respondent_ids.map(function(respondent) {
                        return $q.when(!/{user\.(name|rank)}/i.test(message) ? message : Profile.getSummary(respondent).then(function(summary) {
                            return message.replace(/{user\.name}/gi, summary.user.login).replace(/{user\.rank}/gi, summary.title);
                        })).then(function(message) {
                            return Api.post("profile/send-message", {
                                respondentId: respondent,
                                text: message
                            });
                        }).catch(function() {
                            return null;
                        });
                    });
                    
                    $q.all(sendMessagePromises).then(function(results) {
                        return ProfileMessagesContactsLoader.load().then(function() {
                            return results;
                        });
                    }).then(function(results) {
                        $modalInstance.close();
                        
                        var errorRespondents = [];
                        for(var i = 0; i < results.length; i++) {
                            if(!results[i]) {
                                errorRespondents.push(respondents[i]);
                            }
                        }
                        
                        if(errorRespondents.length > 0) {
                            Dialogs.alert('Ой!', 'Не удалось отправить сообщение следующим пользователям: ' + errorRespondents.join(', '));
                        }
                    }, function(error) {
                        Dialogs.alert('Ой!', 'Не удалось обновить список сообщений: "' + error + '"');
                    });
                };
                
                $scope.appendFriends = function() {
                    Profile.getFriends(rootScope.Me.id).then(function(result) {
                        for(var i = 0; i < result.users.length; i++) {
                            if(i > 0 || !/^\s*$/.test($scope.KG_BulkMailer.respondentsString)) {
                                $scope.KG_BulkMailer.respondentsString += ', ';
                            }
                            $scope.KG_BulkMailer.respondentsString += result.users[i].id;
                        }
                    });
                };
            }
        });
    });
};

rootScope.$on('routeSegmentChange', function(e, obj) {        
    if(!obj.segment || obj.segment.name != 'contacts' || obj.segment.locals.data.summary.user.id != rootScope.Me.id) {
        return;
    }
    var scope = e.targetScope,
        template = obj.segment.locals.$template;
    var index = template.indexOf('</h3>');
    template = template.substring(0, index) + bulkMailerButtonTemplate + template.substring(index, template.length);
    obj.segment.locals.$template = template;
    
    scope.KG_BulkMailer = {
        respondentsString: '',
        messageText: {
            text: ''
        },
        showModal: showBulkMailerModal
    };
});


}

function exec(fn) {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + fn + ')();';
    document.body.appendChild(script);
    document.body.removeChild(script);
}

window.addEventListener("load", function() {
    exec(main);
}, false);
