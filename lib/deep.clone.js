module.exports = deepClone

function deepClone(el){
	
	var node = el.cloneNode();
	
	Array.prototype.slice.call(el.childNodes).forEach(function(child){
	  node.appendChild(deepClone(child))	
	});
	
	return node
	
}