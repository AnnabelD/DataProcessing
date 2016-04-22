/* Annabel Droste */
/* load data from json file using d3*/

var data = d3.json("output.json", function(error, data){
	console.log(data);
});

