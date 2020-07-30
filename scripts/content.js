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
	for (let strevent in data) {
		if (strevent == "num")
			continue;

		let event = data[strevent];
		str += getOnlyTime(event.time) + ": ";

		if (event.type == 'error')
			str += "Error: " + event.data.message + ", in file: '" + event.data.filename + "', at line: " + event.data.lineno + "\n";

		else if (event.type == 'errorget')
			str += "Error GET: " + event.data.error + ", in file: '" + event.data.url + "', type: " + event.data.type + "\n";

		else if (event.type == 'console')
			str += event.data.type + ": " + event.data.msg + "\n";

		else if (event.type == 'click')
			str += "User clicked item with ID: '" + event.data.id_obj + "' in URL: '" + event.data.url + "'\n";
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
	chrome.storage.local.remove(["recording"]);
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
