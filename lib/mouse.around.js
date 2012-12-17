module.exports = function(node, fn){
		
	node.addEventListener('mouseover', onHover, true)
	node.addEventListener('mouseout', onExit, true)
	
	var node = node;
	var position = [0, 0];
	
	function mouseMove(evt){
		fn(evt, node, position, false, false)
	}
	
	function onExit(evt){
		window.removeEventListener('mousemove', mouseMove, true)
		fn(evt, node, position, false, true)
	}
	
	function onHover(evt){
		window.addEventListener('mousemove', mouseMove, true)
		position = findPos(evt.target);

		fn(evt, node, position, true, false)

		function findPos(obj) {
				var curleft = curtop = 0;
				if (obj.offsetParent) {
					do {
								curleft += obj.offsetLeft;
								curtop += obj.offsetTop;
							} 
					while (obj = obj.offsetParent);
					return [curleft,curtop];
				};
			};
	};
	
}