
var script = document.createElement("script");
script.innerHTML = 
    assignConsole.toString().replace("writeLog","writeLogForPage") + "\n" +
    writeLogForPage.toString() + "\n" +
    writeErrorForPage.toString() + 
    "\nassignConsole(); window.addEventListener('error',writeErrorForPage); \n" +
    "\nconsole.log(window.location.href); ";
document.getElementsByTagName("html")[0].appendChild(script);

function writeLogForPage(consolearguments, type) {
	setTimeout(function() {window.postMessage({ "type": type, "msg": consolearguments } ,"*") }, 1000);
}

function writeErrorForPage(e) {
	setTimeout(function() {window.postMessage({ "type":"error", "msg": e.message , "filename": e.filename , "line": e.lineno , "column": e.colno , "object": e.error } , "*")}, 1000);
	return false;
};

function assignConsole() {
    console.defaultLog = console.log.bind(console);
    console.log = function(consolearguments){
    	writeLog(consolearguments,"log");
        console.defaultLog.apply(console, [consolearguments]);
    }
    console.defaultError = console.error.bind(console);
    console.error = function(consolearguments){
    	writeLog(consolearguments,"error");
        console.defaultError.apply(console, [consolearguments]);
    }
    console.defaultWarn = console.warn.bind(console);
    console.warn = function(consolearguments){
    	writeLog(consolearguments,"warn");
        console.defaultWarn.apply(console, [consolearguments]);
    }
    console.defaultDebug = console.debug.bind(console);
    console.debug = function(consolearguments){
        writeLog(consolearguments,"debug");
        console.defaultDebug.apply(console, [consolearguments]);
    }
}