"use-strict";

var keysToIgnore = ["num","recording","options"];

function update(changes, namespace) {
	let skip = true;
	for (let key in changes) {
		if (!keysToIgnore.includes(key))
			skip = false;
	}

	if (skip && changes != null)
		return;

	chrome.storage.local.get(null, function(data) {
		body.innerHTML = "<pre>" + printJSONfromJSON(data) + "</pre>";
	});

	function printJSONfromJSON(data) {
		let obj = { "events":[] };
		for (let strevent in data) {
			if (!keysToIgnore.includes(strevent)) {
				if (strevent.startsWith("event")) {
					obj["events"].push(data[strevent]);
				} else if (strevent == "extensions" || strevent == "starting_cookies") {
					obj[strevent] = data[strevent];
				}
			}
		}

		return JSON.stringify(obj,null,2);
	}
}

chrome.storage.onChanged.addListener(update);

var frame = document.getElementById("json");
var body = frame.contentWindow.document.querySelector('body');
update(null,null);