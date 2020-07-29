"use strict";

const CONSOLE = "cn";
const CLICK = "cl";
const ERROR = "er";
const ERRORGET = "erget";

function storageInit() {
	chrome.storage.local.clear();
	chrome.storage.local.set({ "num_cl":1, "num_cn":1, "num_er":1, "num_erget":1, "recording":false, "chrono":[] });
}

function printDatetime(date) {
	return ('0' + date.getDate()).slice(-2) + "/" + ('0' + date.getMonth()).slice(-2) + "/" + date.getFullYear() + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
}

function writeEvent(prefix, data) {
	let numkey = "num_" + prefix;

	chrome.storage.local.get([numkey,"recording","chrono"], function(storage) {
		if (!storage.recording)
			return;

		let obj = {};
		let num = storage[numkey];
		let key = prefix + "_" + num.toString();
		obj[key] = {};
		obj[key].time = printDatetime(new Date());
		obj[key].data = data;
		chrome.storage.local.set(obj);

		let chrono = storage.chrono;
		chrono.push(key);
		chrome.storage.local.set({ "chrono":chrono });

		num++;
		let numobj = {};
		numobj[numkey] = num;
		chrome.storage.local.set(numobj);
	});
}