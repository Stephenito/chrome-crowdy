"use strict";

tryInject(injectJS);

function injectJS () {
	// ASK FOR COOKIES

	var cookieurl = window.location.href.split(":")[0] + "://" + document.domain;
	chrome.runtime.sendMessage({ "type":COOKIESTART , "data":cookieurl });


	// ASK FOR INITIAL LOCAL STORAGE

	let local = {};
	for (let i = 0; i < localStorage.length; i++)
		local[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
	chrome.runtime.sendMessage({ "type":LOCALSTART, "data":local, "domain":document.domain });


	// LISTEN TO INJECTED INTERRUPTS

	window.addEventListener("message", function(event) {
		if (event.source != window)
			return;

		if (event.data.ext == "chrome-crowdy")
			chrome.runtime.sendMessage({ "type":event.data.type, "data":event.data.data, "domain":event.data.domain });
	}, false);


	// APPEND IFRAME  FOR STORAGE EVENTS

	var iframe = document.createElement("iframe");
	iframe.setAttribute('id', 'crowdy-frame');
	iframe.style.display = "none";
	document.getElementsByTagName("html")[0].appendChild(iframe);
	iframe.contentWindow.addEventListener('storage', function(e) {
		window.parent.window.postMessage({ "type":"storage", "ext":"chrome-crowdy", "data": {"url": e.url, "key": e.key, "oldValue": e.oldValue, "newValue": e.newValue } } ,"*");
	});


	// APPEND SCRIPT FOR CONSOLE AND ERROR EVENTS

	var script = document.createElement("script");
	script.innerHTML = consoleAndErrorInjection + "\consoleAndErrorInjection(); \n";
	document.getElementsByTagName("html")[0].appendChild(script);
}

function consoleAndErrorInjection() {

	// SEND DATA OF THE CONSOLE TO CONTENT.JS
	function writeLogForPage(consolearguments, type) {
		window.postMessage({ "type":"console", "ext":"chrome-crowdy", "data": {"type": type, "msg": consolearguments } } ,"*");
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
	console.log("CICCIO");
}

