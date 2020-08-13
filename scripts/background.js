"use strict";

storageInit();

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type == COOKIESTART) {

			chrome.storage.local.get(["recording","options"], function (storage) {
				if (storage.recording != "recording" || !storage.options.cookies)
					return;

				chrome.cookies.getAll({ url:request.data }, function (cookielist) {
					chrome.storage.local.set({ "starting_cookies":cookielist });
				});
			});
		} else {
			writeEvent(request.type, request.data);
		}
	}
);

chrome.webRequest.onErrorOccurred.addListener( function(details) {
	writeEvent(ERRORGET,details);
}, {urls: ["<all_urls>"]});

chrome.cookies.onChanged.addListener(function (changeInfo) {
	chrome.storage.local.get(["recording","options"], function (storage) {
		if (storage.recording != "recording" || !storage.options.cookies)
			return;
		
		writeEvent({ "type":COOKIE, "data":changeInfo });
	});
});
