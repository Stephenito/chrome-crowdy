"use strict";

var btnRecord = document.getElementById("btn_record");
var textRecord = document.getElementById("text_record");
var imgRecord = document.getElementById("img_record");
var btnJSON = document.getElementById("btn_json");

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

btnJSON.addEventListener("click", function(event) {
	chrome.tabs.create({ url:"../popup/jsonPattern.html" });
});

// CODE

chrome.storage.local.get("recording", function(result) {
	if (result.recording)
		change_to_record();
});
