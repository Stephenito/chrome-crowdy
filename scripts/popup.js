"use strict";

var btnRecord = document.getElementById("btn_record");
var textRecord = document.getElementById("text_record");
var imgRecord = document.getElementById("img_record");
var btnJSONpattern = document.getElementById("btn_json_pattern");
var btnJSONactual = document.getElementById("btn_json_actual");
var optCacheMiss = document.getElementById("opt_cachemiss");

// FUNCTIONS

function change_to_record() {
	textRecord.innerText = "Stop recording";
	btnRecord.style.backgroundColor = "red";
	imgRecord.src = "../icons/stop_record.png"
}

// LISTENERS

btnRecord.addEventListener("click", function(event) {
	chrome.storage.local.get("recording", function(result) {
		if (result.recording) {
			chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { stop:true });
			});
		} else {
			chrome.storage.local.set({ recording: true });
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

// CODE

chrome.storage.local.get(["recording","options"], function(result) {
	if (result.recording)
		change_to_record();
	if (!result.options.cachemiss)
		optCacheMiss.checked = false;
});
