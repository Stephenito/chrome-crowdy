"use strict";

var btnRecord = document.getElementById("btn_record");
var textRecord = document.getElementById("text_record");
var imgRecord = document.getElementById("img_record");
var btnJSONpattern = document.getElementById("btn_json_pattern");
var btnJSONactual = document.getElementById("btn_json_actual");
var optCacheMiss = document.getElementById("opt_cachemiss");
var confirmBox = document.getElementById("confirm");
var confirmText = document.getElementById("confirm_text");
var confirmYes = document.getElementById("confirm_yes");
var confirmNo = document.getElementById("confirm_no");
var optExtensions = document.getElementById("opt_extensions");
var optCookies = document.getElementById("opt_cookies");

// FUNCTIONS

function disableOptions(value) {
	optCacheMiss.disabled = value;
	optExtensions.disabled = value;
	optCookies.disabled = value;
}

function setOptions() {
	chrome.storage.local.get("options", function (storage) {
		storage.options.cachemiss = optCacheMiss.checked;
		storage.options.extensions = optExtensions.checked; 
		storage.options.cookies = optCookies.checked; 
		chrome.storage.local.set({ "options":storage.options });
	});
}

function change_to_record() {
	textRecord.innerText = "Stop recording";
	btnRecord.style.backgroundColor = "firebrick";
	imgRecord.src = "../icons/stop_record.png";
}

function init_record() {
	textRecord.innerText = "Start recording";
	btnRecord.style.backgroundColor = "lime";
	imgRecord.src = "../icons/start_record.png";
}

// LISTENERS

btnRecord.addEventListener("click", function(event) {
	chrome.storage.local.get(["recording","options"], function(result) {

		if (result.recording == "recording") {
			confirmText.innerText = "Are you sure?";
			confirmBox.classList.toggle("hidden");
			chrome.storage.local.set({ recording:"confirm" });

		} else if (result.recording == "none") {
			if (result.options.extensions) {
				chrome.management.getAll(function (extensions) {
					chrome.storage.local.set({ "extensions": extensions });
				});
			}

			disableOptions(true);
			result.options.disabled = true;
			chrome.storage.local.set({ options:result.options });

			chrome.storage.local.set({ recording: "recording" });
			change_to_record();
		}

	});
});

btnJSONpattern.addEventListener("click", function(event) {
	chrome.tabs.create({ url:"../popup/jsonPattern.html" });
});

btnJSONactual.addEventListener(("click"), function (event) {
	chrome.tabs.create({ url:"../popup/jsonActual.html" });
});

optCacheMiss.addEventListener("click", function (event) {
	chrome.storage.local.get("options", function (result) {
		result.options.cachemiss = optCacheMiss.checked;
		chrome.storage.local.set({ "options": result.options });
	});
});

optExtensions.addEventListener("click", function (event) {
	chrome.storage.local.get("options", function (result) {
		result.options.extensions = optExtensions.checked;
		chrome.storage.local.set({ "options": result.options });
	});
});

optCookies.addEventListener("click", function (event) {
	chrome.storage.local.get("options", function (result) {
		result.options.cookies = optCookies.checked;
		chrome.storage.local.set({ "options": result.options });
	});
});

confirmYes.addEventListener("click", function (event) {
	chrome.storage.local.get("recording", function (result) {

		if (result.recording == "confirm") {
			confirmText.innerText = "Do you want to download?";
			chrome.storage.local.set({ recording: "download" });
			init_record();

		} else if (result.recording == "download") {
			confirmBox.classList.toggle("hidden");
			download();
			storageInit();
			disableOptions(false);
			setOptions();
		}

	});
});

confirmNo.addEventListener("click", function (event) {
	chrome.storage.local.get("recording", function (result) {

		if (result.recording == "confirm") {
			confirmBox.classList.toggle("hidden");
			chrome.storage.local.set({ recording: "recording" });

		} else if (result.recording == "download") {
			confirmBox.classList.toggle("hidden");
			storageInit();
			disableOptions(false);
			setOptions();
		}

	});
});

// CODE

init_record();

chrome.storage.local.get(["recording","options"], function(result) {
	if (result.recording == "recording" || result.recording == "confirm")
		change_to_record();
	if (result.recording == "confirm") {
		confirmText.innerText = "Are you sure?";
		confirmBox.classList.toggle("hidden");
	}
	if (result.recording == "download") {
		confirmText.innerText = "Do you want to download?";
		confirmBox.classList.toggle("hidden");
	}

	if (!result.options.cachemiss)
		optCacheMiss.checked = false;
	if (!result.options.extensions)
		optExtensions.checked = false;
	if (!result.options.cookies)
		optCookies.checked = false;

	if (result.options.disabled) {
		disableOptions(true);
	}
});

// DOWNLOAD

function storageRemoveForPrint() {
	chrome.storage.local.remove(["recording", "num", "options"]);
}

function download(data, filename) {
	storageRemoveForPrint();

	let zip = new JSZip();
	
	chrome.storage.local.get(null, function(data) {
		var req = new XMLHttpRequest();
		req.open('GET', chrome.runtime.getURL("popup/json.txt"));
		req.onload = function() {
			zip.file("jsonPattern.txt", this.response);
			zip.file("recorded.json", printJSONfromJSON(data));
			//zip.file("recorded.txt", printTXTfromJSON(data));
			
			zip.generateAsync({type:"blob"})
			.then(function(content) {
			    saveAs(content, "recorded.zip");
			});
		};
		req.send();
	});
}

function printJSONfromJSON(data) {
	debugger;
	let obj = { "events":[] };
	for (let strevent in data) {
		if (strevent.startsWith("event")) {
			obj["events"].push(data[strevent]);
		} else if (strevent == "extensions") {
			obj[strevent] = data[strevent];
		}
	}

	return JSON.stringify(obj,null,2);
}
/*
function printTXTfromJSON(data) {
	let str = "";
	for (let strevent in data) {
		let event = data[strevent];
		str += getOnlyTime(event.time) + ": ";

		if (event.type == ERROR)
			str += "Error: " + event.data.message + ", in file: '" + event.data.filename + "', at line: " + event.data.lineno + "\n";

		else if (event.type == ERRORGET)
			str += "Error GET: " + event.data.error + ", in file: '" + event.data.url + "', type: " + event.data.type + "\n";

		else if (event.type == CONSOLE)
			str += event.data.type + ": " + event.data.msg + "\n";

		else if (event.type == CLICK)
			str += "User clicked item with ID: '" + event.data.id_obj + "', CLASS:'" + event.data.class_obj + "' in URL: '" + event.data.url + "'\n";
	}

	return str;
}

function getOnlyTime(string) {
	return string.slice(11);
}*/