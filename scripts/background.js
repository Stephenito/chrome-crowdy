"use strict";

storageInit();

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		writeEvent(request.type, request.data);
	}
);

chrome.webRequest.onErrorOccurred.addListener( function(details) {
	writeEvent(ERRORGET,details);
}, {urls: ["<all_urls>"]});