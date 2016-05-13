/* Annabel Droste */

var margin = {top: 20, right: 20, left: 45, bottom: 25},
	width = 1000 - margin.left - margin.right,
	height = 300 - margin.top - margin.bottom;

var format = d3.time.format("%Y%m%d")
	formatnew = d3.time.format("%d-%m")
	bisectDate = d3.bisector(function(d) { return d.datum; }).left;;

var x = d3.time.scale()
	.range([0, width]);

var y = d3.scale.linear()
	.range([height, 0]);

var x_axis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.tickFormat(d3.time.format("%b"));

var y_axis = d3.svg.axis()
	.scale(y)
	.orient("left");

var Texel2014 = d3.json("dataTexel2014.json", function(error, Texel2014){
	if (error){
		return console.log(error);
	}

	y.domain([d3.min(Texel2014, function(d){type(d); return d.Minimum;}), d3.max(Texel2014, function(d){return d.Maximum;})]);
	x.domain(d3.extent(Texel2014, function(d){return d.datum;}));

	var linechart = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var lineGemiddeld = d3.svg.line()
		.x(function(d){return x(d.datum)})
		.y(function(d){return y(d.Gemiddeld)})
	
	linechart.selectAll("g")
		.data(Texel2014)
		.enter().append("g")
		.append("path")
		.attr("class", "line")
		.attr("d", function(d){ return lineGemiddeld(Texel2014);})
		.style("stroke", "blue")
		.style("fill", "none");
	
	// x-as
	linechart.append("g")
		.attr("class", "x_axis")
		.attr("transform", "translate(0," + height + ")")
		.style("fill", "none")
		.style("stroke","black")
		.call(x_axis)
	
	// y-as
	linechart.append("g")
		.attr("class", "y_axis")
		.style("fill", "none")
		.style("stroke","black")
		.call(y_axis)
		.append("text")
		.attr("transform", "rotate(-90)")
    	.attr("y", -35)
    	.attr("dy", ".30em")
    	.style("text-anchor", "end")
		.text("Gemiddelde Temperatuur");
	
	// creëer interactief element
	var interactive = linechart.append("g")
		.style("display", "none");
	
	// append the vertical line
    interactive.append("line")
        .attr("class", "x")
        .attr("y1", 0)
        .attr("y2", height);

    // append the horizontal line
    interactive.append("line")
        .attr("class", "y")
        .attr("x1", width)
        .attr("x2", width);
	
	// append space for text element temperatuur
	interactive.append("text")
		.attr("class", "y1")
		.attr("dx", "-2em")
		.attr("dy", "-4em");
	
	// append space for text element datum
	interactive.append("text")
		.attr("class", "y3")
		.attr("dx", "-2em")
		.attr("dy", "-3em");
	
	// detecteer mousemovements en maar crosshair
	linechart.append("rect")
		.attr("width", width)                             
        .attr("height", height)                            
        .style("fill", "none")                             
        .style("pointer-events", "all")                    
        .on("mouseover", function() { interactive.style("display", null); })
        .on("mouseout", function() { interactive.style("display", "none"); })
        .on("mousemove", mousemove);  
	
	// teken crosshair
	function mousemove(){
		var x0 = x.invert(d3.mouse(this)[0]),              
            i = bisectDate(Texel2014, x0, 1),                   
            d0 = Texel2014[i - 1],                              
            d1 = Texel2014[i],                                  
            d = x0 - d0.datum > d1.datum - x0 ? d1 : d0;
		
		// temperatuur popup
		interactive.select("text.y1")
		    .attr("transform",
		          "translate(" + x(d.datum) + "," +
		                         y(d.Gemiddeld) + ")")
		    .text("Gemiddelde Temperatuur:  " + d.Gemiddeld);
		
		// datum popup
		interactive.select("text.y3")
		    .attr("transform",
		          "translate(" + x(d.datum) + "," +
		                         y(d.Gemiddeld) + ")")
		    .text("Datum: " + formatnew(d.datum));
		
		// verticale lijn crosshair
		interactive.select(".x")
		    .attr("transform",
		          "translate(" + x(d.datum) + "," +
		                         y(d.Gemiddeld) + ")")
				.attr("y2", height - y(d.Gemiddeld));
								 
		
		// horizontale lijn crosshair
		interactive.select(".y")
		    .attr("transform",
		          "translate(" + width * -1 + "," +
		                         y(d.Gemiddeld) + ")")
		               .attr("x2", width + width);	
	};
});

// zorgt ervoor dat alle waardes het juiste type krijgen
function type(d){
	d.Gemiddeld = parseInt(d.Gemiddeld) / 10;
	d.Minimum = parseInt(d.Minimum) / 10;
	d.Maximum = parseInt(d.Maximum) / 10;
	d.datum = format.parse(d.datum);
	if (d.plaats == 235){
		d.plaats = "Texel";
	}
	else{
		d.plaats = "De Bilt";
	}
	return d;
};
