"use-strict";

debugger;

var frame = document.getElementById('json');

function changeFontSize() {
	debugger;
	var body = frame.contentWindow.document.querySelector('body');
	body.style.fontSize = '100%';
}

if (window.readyState == "complete")
	changeFontSize();
else
	window.addEventListener("load",changeFontSize);