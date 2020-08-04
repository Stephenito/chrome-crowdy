"use-strict";

function update(changes, namespace) {
	let skip = true;
	for (let key in changes) {
		if (key != "num" && key != "recording")
			skip = false;
	}

	if (skip && changes != null)
		return;

	chrome.storage.local.get(null, function(data) {
		body.innerHTML = "<pre>" + printJSONfromJSON(data) + "</pre>";
	});

	function printJSONfromJSON(data) {
		let obj = [];
		for (let strevent in data) {
			if (strevent != "recording" && strevent != "num")
				obj.push(data[strevent]);
		}

		return JSON.stringify(obj,null,2);
	}
}

chrome.storage.onChanged.addListener(update);

var frame = document.getElementById("json");
var body = frame.contentWindow.document.querySelector('body');
update(null,null);