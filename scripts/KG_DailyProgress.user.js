// ==UserScript==
// @name         Daily task progress bar
// @namespace    klavogonki
// @version      0.1
// @description  Add tiny progress bar to daily task badge
// @author       Spaider aka Denis Dmitriev
// @match        http://klavogonki.ru/*
// @grant        none
// @iconr        http://www.gravatar.com/avatar/f2cefb694c412538c4061eb822ae0528?s=48
// ==/UserScript==

function setupObserver() {
    window.MutationObserver = window.MutationObserver ||
        window.WebKitMutationObserver ||
        window.MozMutationObserver;
    var target = document.querySelector('.daily-task');
    if (!target) {
        console.log('DailyProgress: Панель задания не найдена, не могу продолжить.');
        return false;
    }
    observer = new MutationObserver(function(mutation) {
        for (var i in mutation) {
            if (mutation[i].attributeName == 'original-title') {
                updateProgress();
            }
        }
    });
    // Never disconnect observer since progress will be updated immediately
    // after a race and it would be nice to reflect this right away
    observer.observe(target, {attributes: true});
    return true;
}

/* Returns progress bar element. Creates it if it does not exist */
function getOrCreateProgressBar(gauge) {
    var pb = document.getElementById('daily-task-progress-bar');

    if (pb) return pb;

    pb = document.createElement('div');
    pb.id = 'daily-task-progress-bar';
    pb.style.position = 'absolute';
    pb.style.bottom = 0;
    pb.style.background = 'url(data:image/gif;base64,R0lGODlhAQADAJEAACiMMSRvKx9SJP///yH5BAEAAAMALAAAAAABAAMAAAICRFQAOw==)';
    pb.style.height = '3px';
    pb.style.width = 0; // No progress initially

    pb_bg = document.createElement('div');
    pb_bg.style.position = 'absolute';
    pb_bg.style.bottom = 0;
    pb_bg.style.background = 'url(data:image/gif;base64,R0lGODlhAQADAJEAAK+vr4+Pj3Nzc////yH5BAEAAAMALAAAAAABAAMAAAICVFAAOw==)';
    pb_bg.style.height = '3px';
    pb_bg.style.width = '100%'; // No progress initially

    gauge.appendChild(pb_bg);
    gauge.appendChild(pb);

    return pb;
}

/* Returns element for Daily Task. Throws exception if it is not found */
function getDailyTaskGauge() {
    var elements = document.getElementsByClassName('daily-task');
    if (!elements.length) throw 'Элемент не найден.';
    var progressBadge = elements[0];

    return progressBadge;
}

/*
Returns daily progress figures: races completed and races to go.
If progress is not yet available (cusotm title is empty), returns null
*/
function getProgress(gauge) {
    var customProps = gauge.getAttributeNames();
    if (customProps.indexOf('original-title') < 0) throw 'Атрибут \'orignal-title\' не найден.';
    var title = gauge.getAttribute('original-title');
    if (!title) {
        return null;
    }
    if (title === 'Завершено') {
        return { done: 1, total: 1 };
    }
    var match = /Прогресс:\W(\d{1,2})\/(\d{1,2})/.exec(title);
    if (!match || match.length != 3) throw 'Формат заголовка поменялся, невозможно распарсить.';

    done = parseInt(match[1]);
    total = parseInt(match[2]);
    if (isNaN(done) || isNaN(total)) throw 'Формат заголовка поменялся, количество заездов не найдено.';

    return {
        done: done,
        total: total
    };
}

// Reflects progress on daily task gauge
function updateProgress() {
    try {
        var gauge = getDailyTaskGauge();
        var progress = getProgress(gauge);
        if (progress === null) {
            return; // Progress is not there yet
        }
        if (!progress.done || progress.done === progress.total) {
            return;
        }
        var pb = getOrCreateProgressBar(gauge);
        pb.style.width = 'calc(100% * ' + progress.done + '/ ' + progress.total + ')';
    } catch (e) {
        console.log('DailyProgress: Ошибка при обновлении. ' + e);
    }
}

window.addEventListener("load", function() {
    // Try to update progress first. On FireFox it is avaible on load
    // whereas on Chromium it is updated later on
    updateProgress();
    setupObserver();
}, false);
