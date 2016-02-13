// ==UserScript==
// @name          klavostats_links
// @namespace     klavogonki
// @version       2.2.1
// @description   Добавляет прямые ссылки на профиль игрока в КлавоСтатистике
// @include       http://klavogonki.ru/u/*
// @author        Lexin13, Fenex, agile
// ==/UserScript==

function main () {
  var sidebarObserver = window.setInterval(function () {
    var sidebarNode = document.querySelector('.sidebar');
    if (!sidebarNode) {
      return;
    }

    window.clearInterval(sidebarObserver);
    var loginNode = document.querySelector('.profile-header .name');
    if (!loginNode || !loginNode.firstChild) {
      return;
    }

    var login = loginNode.firstChild.textContent.trim();
    var menuStructure = [
      {
        text: 'КлавоСтатистика',
        url: 'http://stat.klavogonki.ru/players.php?extra&n=' + login,
      },
      {
        text: 'История игрока',
        url: 'http://stat.klavogonki.ru/profile/#' + login,
      },
      {
        text: 'Созданные словари',
        url: 'http://klavogonki.ru/vocs/search?section=all&type=all&order=' +
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
    sidebarNode.appendChild(menu);
  }, 500);
}

var inject = document.createElement('script');
inject.setAttribute('type', 'application/javascript');
inject.appendChild(document.createTextNode('(' + main.toString() + ')()'));
document.body.appendChild(inject);
