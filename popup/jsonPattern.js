"use-strict";

var frame = document.getElementById('json');

function changeFontSize() {
	var body = frame.contentWindow.document.querySelector('body');
	var pre = frame.contentWindow.document.querySelector('pre');
	body.style.fontSize = '100%';
	body.style.overflowX = "auto";
	pre.style.whiteSpace = "pre";
}

if (window.readyState == "complete")
	changeFontSize();
else
	window.addEventListener("load",changeFontSize);