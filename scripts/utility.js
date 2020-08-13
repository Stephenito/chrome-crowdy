"use strict";

const CONSOLE = "console";
const CLICK = "click";
const ERROR = "error";
const ERRORGET = "errorget";
const COOKIESTART = "cookiestart";
const COOKIE = "cookie";

function storageInit() {
	chrome.storage.local.clear();
	chrome.storage.local.set({ "num":0, "recording":"none" });
	chrome.storage.local.set({ "options": { "cachemiss": true, "extensions":true, "cookies":true, "disabled":false } });
}

function printDatetime(date) {
	return ('0' + date.getDate()).slice(-2) + "/" + ('0' + date.getMonth()).slice(-2) + "/" + date.getFullYear() + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
}

function writeEvent(type, data) {
	chrome.storage.local.get(["num","recording","options"], function(storage) {
		if (storage.recording  != "recording")
			return;

		if (!storage.options.cachemiss && type == ERRORGET && data.error == "net::ERR_CACHE_MISS")
			return;

		let obj = {};
		let num = storage.num + 1;
		let key = "event" + ('000000' + num.toString()).slice(-6);

		obj[key] = {};
		obj[key].time = printDatetime(new Date());
		obj[key].type = type;
		obj[key].data = data;
		
		chrome.storage.local.set(obj);
		chrome.storage.local.set({ "num":num });
	});
}