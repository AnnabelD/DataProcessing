/* Annabel Droste */
/* use this to test out your function */
window.onload = function() {
 	changeColor(gb, "#00ff00");
 	changeColor(gre, "#00dd80");
 	changeColor(nor, "ff0011");
 	changeColor(sk, "ffff00");
}

/* changeColor takes a path ID and a color (hex value)
   and changes that path's fill color */
function changeColor(id, color) {
	id.style.fill = color;
        
}