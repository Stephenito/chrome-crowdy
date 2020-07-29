"use strict";

// APPEND SCRIPT BEFORE HEAD
var script = document.createElement("script");

script.innerHTML = codeToInject + "\ncodeToInject(); \n";
document.getElementsByTagName("html")[0].appendChild(script);

function codeToInject() {
	// SEND DATA OF THE CONSOLE TO CONTENT.JS
	function writeLogForPage(consolearguments, type) {
		setTimeout(function() {window.postMessage({ "type":"log", "ext":"chrome-crowdy", "data": {"type": type, "msg": consolearguments } } ,"*") }, 1000);
	}

	function writeErrorForPage(e) {
		let obj = {
			"message": e.message,
			"filename": e.filename,
			"lineno": e.lineno,
			"colno": e.colno,
			"error": e.error
		}
		setTimeout(function() {window.postMessage({ "type":"error", "ext":"chrome-crowdy", "data":obj } , "*")}, 1000);
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
	    console.warn = function(consolearguments){
	    	writeLogForPage(consolearguments,"c_warn");
	        console.defaultWarn.apply(console, [consolearguments]);
	    }
	    console.defaultDebug = console.debug.bind(console);
	    console.debug = function(consolearguments){
	        writeLogForPage(consolearguments,"c_debug");
	        console.defaultDebug.apply(console, [consolearguments]);
	    }
	}

	assignConsole();
	window.addEventListener('error',writeErrorForPage);
	console.log(window.location.href);
}

