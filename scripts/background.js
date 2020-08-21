"use strict";

function getWebErrors(details) {
	tryWriteEvent(ERRORGET,ARR_EVENTS,details,details.initiator);
}

function getCookies (changeInfo) {
	tryWriteEvent(COOKIE,ARR_EVENTS,changeInfo,changeInfo.cookie.domain);
}

function getInitialConditions (request, sender, sendResponse) {
	if (request.type == ARR_COOKIESTART) {
		chrome.cookies.getAll({ url:request.data }, function (cookielist) {
			tryWriteEvent(COOKIE, ARR_COOKIESTART, cookielist, request.data);
		});
	}
	else
		tryWriteEvent(request.type, request.array, request.data, request.domain);
}

function setListeners() {
	chrome.runtime.onMessage.addListener(getInitialConditions);
	chrome.webRequest.onErrorOccurred.addListener(getWebErrors , {urls: ["<all_urls>"]});
	chrome.cookies.onChanged.addListener(getCookies);
}
function unsetListeners() {
	chrome.runtime.onMessage.removeListener(getInitialConditions);
	chrome.webRequest.onErrorOccurred.removeListener(getWebErrors , {urls: ["<all_urls>"]});
	chrome.cookies.onChanged.removeListener(getCookies);
}

storageInit();

chrome.storage.onChanged.addListener(function (changeInfo) {
	if (!changeInfo['recording'])
		return;
	if (changeInfo['recording'].newValue == 'recording')
		setListeners();
	if (changeInfo['recording'].newValue == 'confirm')
		unsetListeners();
});

// WRITE IN STORAGE

var updates = [];
var running = false;

function tryWriteEvent(type, array, data, domain) {
	updates.push({ 'type':type, 'array':array, 'data': data, 'domain':domain });
	writeEvent();
}

function writeEvent() {
	if (!updates.length || running)
        return;

    running = true;
	chrome.storage.local.get(["num","domains_cookie","domains_storage","options"], function(storage) {
		let num = storage.num;
		let obj = {};
		let tmpUpdates = updates.slice();

		for (let item of tmpUpdates) {
			if (!storage.options.cachemiss && item.type == ERRORGET && item.data.error == "net::ERR_CACHE_MISS")
				continue;
			if (!storage.options[item.type])
				continue;

			item.domain = trimDomain(item.domain);
			item.domain = item.domain.split("/")[0];

			let storageDomain = (item.array == ARR_COOKIESTART) ? "domains_cookie" : "domains_storage";
			
			if (storage[storageDomain].includes(item.domain) || (obj[storageDomain] && obj[storageDomain].includes(item.domain))) {
				if (item.array != ARR_EVENTS)
					continue;
			} else {
				obj[storageDomain] = storage[storageDomain];
				obj[storageDomain].push(item.domain);
			}
			
			num = num + 1;
			let key = item.array + "|" + ('000000000000' + num.toString()).slice(-12);

			obj[key] = {};
			obj[key].time = printDatetime(new Date());
			obj[key].type = item.type;
			obj[key].data = item.data;
			obj[key].domain = item.domain;
		}

		obj["num"] = num;
		updates = updates.filter( x => !tmpUpdates.includes(x));

		chrome.storage.local.set(obj, () => { preExit(); });
	});
}

function preExit() {
	running = false;
	if (updates.length)
		writeEvent();
}

function trimDomain(domain) {
	if (domain.startsWith("http://"))
		return domain.slice(7);
	if (domain.startsWith("https://"))
		return domain.slice(8);
	if (domain.startsWith("."))
		return domain.slice(1);
	return domain;
}