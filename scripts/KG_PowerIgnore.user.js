// ==UserScript==
// @name           KG_PowerIgnore
// @namespace      klavogonki
// @include        http*://klavogonki.ru/
// @include        http*://klavogonki.ru/g*
// @include        http*://klavogonki.ru/forum*
// @include        http*://klavogonki.ru/u*
// @author         un4given
// @version        1.1.3
// @description    Игнор-лист (в чате, на форуме и в заездах), привязанный к штатному игнору на странице настроек профиля
// ==/UserScript==

//do nothing, if we are not in main window (honestly I dunno if this shit is still needed in 2020)
if (window.self != window.top) return;

function main() {

	//looks familiar, eh? :D
	var IgnoreList		= [];
	var ignored_ids		= [];
	var ignored_logins	= [];


// --- internal functions --- //
	function updateCache() {
		if (IgnoreList.length)
		{
			ignored_ids		= IgnoreList.map(user => user.id);
			ignored_logins	= IgnoreList.map(user => user.login);
		}
	}

	function getDefaultParams()
	{
		return {
			  ver: '1.12', //version of params (preferences)
			forum: {ignoreMode: 'remove', blur: '5px'}, 
			 chat: {ignoreMode: 'blur', blur: '2px', updateInterval: 10},
			 race: {ignoreMode: 'remove', blur: '5px', updateInterval: 500, enableSound: false}	//added in version 1.01 
		}
	}

	function saveDefaultParams()
	{
		localStorage.setItem('KG_PowerIgnore_params', JSON.stringify(getDefaultParams()));

		localStorage.setItem('KG_PowerIgnore_process_forum', 1);
		localStorage.setItem('KG_PowerIgnore_process_chat', 0);
		localStorage.setItem('KG_PowerIgnore_process_races', 1);
		localStorage.setItem('KG_PowerIgnore_process_additional', 1);
	}

	function loadParams() {
		var params = JSON.parse(localStorage.getItem('KG_PowerIgnore_params'));
		var newParams = getDefaultParams();

		//check params version, if needed
		if (params.ver < newParams.ver)
		{
			switch (params.ver)
			{
				case '1.00':
					localStorage.setItem('KG_PowerIgnore_process_forum', +params.forum.enabled);
					localStorage.setItem('KG_PowerIgnore_process_chat', +params.chat.enabled);
					localStorage.setItem('KG_PowerIgnore_process_races', 0);
					localStorage.setItem('KG_PowerIgnore_process_additional', 0);
					delete params.forum.enabled;
					delete params.chat.enabled;
					params.chat.updateInterval = newParams.chat.updateInterval;
					params.race = newParams.race;
					break;
			}


			//update params version to current (param-pam-pam, lol!)
			params.ver = newParams.ver;
			//save updated params
			localStorage.setItem('KG_PowerIgnore_params', JSON.stringify(params));
		}

		return params;
	}

	// returns one of the ['forum', 'forum_feed', 'gamelist', 'in_race', 'prefs', 'profile', 'index']
	function getCurrentPageID()
	{

		if (/\/\/klavogonki.ru\/gamelist\/?/.test(window.location.href)) 
			return 'gamelist';

		if (/\/\/klavogonki.ru\/g\/\?gmid=/.test(window.location.href)) 
			return 'in_race';

		// !!! do not switch order with next forum check !!!
		if (/\/\/klavogonki.ru\/forum\/feed\/?/.test(window.location.href))
			return 'feed';

		if (/\/\/klavogonki.ru\/forum\/?/.test(window.location.href)) 
			return 'forum';

		// !!! do not switch order with next profile check !!!
		if (/\/\/klavogonki.ru\/u\//.test(window.location.href) && location.hash.split('/')[2]=='prefs')
			return 'prefs';

		if (/\/\/klavogonki.ru\/u\//.test(window.location.href) && location.hash)
			return 'profile';

		if (/\/\/klavogonki.ru\/?$/.test(window.location.href)) 
			return 'index';
	}

	//add controls on the profile settings page
	function addUI()
	{
		//all this crap with MutationObserver is needed for adding controls not only after 
		//settings page is loaded, but also after settings page is updated, because it is fucking dynamic.

		//I dunno if I understood this shit correctly, but this should work, I guess :/
		(new MutationObserver(function(changes, observer) {
			var il = document.getElementsByClassName('ignore-list');
			if (!il.length) return;
			observer.disconnect();

			//find ignore list element (ul)
			var prevEl = il[0];

			//check if there are anybody in this list
			if (prevEl.hasClassName('ng-hide')) return;

			//okay, so here we should add some controls, including our magic button

			//add checkbox for ignoring on forum
			var el1 = document.createElement('div');
			el1.className = 'checkbox';
			el1.innerHTML='<label><input type="checkbox" id="ignore_users_on_forum">Я не хочу видеть игнорируемых пользователей на форуме</label>';
			prevEl.parentNode.insertBefore(el1, prevEl);

			var chb1 = document.getElementById('ignore_users_on_forum');
			chb1.checked = (localStorage["KG_PowerIgnore_process_forum"] == true);
			chb1.addEventListener("click", function(){
					localStorage["KG_PowerIgnore_process_forum"] = 0+this.checked;
				}, false);

			//add checkbox for ignoring in chat
			var el2 = document.createElement('div');
			el2.className = 'checkbox';
			el2.innerHTML='<label><input type="checkbox" id="ignore_users_in_chat">Я не хочу видеть игнорируемых пользователей в чате</label>';
			prevEl.parentNode.insertBefore(el2, prevEl);

			var chb2 = document.getElementById('ignore_users_in_chat');
			chb2.checked = (localStorage["KG_PowerIgnore_process_chat"] == true);

			chb2.addEventListener("click", function(){
					localStorage["KG_PowerIgnore_process_chat"] = 0+this.checked;
				}, false);

			//add checkbox for ignoring in gamelist\races
			var el3 = document.createElement('div');
			el3.className = 'checkbox';
			el3.innerHTML='<label><input type="checkbox" id="ignore_users_in_races">Я не хочу видеть игнорируемых пользователей в геймлисте и заездах</label>';
			prevEl.parentNode.insertBefore(el3, prevEl);

			var chb3 = document.getElementById('ignore_users_in_races');
			chb3.checked = (localStorage["KG_PowerIgnore_process_races"] == true);

			chb3.addEventListener("click", function(){
					localStorage["KG_PowerIgnore_process_races"] = 0+this.checked;
				}, false);

			//add checkbox for additional ignoring features
			var el4 = document.createElement('div');
			el4.className = 'checkbox';
			el4.innerHTML='<label><input type="checkbox" id="ignore_users_additional">Применить дополнительные ограничения к игнорируемым пользователям</label>';
			prevEl.parentNode.insertBefore(el4, prevEl);

			var chb4 = document.getElementById('ignore_users_additional');
			chb4.checked = (localStorage["KG_PowerIgnore_process_additional"] == true);

			chb4.addEventListener("click", function(){
					localStorage["KG_PowerIgnore_process_additional"] = 0+this.checked;
				}, false);


			//add magic button
			var btn1 = document.createElement('button');
			btn1.id = 'ignore_update_local_list_btn';
			btn1.className = 'btn';
			btn1.textContent = 'Сотворить чудо!';
			prevEl.parentNode.insertBefore(btn1, prevEl);
			btn1.addEventListener("click", function(){

				//here we are trying to fetch ignore settings through KG api
				var xhr = new XMLHttpRequest();
				xhr.open('GET', '/api/profile/get-ignore-list', true);
				xhr.onload = function () {
					if (this.status !== 200) {
						console.log("[!]KG_PowerIgnore: couldn't get ignore list :(");
					}

					var r = JSON.parse(xhr.responseText);
					if (r.ok)
					{
						var newList = [];
						for (var i=0; i<r.list.length; i++)
						{
							var id 		= r.list[i].ignore_id.toString();	
							var login	= r.users[id].login.toString();	//there could be nicknames, containing digits only!
							newList.push({'id': id, 'login': login});
						}
						localStorage["KG_PowerIgnore"] = JSON.stringify(newList);

						//enable magic button back (why not?)
						var btn = document.getElementById('ignore_update_local_list_btn');
						if (btn)
							btn.disabled = false;
					}
				};
				xhr.send();
			}, false);

			//add cleanup button
			var btn2 = document.createElement('button');
			btn2.id = 'ignore_cleanup_btn';
			btn2.className = 'btn';
			btn2.textContent = 'Удалить настройки PowerIgnore';
			prevEl.parentNode.insertBefore(btn2, prevEl);
			btn2.addEventListener("click", function(){
				if (confirm('Вы уверены, что хотите удалить настройки PowerIgnore?'))
				{
					localStorage.removeItem("KG_PowerIgnore");
					localStorage.removeItem("KG_PowerIgnore_params");
					localStorage.removeItem("KG_PowerIgnore_process_forum");
					localStorage.removeItem("KG_PowerIgnore_process_chat");
					localStorage.removeItem("KG_PowerIgnore_process_races");
					localStorage.removeItem("KG_PowerIgnore_process_additional");
					console.log("[KG_PowerIgnore]: все настройки, связанные с PowerIgnore удалены. Приятных вам собеседников!");
				}
			});
		})).observe(document, {childList: true, subtree: true});
	}

	function addStyle(css)
	{
		var style=document.createElement('style');
		style.textContent = css;
		var target = document.getElementsByTagName('head')[0] || document.body || document.documentElement;
		target.appendChild(style);
	}

// --- ENTRY POINT --- //

	if (!localStorage.getItem('KG_PowerIgnore_params'))
		saveDefaultParams();

	// load params
	var params = loadParams();

	// init local list with fetched global ignore list (from profile settings by clicking 'Magic' button)
	if (localStorage["KG_PowerIgnore"])
	{
		IgnoreList = JSON.parse(localStorage["KG_PowerIgnore"]);
		updateCache();
	}

	var currentPage = getCurrentPageID();

	//if we are in the profile settings then add some controls
	if (currentPage == 'prefs') 
	{
		addUI();
	}

	if (!IgnoreList.length) return; //I'm outta here, nothing to do!

	// okay, if we are here, then there are at least 1 record in IgnoreList, proceed...

// --- PROCESS FORUM --- //

	// perform forum cleanup, if needed
	if (localStorage["KG_PowerIgnore_process_forum"] == true)
	{
		//check if we are on the forum page (but not on forum_feed, due to specific page detection in getCurrentPageID())
		if (currentPage == 'forum')
		{
			//if we are in the forums list
			if (document.getElementById('forums-list'))
			{
				//check authors of last posts and blur'em despite of the ignoreMode setings
				var authors = document.getElementsByClassName("user-link");
				for (var i=0; i<authors.length; i++)
				{
					var user_id = authors[i].href.split('/')[5].toString();
					if (~ignored_ids.indexOf(user_id))
					{
						authors[i].style.filter = 'blur('+params.forum.blur+')';
					}
				}
			}

			//if we are in the topics list
			if (document.getElementById('topics-list'))
			{
				//delete or blur topic
				var authors = document.querySelectorAll(".author a.user-link");
				for (var i=0; i<authors.length; i++)
				{
					var user_id = authors[i].href.split('/')[5].toString();
					if (~ignored_ids.indexOf(user_id))
					{
						var wholeTopicBlock = authors[i].parentElement.parentElement;
						switch(params.forum.ignoreMode)
						{
							case 'blur':
								wholeTopicBlock.style.filter = 'blur('+params.forum.blur+')';	
								break;
		
							case 'remove':
								wholeTopicBlock.style.display = 'none';
								break;
						}
					}
				}

				//also check if authors of last post are also in ignore list
				var lastWriters = document.querySelectorAll(".last-post a.user-link");
				for (var i=0; i<lastWriters.length; i++)
				{
					var user_id = lastWriters[i].href.split('/')[5].toString();
					if (~ignored_ids.indexOf(user_id))
					{
						lastWriters[i].style.filter = 'blur('+params.forum.blur+')';
					}
				}
			}

			//if we are inside of the particular topic
			if (document.getElementById('posts-list'))
			{
				//delete or blur particular posts
				var headers		= document.getElementsByClassName("posth");
				var posts		= document.getElementsByClassName("post");
				var users		= document.getElementsByClassName("user");
	
				for (var i=0; i<users.length; i++)
				{
					var user_id = users[i].href.split('/')[4].toString();
					if (~ignored_ids.indexOf(user_id))
					{
						switch(params.forum.ignoreMode)
						{
							case 'blur':
								posts[i].style.filter = 'blur('+params.forum.blur+')';
								break;
		
							case 'remove':
//								headers[i].style.textDecoration = 'line-through';
								headers[i].style.filter = 'blur('+params.forum.blur+')';
								headers[i].style.borderBottom = '1px solid #dddddd';
								posts[i].style.display = 'none';
								break;
						}
					}
				}
			}
		} else if (currentPage == 'forum_feed') {
			//well, let's process "forum/feed" page. 
			//make sure that there are any posts (they SHOULD be, but who knows)
			if (document.getElementById('posts-list'))
			{
				//let's go!
				var posts		= document.getElementsByClassName("post");
				var users		= document.getElementsByClassName("user");

				for (var i=0; i<users.length; i++)
				{
					var user_id = users[i].href.split('/')[4].toString();
					if (~ignored_ids.indexOf(user_id))
					{
						switch(params.forum.ignoreMode)
						{
							case 'blur':
								posts[i].style.filter = 'blur('+params.forum.blur+')';	
								break;
		
							case 'remove':
								//well... who can do better? :D
								posts[i].children[0].children[0].style.display = 'none';
								posts[i].children[1].children[0].children[0].style.textDecoration = 'line-through';
								posts[i].children[1].children[0].children[1].style.display = 'none';
								break;
						}
					}
				}
			}
		} else if (currentPage == 'index') {
			//so, we are on the index page and need to make some changes to 'last discussions' (forum) block
			var users = document.getElementById('discussing_forum').getElementsByClassName('user-link');
			for (var i=0; i<users.length; i++)
			{
				var user_id = users[i].href.split('/')[5].toString();
				if (~ignored_ids.indexOf(user_id))
				{
						users[i].style.filter = 'blur('+params.forum.blur+')';
				}
			}
		}

	}

// --- PROCESS CHAT (in gamelist or in race) --- //

	// let's make our chat cleaner and better! yahoo :dance: 
	if (localStorage["KG_PowerIgnore_process_chat"] == true)
	{
		if ((currentPage == 'gamelist') || (currentPage == 'in_race')) 
		{
			//sooo, we are either in general chat or in game chat...
			//well, nothing to do except this shit:
			//got this piece of code from original IgnoreList.user.js script (by Fenex & Co) and slighly rewrited it, so don't blame me too much
			setInterval(function(params, ignored_ids, ignored_logins) {
				if (localStorage["KG_PowerIgnore_process_chat"] == false) return;

				var messages = document.querySelectorAll('.chat .messages-content p');

				for(var i=0; i<messages.length; i++) {
					if(messages[i].hasAttribute('checked')) { continue; }

					var needToIgnore = false;

					var username = messages[i].getElementsByClassName('username');
					if(username.length) {
						var id = username[0].getElementsByTagName('span')[0].getAttribute('data-user');
						needToIgnore = ~ignored_ids.indexOf(id);
					} else {
						//no time to find out wtf is going on here, so I just leave it as it is... :(
						var sm = messages[i].getElementsByClassName('system-message');
						if(sm.length) {
							var login = sm[0].innerHTML.match(/^([^ ]+)/);
							if(login)
								login = login[0];
							else
								login = '';
								
							needToIgnore = ~ignored_logins.indexOf(login);
						}
					}
					
					//perform cleanup if needed:
					if (needToIgnore)
					{
						switch (params.chat.ignoreMode)
						{
							case 'blur':
								messages[i].style.filter = 'blur('+params.chat.blur+')';

								//remove indication of personally addressed message
								if (messages[i].children[0].style.backgroundColor)
									messages[i].children[0].style.backgroundColor = "";
								break;
								
							case 'remove':
								messages[i].style.display = 'none';
								break;
						}
					}
					
					messages[i].setAttribute('checked', 'PowerIgnore');
				}
			}, params.chat.updateInterval, params, ignored_ids, ignored_logins);

			//also create additional css rules for removing\blurring ignored persons in chat userlist
			var css = ignored_ids.map(function(id){return ('.userlist-content ins.user'+id)}).join(', ');
			switch (params.chat.ignoreMode)
			{
				case 'blur':
					css += '{filter: blur('+params.chat.blur+')}';
					break;

				case 'remove':
					css += '{display: none;}';
					break;
			}

			addStyle(css);
		}
	}

// --- PROCESS GAMELIST or IN RACE page--- //

	if (localStorage["KG_PowerIgnore_process_races"] == true)
	{
		switch(currentPage)
		{
			case 'gamelist':
				setInterval(function(params, ignored_ids) {
					if (localStorage["KG_PowerIgnore_process_races"] == false) return;
					var cars = document.getElementsByClassName("car");
					if (!cars.length) return;
					try {
						for (var i=0; i<cars.length; i++)
						{
							if (cars[i].hasAttribute('checked')) continue;

							cars[i].setAttribute('checked', 'PowerIgnore');
						
							var user_id = cars[i].nextElementSibling.children[1].href.split('/')[4];
							if (~ignored_ids.indexOf(user_id))
							{
// do not use params.race.ignoreMode for races in gamelist, always use blur!
/*
								switch (params.race.ignoreMode)
								{
									case 'blur':
*/
										cars[i].style.filter='blur('+params.race.blur+')';
										cars[i].nextElementSibling.style.filter='blur('+params.race.blur+')';
/*
										break;

									case 'remove':
										//TODO (or not to do?)
										break;
								}
*/
							}
						}
					} catch(e){}
				}, params.race.updateInterval, params, ignored_ids);
				break;


			case 'in_race':
				setInterval(function(params, ignored_ids) {
					if (localStorage["KG_PowerIgnore_process_races"] == false) return;
					var cars = document.getElementById('players').querySelectorAll("div.car");
					if (!cars.length) return;
					try {
						var userLinks = document.getElementById('players').querySelectorAll("div.name_content a");

						var isRemoved = false;						
						for (var i=0; i<cars.length; i++)
						{
							if (cars[i].hasAttribute('checked')) continue;

							cars[i].setAttribute('checked', 'PowerIgnore');
						
							var user_id = userLinks[i].href.split('/')[4];
							if (~ignored_ids.indexOf(user_id))
							{
								isRemoved = true;
								//						    v--------------------- LOOOOOOL xD --------------------------------- v 
								var wholeTrackPart = cars[i].parentElement.parentElement.parentElement.parentElement.parentElement;
								switch (params.race.ignoreMode)
								{
									case 'blur':
										cars[i].style.filter='blur('+params.race.blur+')';
										wholeTrackPart.style.filter='blur('+params.race.blur+')';
										break;

									case 'remove':
										wholeTrackPart.style.display='none';
										break;
								}
							}

						}
						//!!! experimental feature !!! 
						if (params.race.enableSound 
							&& (params.race.ignoreMode == 'remove')
							&& isRemoved)
						{
							(function () {
								(new 
									Audio( "data:audio/wav;base64,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"
								)).play();
							})();
						}
					} catch(e){}
				}, params.race.updateInterval, params, ignored_ids)
				break;
		}
	}

// --- PROCESS ADDITIONAL  --- //

	// perform additional processing, if needed
	if (localStorage["KG_PowerIgnore_process_additional"] == true)
	{
		//process last discussions (!!!except forum block!!!) on index page
		if (currentPage == 'index')
		{
			['discussing_today', 'discussing_week', 'discussing_recent'].map(function(block_name){
				var users = document.getElementById(block_name).getElementsByClassName('user-link');

				for (var i=0; i<users.length; i++)
				{
					var user_id = users[i].href.split('/')[5].toString();
					if (~ignored_ids.indexOf(user_id))
					{
							users[i].parentElement.parentElement.style.display = 'none';
					}
				}
			});
		}

		//process profile of ignored person
		if (currentPage == 'profile')
		{
			var user_id = location.hash.split('/')[1];

			if (~ignored_ids.indexOf(user_id))
			{
				try {
					//check if user is already blocked by administration...
					if (document.getElementsByClassName("profile-hidden").length) return;

					//...no? okay, let's block it by our PowerIgnore!
					var profile_info = document.getElementsByClassName("profile-header")[0].nextElementSibling.nextElementSibling;
					var warning = document.createElement('div');
					warning.className = 'profile-hidden profile-hidden-ignore';
					warning.innerHTML = 'Пользователь заблокирован настройками игнор-листа<div style="font-size:50%">Для разблокировки пользователя зайдите в настройки игнор-листа в своём профиле или отключите юзерскрипт PowerIgnore.</div><div class="icon-icomoon icon-blocked"></div>';
					profile_info.parentNode.insertBefore(warning, profile_info);
					profile_info.style.display='none';

					//change avatar to default
					document.querySelectorAll(".avatar img")[0].src='/img/avatar_dummy.gif';

					//reset rank
					var rank = document.querySelectorAll(".profile-header div.title")[0];
					rank.className = 'rang1 title';
					rank.innerText='Игнорируемый';

					//reset car\tuning
					var tuning = document.querySelectorAll(".car .imgcont .car-tuning");
					if (tuning.length)
					{
						//reset car base
						tuning[0].previousElementSibling.className='car-base_ img car1';

						//reset aero
						tuning[0].previousElementSibling.parentNode.style.background='rgb(0, 0, 0)';

						//reset tuning
						for (var i=0; i<tuning.length; i++)
						{
							tuning[i].className = 'car-tuning car-tuning'+(i+1).toString()+'_ img car1';
						}
					}
				} catch(e){}
			}
		}
	}

// --- END OF FUNCTION MAIN --- //
}

function exec(fn) {
    var script = document.createElement('script');
    script.setAttribute('type', 'application/javascript');
    script.textContent = '(' + fn + ')();';
    document.body.appendChild(script);
    document.body.removeChild(script);
}

window.addEventListener('load', function() {
    exec(main);
}, false);
