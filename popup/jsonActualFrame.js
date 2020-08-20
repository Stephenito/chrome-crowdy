"use-strict";

var arrays = document.querySelectorAll("#list pre");

function deleteAllChar(str,char) {
	let oldstr = str;
	let newstr = str.replace(".","");
	while (oldstr != newstr) {
		oldstr = newstr;
		newstr = newstr.replace(".","");
	}
	return newstr;
}

function getPrePiece(obj,array) {
	return "<span type=" + obj.type + " style='display:" + ((array != "extensions") ? (window.parent.document.getElementById(obj.type).value) : "block") +  ";'>" + JSON.stringify(obj,null,2) + "<hr></span>";
	//return "<span type=" + obj.type + ((obj.domain != undefined) ? (" domain=" + deleteAllChar(obj.domain,".")) : " ") + " style='display:block;'>" + JSON.stringify(obj,null,2) + "<hr></span>";
}

function update(changes, namespace) {
	for (let key in changes)  {
		arrays.forEach( pre => {
			if (key.startsWith(pre.id)) {
				if (changes[key].newValue) 
					pre.innerHTML += getPrePiece(changes[key].newValue, pre.id);
				else if (changes[key].oldValue)
					pre.innerHTML = "";
				else
					pre.innerHTML += getPrePiece(changes[key], pre.id);
			}
		});
	};
}

chrome.storage.onChanged.addListener(update);
chrome.storage.local.get(null, function(storage) {
	update(storage,null);
});