## IgnoreList [![Установить](http://s43.radikal.ru/i101/1406/15/25aa0cc99cf2.png)](https://github.com/ambineura/KgScripts/raw/master/scripts/KG_PowerIgnore.user.js)
**Авторы:** [un4given](http://klavogonki.ru/u/#/111001/), немножко [Fenex](http://klavogonki.ru/u/#/82885/)

#### Благодатный Мощный Игнор™ (на форуме, в чате и в заездах), привязанный к штатному игнор-листу на странице настроек профиля.
Имеет скрытые плюшки. Может (и будет!) глючить. Возможны конфликты с [IgnoreList](docs/IgnoreList.md) для чата.

Алгоритм действий простой: 
1. добавляете человека в игнор штатными средствами (в его профиле, через менюшку → игнорировать)
2. идёте к себе на страницу настроек, в раздел «игнорируемые пользователи»
3. устанавливаете птички настроек по своему разумению (если вы не видите птичек и кнопок → перезагрузите страничку)
4. жмёте кнопку «Сотворить чудо!» (иначе никакого чуда не произойдёт)
  - кнопку «Сотворить чудо!» нужно нажимать каждый раз, когда вы кого-то добавляете или удаляете из игнора (если удаляете\добавляете пачкой, то можно нажать всего один раз опосля)
  - визуального отклика от сотворённого чуда нет, поэтому не нужно лихорадочно нажимать кнопку ещё и ещё, лучше от этого не станет.
  - если вы хотите удалить одного-единственного человека из игнора, удаляйте, а потом жмите кнопку «Сотворить чудо!», иначе при следующем заходе в настройки кнопка пропадёт, а человек будет находиться у вас в игноре на форуме и в чате НАВСЕГДА АХАХАХАА! гкхм...
5. наслаждаетесь тишиной и спокойствием ^_^

Если юзерскрипт вам надоел, перед удалением можете сходить на страницу настроек профиля и нажать кнопку «Удалить настройки PowerIgnore», чтобы в браузере не валялся лишний шлак. Если же вы нажмёте вышеозначенную кнопку и не удалите скрипт, то скрипт просто продолжит работу со сбросом настроек до заводских.

Не забывайте каждый раз при добавлении\удалении в штатный игнор жмякать кнопку «Сотворить чудо!». Такое извращение сделано по разным причинам, в том числе и по тем, чтобы лишний раз не грузить сервер клавогонок тупыми запросами. 

Фух, ну вот вроде бы и всё.

Приятного вам всего!

#### Для ценителей тонких настроек

Юзерскрипт имеет микронастройки, доступ к которым можно поиметь через консоль браузера. Настройки можно изменять по своему разумению (естественно, уже после того, как скрипт установлен). Настройки хранятся локально в браузере (в localStorage). 

Пример изменения настроек под себя:

~~~
// изменить в чате режим игнорирования с «размытия» на «удаление»
var params = JSON.parse(localStorage["KG_PowerIgnore_params"]);
params.chat.ignoreMode = 'remove';
localStorage["KG_PowerIgnore_params"] = JSON.stringify(params);
~~~

Попробуйте поразглядывать эти настройки и найти звук «чпок» :D 

#### Известные баги\нюансы

1. Иногда из-за особенностей архитектуры клавогоночек в настройках профиля не появляются соответствующие элементы управления. F5 (или Ctrl+F5) должно помочь решить проблему.
2. На этом месте может оказаться ваш баг.

#### Как это выглядит на скринах:

![](img/kg_powerignore/settings.jpg 'пример настроек')

---

![](img/kg_powerignore/chat-blur.jpg 'чатик')

---

![](img/kg_powerignore/profile.jpg 'профиль игнорируемого')

---

![](img/kg_powerignore/forum-main.jpg 'список форумов')

---

![](img/kg_powerignore/forum-topics.jpg 'список топиков')

---

![](img/kg_powerignore/forum-posts.jpg 'список сообщений')

---

![](img/kg_powerignore/forum-feed.jpg 'лента сообщений')

---

![](img/kg_powerignore/index-last-on-forum.jpg 'последнее сообщение игнорируемого')

---

![](img/kg_powerignore/in-gamelist.jpg 'геймлист') 

---

![](img/kg_powerignore/in-race-blur.jpg 'в заезде')

---

![](img/kg_powerignore/in-race-abuser.jpg 'заезд со стороны абузера')

---

![](img/kg_powerignore/in-race-ignorer.jpg 'заезд со стороны игнорщика')