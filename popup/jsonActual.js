"use-strict";

var keysToIgnore = ["num","recording","options"];

function update(changes, namespace) {
	let skip = false;
	for (let key in changes) {
		if (keysToIgnore.includes(key))
			skip = true;
	}

	if (skip && changes != null)
		return;

	chrome.storage.local.get(null, function(data) {
		body.innerHTML = "<pre>" + printJSONfromJSON(data) + "</pre>";
	});

	function printJSONfromJSON(data) {
		let obj = [];
		for (let strevent in data) {
			if (!keysToIgnore.includes(strevent))
				obj.push(data[strevent]);
		}

		return JSON.stringify(obj,null,2);
	}
}

chrome.storage.onChanged.addListener(update);

var frame = document.getElementById("json");
var body = frame.contentWindow.document.querySelector('body');
update(null,null);