// ==UserScript==
// @name           KG_GlasslessBio
// @namespace      klavogonki
// @include        http*://klavogonki.ru/u/*
// @author         agile
// @description    В разделе «Сводка» изменяет вид блока «Био»
// @version        1.1.0
// @icon           https://www.gravatar.com/avatar/8e1ba53166d4e473f747b56152fa9f1d?s=48
// ==/UserScript==

function main () {
  var profile_root_sel = '.profile-root';
  var bio_sel = '.bio';
  var bio_header_sel = '.bio > h3';
  var bio_content_sel = '.bio .content';
  var bio_spoilers_sel = '.bio .hidetop.expanded';
  var bio_text_path = 'data.index.bio.text';

  function init (scope) {
    var head = angular.element(bio_header_sel);
    if (head.length) {
      head.remove();
    } else {
      return;
    }

    var bio = angular.element(bio_sel);
    var content = angular.element(bio_content_sel);
    var readmore = angular.element(document.createElement('a')).text('Показать полностью');
    var openfull = angular.element(document.createElement('a')).text('Открыть в модальном окне');
    var scroll_pos = 0;

    readmore.click(function () {
      if (bio.toggleClass('opened').hasClass('opened')) {
        scroll_pos = window.pageYOffset || document.documentElement.scrollTop;
        readmore.text('Скрыть');
      } else {
        readmore.text('Показать полностью');
        window.scrollTo(0, scroll_pos);
        angular.element(bio_spoilers_sel).click();
      }
    });
    openfull.click(scope.IndexPage.onOpenBio);
    bio.append(readmore, openfull);
    if (scope.Me && scope.Me.id == scope.$routeSegment.$routeParams.user) {
      openfull.after(angular.element(document.createElement('a')).attr('href', window.location.hash + 'editbio').text('Редактировать'));
    }

    scope.$watch('$$childTail', function($scope) {
      $scope.$watch('$$childTail', function () {
        // Dirty fix for deprecated spoilers:
        if (typeof initBBWidgets === 'function') {
          initBBWidgets();
        }
      });
    });
  }


  function wait_for_bio () {
    var profile = angular.element(profile_root_sel);
    if (profile.length) {
      var root_listener = profile.scope().$watch('$$childTail', function (scope) {
        scope.$watch(bio_text_path, function () {
          var listener = angular.element(bio_sel).scope().$watch('$$childTail', init);
          root_listener(); // clear profile root $watch
        });
      });
    }
  }

  angular.element('body').scope().$on('routeSegmentChange', function (e, obj) {
    if (obj.segment && obj.segment.name == 'index') {
      wait_for_bio();
    }
  });
  if (window.location.hash.match(/#\/\d+\/$/)) {
    wait_for_bio(); // We are already at the index page
  }
}

window.addEventListener('load', function () {
  var inject = document.createElement('script');
  inject.setAttribute('type', 'application/javascript');
  inject.appendChild(document.createTextNode('(' + main.toString() + ')()'));
  document.body.appendChild(inject);
  var style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.appendChild(
    document.createTextNode(
      '#profile-index .bio .content{ box-shadow: none; max-height: 25em; padding: 0; margin-top: 5px }' +
        '#profile-index .bio:not(.opened) .content:after{' +
        'position: absolute; left: 0; top: calc(25em - 1.5em); right: 0; bottom: 0;' + 
        'pointer-events: none;' +
        'background: linear-gradient(rgba(255,255,255,0) 0%, rgba(0,0,0,0.05) 100%);' +
        'border-bottom: 2px solid rgba(0,0,0,0.1);' +
        'content: ""' +
        '}' +
        '#profile-index .bio.opened .content{ max-height: none }' +
        '#profile-index .bio .content .clickable{ display: none }' +
        '#profile-index .bio > a{ display: inline-block; margin: 0.5em 1em 0 0 }' +
        '#profile-index .bio > a:not(:hover){ text-decoration: none }'
    )
  );
  document.head.appendChild(style);
}, false);
