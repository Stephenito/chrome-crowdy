"use strict";

// TYPES
const CONSOLE = "console";
const CLICK = "click";
const ERROR = "error";
const ERRORGET = "errorget";
const COOKIE = "cookie";
const STORAGE = "storage";
const CACHEMISS = "cachemiss";
const EXTENSIONS = "extensions";
const OPTIONS = [CONSOLE, CLICK, ERROR, ERRORGET, COOKIE, STORAGE, CACHEMISS, EXTENSIONS];

// ARRAYS' NAMES
const ARR_EVENTS = "events";
const ARR_COOKIESTART = "starting_cookies";
const ARR_LOCALSTART = "starting_localStorage";
const ARR_EXTENSIONS = "extensions";
const ARRAYS = [ARR_EVENTS, ARR_COOKIESTART, ARR_LOCALSTART, ARR_EXTENSIONS];

const KEYSTOIGNORE = ["recording","options","num","domains"];

function storageInit() {
	chrome.storage.local.clear();
	chrome.storage.local.set({ "recording":"none", "num":0, "domains":[] });
	
	let obj = {};
	obj["disabled"] = false;
	OPTIONS.forEach( opt => { obj[opt] = true; } );
	chrome.storage.local.set({ options:obj });
}

function printDatetime(date) {
	return ('0' + date.getDate()).slice(-2) + "/" + ('0' + date.getMonth()).slice(-2) + "/" + date.getFullYear() + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
}

function tryInject (func) {
	chrome.storage.local.get("recording", function (storage) {
		if (storage.recording == 'recording')
			func();
		else
			chrome.storage.onChanged.addListener(function (changeInfo) {
				if (changeInfo['recording'] && changeInfo['recording'].newValue == 'recording')
					func();
			});
	});
}