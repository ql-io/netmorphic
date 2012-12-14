var domready = require('domready')
  , xhr = new XMLHttpRequest()
  ;

domready(function(){
	// create the editor
    var container = document.getElementById("jsoneditor");
    var save = document.getElementById("save");

    var editor = new JSONEditor(container);
    xhr.open('GET', '../getConfig', true);
    xhr.onload = function(e){
		editor.set(JSON.parse(xhr.responseText));
	};
	xhr.send();
	save.onclick = function(){
		var json = editor.get();
		var trx = new XMLHttpRequest();
		trx.open('GET', '../setconfig?config=' + encodeURI(JSON.stringify(json)), true)
		trx.send()
	}
    // save json
    function save() {
		
		
    }
})
