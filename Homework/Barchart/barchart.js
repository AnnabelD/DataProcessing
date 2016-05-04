/* Annabel Droste */

// Het lukt nog niet om de assen mooi te krijgen. De x-as wil niet aan de onderkant. Ik vermoed dat er iets fout zit bij de transformatie

var margin = {top: 20, right: 10, bottom: 20, left: 40}
	var barwidth = 30;
	var height = 400;
	
	var y = d3.scale.linear()
    	.range([height, 0]);

// load data en maak barchart
var data = d3.json("output.json", function(error, data){
	for (var i = 0; i < data.length; i++){
		data[i][" temperature"] = parseInt(data[i][" temperature"]) / 10;
	}

	var chart = d3.select(".barchart1")
    	.attr("width", barwidth * data.length + margin.right + margin.left)
    	.attr("height", height + margin.bottom + margin.top)
    	.append("g")
    	.attr("transform", "translate(" + margin.left + "," +  margin.top + ")");

    y.domain([0, d3.max(data, function(d) { 
    	return d[" temperature"];})
    ]);

    // de waarde verschijnt als je boven een kolom hovert
    var tip = d3.tip()
    	.attr('class', 'tip')
    	.html(function(d){
			return '<span>' + d[" temperature"] + '</span>';
		});

	chart.call(tip);

	// creating the bars
	var bar = chart.selectAll("g")
		.data(data)
		.enter().append("g")
		// Zorg ervoor dat de volgende bar op de volgende x-waarde komt te staan
		.attr("transform", function(d, i) { 
			return "translate(" + i * barwidth + ",0)"; 
		});

	bar.append("rect")
    	.attr("y", function(d) { 
    		return y(d[" temperature"]); 
    	})
    	.attr("height", function(d) { 
    		return height - y(d[" temperature"]); 
    	})
    	// zet breedte van bar, "-3" geeft breedte tussen bars
    	.attr("width", barwidth - 3)

    	// interactie-element
    	.on("mouseover", function(d){
    		d3.select(this).style("fill", "red")
    		tip.show(d);
    	})
    	.on("mouseout", function(d, i) {
    		d3.select(this).style("fill", "blue")
    		tip.hide(d);
    	});
         
    // creëren van de assen
    var y_axis = d3.svg.axis()
    	.scale(y)
    	.orient("left");

    chart.append("g")
    	.attr("class", "y_axis")
    	.call(y_axis)
  		.append("text")
    	.attr("transform", "rotate(-90)")
    	.attr("y", -35)
    	.attr("dy", ".71em")
    	.style("text-anchor", "end")
    	.text("Temperatuur (C)");

    var x = d3.scale.ordinal()
    	.rangeRoundBands([0, barwidth * data.length]);
    	
    x.domain(data.map(function(d){
    	return d.day.substr(8);
    }));

    var x_axis = d3.svg.axis()
    	.scale(x)
    	// onderstaande werkt om de een of andere reden niet. Waarschijnlijk iets fout gedaan bij de transformation
    	.orient("bottom");

    chart.append("g")
    	.attr("class", "x_axis")
    	.call(x_axis)
    	.append("text")
    	.attr("x", 600)
    	// .style("text-anchor", "end")
    	.text("Dag in maart");
});





