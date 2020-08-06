"use strict";

// LISTEN TO INJECTED INTERRUPTS
window.addEventListener("message", function(event) {
	if (event.source != window)
		return;

	if (event.data.ext == "chrome-crowdy")
		chrome.runtime.sendMessage({ "type":(event.data.type == "log") ? CONSOLE : ERROR, "data":event.data.data });
}, false);

// APPEND SCRIPT BEFORE HEAD
var script = document.createElement("script");

script.innerHTML = codeToInject + "\ncodeToInject(); \n";
document.getElementsByTagName("html")[0].appendChild(script);

function codeToInject() {

	// SEND DATA OF THE CONSOLE TO CONTENT.JS
	function writeLogForPage(consolearguments, type) {
		window.postMessage({ "type":"log", "ext":"chrome-crowdy", "data": {"type": type, "msg": consolearguments } } ,"*");
	}

	function writeErrorForPage(e) {
		let obj = {
			"message": "" + e.message,
			"filename": "" + e.filename,
			"lineno": e.lineno,
			"colno": e.colno,
			"error": "" + e.error
		}
		window.postMessage({ "type":"error", "ext":"chrome-crowdy", "data":obj } , "*");
		return false;
	};

	// INIT CONSOLE
	function assignConsole() {
	    console.defaultLog = console.log.bind(console);
	    console.log = function(consolearguments){
	    	writeLogForPage(consolearguments,"c_log");
	        console.defaultLog.apply(console, [consolearguments]);
	    }
	    console.defaultError = console.error.bind(console);
	    console.error = function(consolearguments){
	    	writeLogForPage(consolearguments,"c_error");
	        console.defaultError.apply(console, [consolearguments]);
	    }
	    console.defaultWarn = console.warn.bind(console);
	    console.warn = function(consolearguments) {
	    	writeLogForPage(consolearguments,"c_warn");
	        console.defaultWarn.apply(console, [consolearguments]);
	    }
	    console.defaultDebug = console.debug.bind(console);
	    console.debug = function(consolearguments) {
	        writeLogForPage(consolearguments,"c_debug");
	        console.defaultDebug.apply(console, [consolearguments]);
	    }
	}

	assignConsole();
	window.addEventListener('error',writeErrorForPage);
	console.log(window.location.href);
}

