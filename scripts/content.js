"use strict";

// FUNCTIONS

function download(data, filename) {
		var element = document.createElement('a');
		
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
}

function printTXTfromJSON(data) {
	let str = "";
	for (let event of data.chrono) {
		str += getOnlyTime(data[event].time) + ": ";
		if (event[0] == 'l') {
			if (data[event].type == "error") {
				str += "Error: " + data[event].msg + ", in file: '" + data[event].filename + + "', at line: " + data[event].lineno + "\n";
			} else {
				str += "Log: " + data[event].msg + "\n";
			}
		} else if (event[0] == 'c') {
			str += "User clicked item with ID: '" + data[event].id_obj + "' in URL: '" + data[event].url + "'\n";
		}
	}

	return str;
}

function getOnlyTime(string) {
	return string.slice(11);
}

function isClickable(element) {
	return (getComputedStyle(element).cursor == "pointer" || element.getAttribute("role") == "button" ||
		element.href != undefined || element.tagName == "button");
}

function storageRemoveForPrint() {
	chrome.storage.local.remove(["recording", "num_cl", "num_cn", "num_er", "num_erget"]);
}

//
// LISTENSERS
//

// BODY LISTENER FOR CLICKS IN CAPTURE
document.getElementsByTagName("body")[0].addEventListener("click", function (event) {
	if (!isClickable(event.target))
		return;

	let data = { 
		"url": window.location.href,
		"id_obj": event.target.id,
		"class_obj": event.target.className,
		"position_x": event.clientX,
		"position_y": event.clientY
	};

	writeEvent(CLICK, data);
}, true);

// ADD LOG LINE
window.addEventListener("message", function(event) {
	if (event.source != window)
		return;

	if (event.data.ext == "chrome-crowdy") {
		if (event.data.type == "log")
			writeEvent(CONSOLE, event.data.data);
		else if (event.data.type == "error")
			writeEvent(ERROR, event.data.data);
	}

}, false);

// STOP RECORDING
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.stop) {
			if (confirm("Do you want to stop the recording? All actions will be discarded.")) {
				storageRemoveForPrint();

				chrome.storage.local.get(null, function(data) {
					if (confirm("Do you want to print the JSON file?"))
						download(JSON.stringify(data,null,2), "recorded.json");
					if (confirm("Do you want to print the TXT file?"))
						download(printTXTfromJSON(data), "recorded.txt");
				});
				storageInit();
			}
		}
	}
);
