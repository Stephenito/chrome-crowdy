"use-strict";

var arrays = document.querySelectorAll("#list pre");

function update(changes, namespace) {
	for (let key in changes)  {
		arrays.forEach( pre => {
			if (key.startsWith(pre.id)) {
				if (changes[key].newValue) 
					pre.innerHTML += JSON.stringify(changes[key].newValue,null,2) + "\n";
				else if (changes[key].oldValue)
					pre.innerHTML = "";
				else
					pre.innerHTML += JSON.stringify(changes[key],null,2) + "\n";
			}
		});
	};
}

chrome.storage.onChanged.addListener(update);
chrome.storage.local.get(null, function(storage) {
	update(storage,null);
});