"use strict";

var btnRecord = document.getElementById("btn_record");
var btnJSON = document.getElementById("btn_json");

chrome.storage.local.get("recording", function(result) {
	if (result.recording) {
		change_to_record();
	}

	btnRecord.addEventListener("click", function(event) {
		if (result.recording) {
			chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { stop:true });
			});
		} else {
			chrome.storage.local.set({ recording: true });
			change_to_record();
		}
	});
	btnJSON.addEventListener("click", function(event) {
		chrome.tabs.create({ url:"../popup/jsonPattern.html" });
	});
});

function change_to_record() {
	btnRecord.innerText = "Stop recording";
	btnRecord.style.backgroundColor = "red";
}