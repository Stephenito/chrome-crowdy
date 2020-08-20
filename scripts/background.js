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

var promises = [];

function tryWriteEvent(type, array, data, domain) {
	promises.push(writeEvent(type,array,data,domain, promises.length));
}

async function writeEvent(type, array, data, domain,position) {
	if (position > 0)
		await promises[position-1];

	chrome.storage.local.get(["num","domains_cookie","domains_storage","options"], function(storage) {
		if (!storage.options.cachemiss && type == ERRORGET && data.error == "net::ERR_CACHE_MISS") {
			promises.shift();
			return Promise.resolve();
		}
		if (!storage.options[type]) {
			promises.shift();
			return Promise.resolve();
		}

		let obj = {};
		
		domain = trimDomain(domain);
		domain = domain.split("/")[0];

		let storageDomain = (ARR_COOKIESTART) ? "domains_cookie" : "domains_storage";
		
		if (storage[storageDomain].includes(domain)) {
			if (array != ARR_EVENTS)
				return;
		} else {
			obj[storageDomain] = storage[storageDomain];
			obj[storageDomain].push(domain);
		}
		
		let num = storage.num + 1;
		let key = array + "|" + ('000000000000' + num.toString()).slice(-12);

		obj[key] = {};
		obj[key].time = printDatetime(new Date());
		obj[key].type = type;
		obj[key].data = data;
		obj[key].domain = domain;
		obj["num"] = num;
		
		chrome.storage.local.set(obj);

		promises.shift();
		return Promise.resolve();
	});
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