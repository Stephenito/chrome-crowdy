"use strict";

// FUNCTIONS

function download(data, filename) {
	storageRemoveForPrint();

	let zip = new JSZip();
	
	chrome.storage.local.get(null, function(data) {
		var req = new XMLHttpRequest();
		req.open('GET', chrome.runtime.getURL("popup/json.txt"));
		req.onload = function() {
			zip.file("jsonPattern.txt", this.response);
			zip.file("recorded.json", printJSONfromJSON(data));
			zip.file("recorded.txt", printTXTfromJSON(data));
			
			zip.generateAsync({type:"blob"})
			.then(function(content) {
			    saveAs(content, "recorded.zip");
			});
		};
		req.send();
	});
}

function printJSONfromJSON(data) {
	let obj = [];
	for (let strevent in data) 
		obj.push(data[strevent]);

	return JSON.stringify(obj,null,2);
}

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
}

function isClickable(element) {
	return (getComputedStyle(element).cursor == "pointer" || element.getAttribute("role") == "button" ||
		element.href != undefined || element.tagName == "button");
}

function storageRemoveForPrint() {
	chrome.storage.local.remove(["recording", "num"]);
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

// STOP RECORDING
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.stop) {
			if (confirm("Do you want to stop the recording? All actions will be discarded.")) {
				if (confirm("Do you want to download the data?"))
					download();
				
				storageInit();
			}
		}
	}
);
