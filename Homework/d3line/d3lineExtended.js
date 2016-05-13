/* Annabel Droste */

var margin = {top: 20, right: 20, left: 45, bottom: 30},
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

var lineGemiddeld = d3.svg.line()
	.x(function(d){return x(d.datum)})
	.y(function(d){return y(d.Gemiddeld)});
		
var lineMax = d3.svg.line()
	.x(function(d){return x(d.datum)})
	.y(function(d){return y(d.Maximum)});

var lineMin = d3.svg.line()
	.x(function(d){return x(d.datum)})
	.y(function(d){return y(d.Minimum)});

var linechart;
	
d3_queue.queue()
	.defer(d3.json,"dataTexel2014.json")
	.defer(d3.json,"dataBilt2014.json")
	.await(start);

function start(error, Texel2014, Bilt2014){
	if (error){
		return console.log(error);
	}
	
	// minima en maxima van de verschillende jaren en plaatsen (T = Texel, B = Bilt)
	var minT14 = d3.min(Texel2014, function(d){type(d); return d.Minimum;});
	var minB14 = d3.min(Bilt2014, function(d){type(d); return d.Minimum;});
	var maxT14 = d3.max(Texel2014, function(d){return d.Maximum;});
	var maxB14 = d3.max(Bilt2014, function(d){ return d.Maximum;});
	
	minTemp = d3.min([minT14, minB14]);
	maxTemp = d3.max([maxT14, maxB14]);
	y.domain([minTemp, maxTemp]);
	x.domain(d3.extent(Texel2014, function(d){return d.datum;}));
	
	linechart = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	// x-as
	linechart.append("g")
		.attr("class", "x_axis")
		.attr("transform", "translate(0," + height + ")")
		.call(x_axis);
		
	// y-as
	linechart.append("g")
		.attr("class", "y_axis")
		.call(y_axis)
		.append("text")
		.attr("transform", "rotate(-90)")
    	.attr("y", -35)
    	.attr("dy", ".30em")
    	.style("text-anchor", "end")
		.text("Temperatuur (in graden)");
	
	var Texel = document.getElementById("Texel");
	Texel.addEventListener("click", function(){linechart.selectAll(".line").remove(); draw(Texel2014);});
	var Bilt = document.getElementById("De Bilt");
	Bilt.addEventListener("click", function(){linechart.selectAll(".line").remove(); draw(Bilt2014);});
};

function draw(data){	
		
	linechart.append("path")
		.attr("class", "line")
		.attr("d", function(d){ return lineGemiddeld(data);})
		.style("stroke", "green");
		
	linechart.append("path")
		.attr("class", "line")
		.attr("d", function(d){return lineMax(data);})
		.style("stroke", "red");
	
	linechart.append("path")
		.attr("class", "line")
		.attr("d", function(d){return lineMin(data);})
		.style("stroke", "blue");
		
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
	
	// append space for text element
	interactive.append("text")
		.attr("class", "y1")
		.attr("dy", "-1em");
	
	interactive.append("text")
		.attr("class", "y3")
		.attr("dy", "0em");
	
	linechart.append("rect")
		.attr("width", width)                             
        .attr("height", height)                            
        .style("fill", "none")                             
        .style("pointer-events", "all")                    
        .on("mouseover", function() { interactive.style("display", null); })
        .on("mouseout", function() { interactive.style("display", "none"); })
        .on("mousemove", mousemove);  
		
	function mousemove(){
		var x0 = x.invert(d3.mouse(this)[0]),              
            i = bisectDate(data, x0, 1),                   
            d0 = data[i - 1],                              
            d1 = data[i],                                  
            d = x0 - d0.datum > d1.datum - x0 ? d1 : d0;
		
		interactive.select("text.y1")
		    .attr("transform",
		          "translate(" + x(d.datum) + "," +
		                         y(d.Gemiddeld) + ")")
		    .text("Gemiddelde Temperatuur:  " + d.Gemiddeld);

		interactive.select("text.y3")
		    .attr("transform",
		          "translate(" + x(d.datum) + "," +
		                         y(d.Gemiddeld) + ")")
		    .text("Datum: " + formatnew(d.datum));

		interactive.select(".x")
		    .attr("transform",
		          "translate(" + x(d.datum) + "," +
		                         y(d.Gemiddeld) + ")")
		               .attr("y2", height - y(d.Gemiddeld));

		interactive.select(".y")
		    .attr("transform",
		          "translate(" + width * -1 + "," +
		                         y(d.Gemiddeld) + ")")
		               .attr("x2", width + width);	
	};
};

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
