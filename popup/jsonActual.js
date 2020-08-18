"use-strict";

var buttons = document.getElementById("buttonsContainer");
var iframe = document.getElementById("json");

OPTIONS.forEach( opt => {
	if (opt != EXTENSIONS) {
		let button = document.createElement("button");
		button.id = opt;
		button.value = "block";
		button.classList.add("selection_button");
		button.innerHTML = opt;
		button.onclick = optionListener;
		buttons.appendChild(button);
	}
});
buttons.appendChild(document.createElement("br"));
ARRAYS.forEach( arr => {
	let button = document.createElement("button");
	button.id = arr;
	button.value = "block";
	button.classList.add("selection_button");
	button.innerHTML = arr;
	button.onclick = arrayListener;
	buttons.appendChild(button);
});
buttons.appendChild(document.createElement("br"));

function optionListener(event) {
	let spans = iframe.contentWindow.document.querySelectorAll("#list span[type=" + event.target.id + "]");
	toggleValue(event.target);

	spans.forEach( span => { span.style.display = event.target.value; } );
}

function arrayListener(event) {
	let pre = iframe.contentWindow.document.getElementById(event.target.id);
	toggleValue(event.target);
	
	pre.style.display = event.target.value;
}

function toggleValue(item) {
	if (item.value == "none") {
		item.value = "block";
		item.style.backgroundColor = 'lemonchiffon';
	} else {
		item.value = "none";
		item.style.backgroundColor = 'lightgrey';
	}
}