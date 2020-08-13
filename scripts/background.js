"use strict";

storageInit();

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type == COOKIESTART) {
			chrome.cookies.getAll({ url:request.data }, function (cookielist) {
				writeInitial(request.type, cookielist, request.data);
			});
		}
		else if (request.type == LOCALSTART || request.type == SESSIONSTART)
			writeInitial(request.type, request.data, request.domain);
		else
			writeEvent(request.type, request.data);
	}
);

chrome.webRequest.onErrorOccurred.addListener(function(details) {
	writeEvent(ERRORGET,details);
}, {urls: ["<all_urls>"]});

chrome.cookies.onChanged.addListener(function (changeInfo) {
	writeEvent(COOKIE,changeInfo);
});
