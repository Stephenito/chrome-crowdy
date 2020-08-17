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

const KEYSTOIGNORE = ["recording","options"];

function storageInit() {
	chrome.storage.local.clear();
	chrome.storage.local.set({ "recording":"none", "events":[], "starting_cookies":[], "starting_localStorage":[], "extensions":[] });
	//chrome.storage.local.set({ "options": { "cachemiss": true, "extensions":true, "cookie":true, "storage":true, "console":true, "click":true, "error":true, "errorget":true, "disabled":false } });
	
	let obj = {};
	obj["disabled"] = false;
	OPTIONS.forEach( opt => { obj[opt] = true; } );
	chrome.storage.local.set({ options:obj });
}

function printDatetime(date) {
	return ('0' + date.getDate()).slice(-2) + "/" + ('0' + date.getMonth()).slice(-2) + "/" + date.getFullYear() + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
}

function printJSONfromJSON(data) {
	KEYSTOIGNORE.forEach( key => { delete data[key] } );
	return JSON.stringify(data,null,2);
}

function tryInject (func) {
	chrome.storage.local.get("recording", function (storage) {
		if (storage.recording == 'recording')
			func();
		else {
			chrome.storage.onChanged.addListener(function (changeInfo) {
				if (changeInfo['recording'] && changeInfo['recording'] == 'recording')
					func();
			});
		}
	});
}