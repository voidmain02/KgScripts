// ==UserScript==
// @name          klavostats_links
// @namespace     klavogonki
// @version       2.2.3
// @description   Добавляет прямые ссылки на профиль игрока в КлавоСтатистике
// @include       http*://klavogonki.ru/u/*
// @author        Lexin13, Fenex, agile
// ==/UserScript==

function main () {
  function createMenu (sidebarNode, login) {
    var menuStructure = [
      {
        text: 'КлавоСтатистика',
        //url: 'http://stat.klavogonki.ru/players.php?extra&n=' + login,
        url: 'http://kg.bezumn.ru/players.php?extra&n=' + login,
      },
      {
        text: 'История игрока',
        //url: 'http://stat.klavogonki.ru/profile/#' + login,
        url: 'http://kg.bezumn.ru/profile/#' + login,
      },
      {
        text: 'Созданные словари',
        url: location.protocol+'//klavogonki.ru/vocs/search?section=all&type=all&order=' +
          '&changed=&searchtext=%D0%B0%D0%B2%D1%82%D0%BE%D1%80%3A' + login,
      },
    ];

    var menu = document.createElement('ul');
    menu.className = 'profile-nav';
    menuStructure.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.text;
      li.appendChild(a);
      menu.appendChild(li);
    });
    return sidebarNode.appendChild(menu);
  }

  function initMenu () {
    var sidebarNode = document.querySelector('.sidebar');
    if (!sidebarNode) {
      return false;
    }

    var loginNode = document.querySelector('.profile-header .name');
    if (!loginNode || !loginNode.firstChild) {
      return false;
    }

    var login = loginNode.firstChild.textContent.trim();
    return createMenu(sidebarNode, login);
  }

  var observer = window.setInterval(function () {
    if (!initMenu()) {
      return;
    }
    window.clearInterval(observer);
    var injector = angular.element('body').injector();
    injector.invoke(function ($routeParams, $rootScope, $timeout) {
      var id = $routeParams.user;
      $rootScope.$on('routeSegmentChange', function () {
        if (id !== $routeParams.user) {
          id = $routeParams.user;
          // Wait for the digest cycle:
          $timeout(initMenu);
        }
      })
    });
  }, 500);
}

var inject = document.createElement('script');
inject.setAttribute('type', 'application/javascript');
inject.appendChild(document.createTextNode('(' + main.toString() + ')()'));
document.body.appendChild(inject);
