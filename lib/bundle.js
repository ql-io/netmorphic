var domready = require('domready')
  , xhr = new XMLHttpRequest()
  ;

domready(function(){
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
		try{
			var j = JSON.stringify(json);
			trx.open('GET', '../setconfig?config=' + encodeURI(j), true)
			trx.send()
		}
		catch(e){
			alert('JSON error')
		}
	}
})
