var cm = null;

// add tabs
var tabs = new Tabs()
//tabs.addTab(new Tab(2)).addTab(new Tab(3)).addTab(new Tab(4))

function compressJson(compress) {
	try {
		var jsonVal = cm.getValue();
		var result = jsl.parser.parse(jsonVal);
		if (compress) {
			cm.setValue(JSON.stringify(JSON.parse(jsonVal), null, ""));
		} else {
			cm.setValue(JSON.stringify(JSON.parse(jsonVal), null, "\t"));
		}
	} catch (parseException) {
		alert("Invalid JSON!");
	}
}

document.addEventListener("DOMContentLoaded", function(event) {

	cm = CodeMirror.fromTextArea(document.getElementById('json_input'), {
		lineNumbers: true,
		//mode: "javascript",
		//mode: "application/ld+json",
		mode: "application/json",
		theme: "blackboard",
		matchBrackets: true,
		extraKeys: {
			"Ctrl-Q": function(cm) { cm.foldCode(cm.getCursor()); },
			"Alt-F": "findPersistent"
		},
		foldGutter: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
	});

	var elTabsWrapper = document.getElementById('tab-wrapper')
	var tabsView = new TabsView(tabs, elTabsWrapper, cm)
	tabsView.render()

	// Add a listener for changes in the editor
	cm.on("change", function(cm, changeObj) {
		var currentContent = cm.getValue();
		tabsView.onChange(currentContent)
	});

	// Add a listener for gutter clicks (on code folding expand / contract)
	cm.on('gutterClick', function(cm, line, gutter, event) {
		if (gutter === "CodeMirror-foldgutter") {
			tabsView.onFoldChange(line)
		}
	});

	document.getElementById("compress").addEventListener("click", function () {
    compressJson(true);
  });

	document.getElementById("decompress").addEventListener("click", function () {
    compressJson(false);
  });
});


// Header hover

document.getElementById('head').addEventListener('mouseover', function () {
	document.getElementById('buttons').classList.add('active');
});
document.getElementById('head').addEventListener('mouseout', function () {
	document.getElementById('buttons').classList.remove('active');
});


// Modal

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("help");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
	modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}