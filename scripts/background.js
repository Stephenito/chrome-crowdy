"use strict";

storageInit();

chrome.webRequest.onErrorOccurred.addListener( function(details) {
	writeEvent(ERRORGET,details);
}, {urls: ["<all_urls>"]});