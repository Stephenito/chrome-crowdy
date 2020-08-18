"use strict";

function getWebErrors(details) {
	tryWriteEvent(ERRORGET,ARR_EVENTS,details);
}

function getCookies (changeInfo) {
	tryWriteEvent(COOKIE,ARR_EVENTS,changeInfo);
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

var busy = false;

function tryWriteEvent(type, array, data, domain) {
	if (busy)
		setTimeout(() => { tryWriteEvent(type,array,data,domain); },100);
	else {
		busy = true;
		writeEvent(type,array,data,domain);
	}
}

function writeEvent(type, array, data, domain) {
	chrome.storage.local.get(["num","domains","options"], function(storage) {
		if (!storage.options.cachemiss && type == ERRORGET && data.error == "net::ERR_CACHE_MISS") {
			busy = false;
			return;
		}
		if (!storage.options[type]) {
			busy = false;
			return;
		}

		debugger;
		if (array != ARR_EVENTS && storage.domains.includes(domain))
			return;

		let obj = {};
		let num = storage.num + 1;
		let key = array + "|" + ('000000000000' + num.toString()).slice(-12);

		obj[key] = {};
		obj[key].time = printDatetime(new Date());
		obj[key].type = type;
		obj[key].data = data;
		obj[key].domain = domain;

		chrome.storage.local.set(obj);
		chrome.storage.local.set({ "num":num });

		busy = false;
	});
}
