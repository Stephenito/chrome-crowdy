"use-strict";

var events = document.getElementById("events");
var storage = document.getElementById("starting_localStorage");
var cookies = document.getElementById("starting_cookies");
var extensions = document.getElementById("extensions");

function update(changes, namespace) {
	for (let key in changes) {
		if (key == 'events')
			events.innerHTML = (changes.events.newValue) ? printJSONfromJSON(changes.events.newValue) : "";
		if (key == 'starting_localStorage')
			storage.innerHTML = (changes.starting_localStorage.newValue) ? printJSONfromJSON(changes.starting_localStorage.newValue) : "";
		if (key == 'starting_cookies')
			cookies.innerHTML = (changes.starting_cookies.newValue) ? printJSONfromJSON(changes.starting_cookies.newValue) : "";
		if (key == 'extensions')
			extensions.innerHTML = (changes.starting_cookies.newValue) ? printJSONfromJSON(changes.extensions.newValue) : "";
	}
}

chrome.storage.onChanged.addListener(update);
chrome.storage.local.get(null, function(storage) {
	events.innerHTML = printJSONfromJSON(storage.events);
	storage.innerHTML = printJSONfromJSON(storage.starting_localStorage);
	cookies.innerHTML = printJSONfromJSON(storage.starting_cookies);
	extensions.innerHTML = printJSONfromJSON(storage.extensions);
});