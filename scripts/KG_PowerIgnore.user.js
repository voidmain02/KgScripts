// ==UserScript==
// @name           KG_PowerIgnore
// @namespace      klavogonki
// @include        http*://klavogonki.ru/g*
// @include        http*://klavogonki.ru/forum*
// @include        http*://klavogonki.ru/u*
// @author         un4given
// @version        1.0.0
// @description    Игнор-лист в чате и на форуме, привязанный к штатному игнору на странице настроек профиля
// ==/UserScript==

//do nothing, if we are not in main window (honestly I dunno if this shit is still needed in 2020)
if (window.self != window.top) return;

function main() {

	//looks familiar, eh? :D
	var IgnoreList		= [];
	var ignored_ids		= [];
	var ignored_logins	= [];

	function updateCache() {
		ignored_ids		= [];
		ignored_logins	= [];
		
		for(var i=0; i<IgnoreList.length; i++) {
			ignored_ids.push(IgnoreList[i].id);
			ignored_logins.push(IgnoreList[i].login);
		}
	}

	// set default params
	if (!localStorage.getItem('KG_PowerIgnore_params'))
	{
		localStorage.setItem('KG_PowerIgnore_params', JSON.stringify({
			ver:'1.00', //reserved for future use
			forum: {blur:'5px', ignoreMode:'remove', enabled:true}, 
			chat: {blur:'2px', ignoreMode:'blur', enabled:false}
		}));
	}

	var params = JSON.parse(localStorage.getItem('KG_PowerIgnore_params'));

	// init local list with fetched global ignore list (from profile settings by clicking 'Magic' button)
	if (localStorage["KG_PowerIgnore"])
	{
		IgnoreList = JSON.parse(localStorage["KG_PowerIgnore"]);
		updateCache();
	}


	//if we are in the profile settings then add some controls
	if (/\/\/klavogonki.ru\/u\//.test(window.location.href) && location.hash.split('/')[2]=='prefs') 
	{
		//find ignore list element (ul)
		var prevEl = document.getElementsByClassName('ignore-list')[0];

		//check if there are anybody in this list
		if (prevEl.hasClassName('ng-hide')) return;

		//okay, so here we should add some controls, including our magic button

		//add checkbox for ignoring on forum
		var el1 = document.createElement('div');
		el1.className = 'checkbox';
		el1.innerHTML='<label><input type="checkbox" id="ignore_users_on_forum">Я не хочу видеть этих персонажей на форуме</label>';
		prevEl.parentNode.insertBefore(el1, prevEl);

		var chb1 = document.getElementById('ignore_users_on_forum');
		chb1.checked = params.forum.enabled;
		chb1.addEventListener("click", function(){
				params.forum.enabled = this.checked;
				localStorage.setItem('KG_PowerIgnore_params', JSON.stringify(params));
			}, false);

		//add checkbox for ignoring in chat
		var el2 = document.createElement('div');
		el2.className = 'checkbox';
		el2.innerHTML='<label><input type="checkbox" id="ignore_users_in_chat">Я не хочу видеть этих персонажей в чате</label>';
		prevEl.parentNode.insertBefore(el2, prevEl);

		var chb2 = document.getElementById('ignore_users_in_chat');
		chb2.checked = params.chat.enabled;

		chb2.addEventListener("click", function(){
				params.chat.enabled = this.checked;
				localStorage.setItem('KG_PowerIgnore_params', JSON.stringify(params));
			}, false);

		//add magic button
		var btn = document.createElement('button');
		btn.id = 'ignore_update_local_list_btn';
		btn.className = 'btn';
		btn.textContent = 'Сотворить чудо!';
		prevEl.parentNode.insertBefore(btn, prevEl);
		btn.addEventListener("click", function(){

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

	}

	if (!IgnoreList.length) return; //I'm outta here, nothing to do!


	// okay, if we are here, then there are at least 1 record in IgnoreList, proceed...

// --- FORUM FUNCTIONS --- //

	// perform forum cleanup, if needed
	if (params.forum.enabled)
	{
		//let's check if we are on the one of the forum pages...
		if (/\/\/klavogonki.ru\/forum\//.test(window.location.href)) 
		{
			//now let's check if we are on the "forum/FEED", because it slightly differs from other pages...
			if (/\/\/klavogonki.ru\/forum\/feed\//.test(window.location.href))
			{
				//well, let's process "forum/feed" page. make sure that there are any posts (they SHOULD be, but who knows)
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
			} else {
				//okay, so we are on the "forum" (but not "forum/feed") page, let's check if we are in posts section...
				if (document.getElementById('posts-list'))
				{
					//okay, here we are, let's scan all posts:
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
									headers[i].style.textDecoration = 'line-through';
									posts[i].style.display = 'none';
									break;
							}
						}
					}
				}
			}
		}
	}

// --- CHAT FUNCTIONS --- //

	// let's make our chat cleaner and better! yahoo :dance: 
	if (params.chat.enabled)
	{
		if (/\/\/klavogonki.ru\/(gamelist|g)\//.test(window.location.href)) 
		{
			//sooo, we are either in general chat or in game chat...
			//well, nothing to do except this shit:
			//got this piece of code from original IgnoreList.user.js script (by Fenex & Co) and slighly rewrited it, so don't blame me too much
			setInterval(function(params, ignored_ids, ignored_logins) {
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
								break;
								
							case 'remove':
								messages[i].style.display = 'none';
								break;
						}
					}
					
					messages[i].setAttribute('checked', 'BlackList');
				}
			}, 10, params, ignored_ids, ignored_logins);
		}
	}
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
