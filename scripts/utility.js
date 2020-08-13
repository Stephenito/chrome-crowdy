"use strict";

// EVENTS
const CONSOLE = "console";
const CLICK = "click";
const ERROR = "error";
const ERRORGET = "errorget";
const COOKIE = "cookie";

// INITIAL CONDITIONS
const COOKIESTART = "starting_cookies";
const LOCALSTART = "starting_localStorage";
const SESSIONSTART = "starting_sessionStorage";

const KEYSTOIGNORE = ["num","recording","options"];

function storageInit() {
	chrome.storage.local.clear();
	chrome.storage.local.set({ "num":0, "recording":"none", "events":[], "starting_cookies":[], "starting_localStorage":[], "starting_sessionStorage":[] });
	chrome.storage.local.set({ "options": { "cachemiss": true, "extensions":true, "cookies":true, "localStorage":true, "sessionStorage":true, "disabled":false } });
}

function printDatetime(date) {
	return ('0' + date.getDate()).slice(-2) + "/" + ('0' + date.getMonth()).slice(-2) + "/" + date.getFullYear() + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
}

function printJSONfromJSON(data) {
	let obj = {};
	for (let strevent in data)
		if (!KEYSTOIGNORE.includes(strevent))
			obj[strevent] = data[strevent];

	return JSON.stringify(obj,null,2);
}

function writeEvent(type, data) {
	chrome.storage.local.get(["events","recording","options"], function(storage) {
		if (storage.recording  != "recording")
			return;

		if (!storage.options.cachemiss && type == ERRORGET && data.error == "net::ERR_CACHE_MISS")
			return;
		if (!storage.options.cookies && type == COOKIE)
			return;

		storage.events.push({ "time":printDatetime(new Date()), "type":type, "data":data });
		chrome.storage.local.set({"events":storage.events});
	});
}

function writeInitial(type, data, domain) {
	chrome.storage.local.get(["recording","options",type], function (storage) {
		if (storage.recording != "recording" || (!storage.options.cookies && type == COOKIESTART) || (!storage.options.localStorage && type == LOCALSTART) || (!storage.options.sessionStorage && type == SESSIONSTART))
			return;

		for (let obj of storage[type])
			if (obj.domain == domain)
				return;

		storage[type].push({ "time":printDatetime(new Date()), "domain":domain, "data":data });
		chrome.storage.local.set(storage);
	});
}