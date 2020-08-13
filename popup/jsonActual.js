"use-strict";

function update(changes, namespace) {
	let skip = true;
	for (let key in changes) {
		if (!KEYSTOIGNORE.includes(key))
			skip = false;
	}

	if (skip && changes != null)
		return;

	chrome.storage.local.get(null, function(data) {
		body.innerHTML = "<pre>" + printJSONfromJSON(data) + "</pre>";
	});
}

chrome.storage.onChanged.addListener(update);

var frame = document.getElementById("json");
var body = frame.contentWindow.document.querySelector('body');
update(null,null);