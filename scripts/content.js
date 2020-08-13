"use strict";

// FUNCTIONS

function isClickable(element) {
	return (getComputedStyle(element).cursor == "pointer" || element.getAttribute("role") == "button" ||
		element.href != undefined || element.tagName == "button");
}

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

	chrome.runtime.sendMessage({ "type":CLICK, "data":data });
}, true);

// CODE

var cookieurl;
cookieurl = window.location.href.split(":")[0];
cookieurl += "://" + document.domain;

chrome.runtime.sendMessage({ "type":COOKIESTART , "data":cookieurl });