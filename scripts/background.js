"use strict";

function getWebErrors(details) {
	tryWriteEvent(ERRORGET,details);
}

function getCookies (changeInfo) {
	tryWriteEvent(COOKIE,changeInfo);
}

function getInitialConditions (request, sender, sendResponse) {
	if (request.type == COOKIESTART) {
		chrome.cookies.getAll({ url:request.data }, function (cookielist) {
			writeInitial(request.type, cookielist, request.data);
		});
	}
	else if (request.type == LOCALSTART)
		writeInitial(request.type, request.data, request.domain);
	else
		tryWriteEvent(request.type, request.data);
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

function tryWriteEvent(type,data) {
	if (busy)
		setTimeout(() => { tryWriteEvent(type,data); },100);
	else {
		busy = true;
		writeEvent(type,data);
	}
}

function writeEvent(type, data) {
	chrome.storage.local.get(["events","options"], function(storage) {
		if (!storage.options.cachemiss && type == ERRORGET && data.error == "net::ERR_CACHE_MISS") {
			busy = false;
			return;
		}
		if (!storage.options[type]) {
			busy = false;
			return;
		}

		storage.events.push({ "time":printDatetime(new Date()), "type":type, "data":data });
		chrome.storage.local.set({"events":storage.events});

		busy = false;
	});
}

function writeInitial(type, data, domain) {
	chrome.storage.local.get(["options",type], function (storage) {
		//if (storage.recording != "recording")
		//	return;
		if ((!storage.options[COOKIE] && type == COOKIESTART) || (!storage.options[STORAGE] && type == LOCALSTART))
			return;

		for (let obj of storage[type])
			if (obj.domain == domain)
				return;

		let obj = {};
		storage[type].push({ "time":printDatetime(new Date()), "domain":domain, "data":data });
		obj[type] = storage[type];
		chrome.storage.local.set(obj);
	});
}