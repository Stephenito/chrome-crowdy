"use strict";

// EVENTS AND OPTIONS
const CONSOLE = "console";
const CLICK = "click";
const ERROR = "error";
const ERRORGET = "errorget";
const COOKIE = "cookie";
const STORAGE = "storage";
const CACHEMISS = "cachemiss";
const EXTENSIONS = "extensions";
const OPTIONS = [CONSOLE, CLICK, ERROR, ERRORGET, COOKIE, STORAGE, CACHEMISS, EXTENSIONS];

// INITIAL CONDITIONS
const COOKIESTART = "starting_cookies";
const LOCALSTART = "starting_localStorage";

const KEYSTOIGNORE = ["num","recording","options"];

var busy = false;

function storageInit() {
	chrome.storage.local.clear();
	chrome.storage.local.set({ "num":0, "recording":"none", "events":[], "starting_cookies":[], "starting_localStorage":[] });
	//chrome.storage.local.set({ "options": { "cachemiss": true, "extensions":true, "cookie":true, "storage":true, "console":true, "click":true, "error":true, "errorget":true, "disabled":false } });
	
	let obj = {};
	obj["disabled"] = false;
	for (let opt of OPTIONS)	
		obj[opt] = true;
	chrome.storage.local.set({ options:obj });
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

function tryWriteEvent(type,data) {
	if (busy)
		setTimeout(() => { tryWriteEvent(type,data); },100);
	else {
		busy = true;
		writeEvent(type,data);
	}
}

function writeEvent(type, data) {
	chrome.storage.local.get(["events","recording","options"], function(storage) {
		if (storage.recording  != "recording") {
			busy = false;
			return;
		}

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
	chrome.storage.local.get(["recording","options",type], function (storage) {
		if (storage.recording != "recording" || (!storage.options[COOKIE] && type == COOKIESTART) || (!storage.options[STORAGE] && type == LOCALSTART))
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