// Annabel Droste

// barchart and scatterplot
var margin = {top: 20, right: 10, bottom: 50, left: 50};
var barwidth = 100;
var height = 400 - margin.top - margin.bottom;
var width = 400 - margin.right - margin.left;

// barchart 
var y = d3.scale.linear()
	.range([height, 0]);

var y_axis = d3.svg.axis()
	.scale(y)
	.orient("left");

var x = d3.scale.ordinal()
	.domain(["well-being", "footprint", " well-being", " footprint"])
	.rangeRoundBands([0, barwidth * 4]);
    	
var x_axis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

var tip = d3.tip()
	.attr('class', 'tip')
	.html(function(d){
		return '<span>' + d.toFixed(1) + '</span>';
	});

// scatterplot
var y_scatter = d3.scale.linear()
	.range([height, 0]);

var y_axis_scatter = d3.svg.axis()
	.scale(y_scatter)
	.orient("left");

var x_scatter = d3.scale.linear()
	.range([0,width]);

var x_axis_scatter = d3.svg.axis()
	.scale(x_scatter)
	.orient("bottom");

var tooltip = d3.tip()
	.attr('class', 'tip')
	.html(function(d){
		return '<span>'+ d.name + '</span';
	});

window.onload = function(){
	var data_format = {}
	var data = d3.json("datalinkedviews.json", function(error,data){
		if (error){
			alert("Loading of data went wrong!");
		}
		data.forEach(function(d){
			d.population = +d.population;
			d.footprint = +d.footprint;
			d["well-being"] = +d["well-being"];
			country_codes.forEach(function(i){
				var index = i.indexOf(d.Country);
				if (index != -1){
					d.name = d.Country;
					d.Country = i[1];
					data_format[d.Country] = {fillKey: key(d.population),
					"name": d.name,
					"population": d.population,
					"well-being": d["well-being"],
					"footprint": d.footprint
					};
				}
			});
		});
		
		// create basis of chart and the avg world data
		var chart = d3.select(".barchart1")
			.attr("width", barwidth * 4 + margin.right + margin.left)
			.attr("height", height + margin.bottom + margin.top)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," +  margin.top + ")");
		
		var avg_well = d3.mean(data, function(d){ return d["well-being"];});
		
		var avg_foot = d3.mean(data, function(d,i){ return d["footprint"];});

		var chartdata = [avg_well, avg_foot];	
		
		// create scatterplot
		var scatter = d3.select(".scatterplot")
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.bottom + margin.top)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," +  margin.top + ")");
		
		// create and color the map 
		var map = new Datamap({element: document.getElementById('map'),
			fills : {'< 1 million': '#f1eef6',
				'< 10 million': '#bdc9e1',
	            '< 100 million': '#74a9cf',
	            '< 1 billion': '#2b8cbe',
	            '< 1.5 billion': '#045a8d',
				'no data': 'grey',
	            defaultFill: 'grey'}, 
	        data : data_format,
	        geographyConfig: {
	        	highlightFillColor:	'#7ddc1f',
	        	popupTemplate: function(geo, data) {
                // tooltip
				if (!data) { return[ '<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br><strong>', "No data", '</strong>',
                    '</div>'].join('');; }
                return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>Population size: <strong>', data.population, '</strong>',
                    '</div>'].join('');
	        	}
	        },
			done: function(map){
				map.svg.selectAll('.datamaps-subunit').on('click', function(geo, data) {
					if (!data_format[geo.id]){
						alert("No data available for " + geo.properties.name);
					}
					else{
						chartdata.push(data_format[geo.id]["well-being"], data_format[geo.id]["footprint"]);
						drawBarchart(chart, chartdata, geo.properties.name);
						chartdata.length = 2;
					};
				})
			}
		});
		map.legend();
		drawBarchart(chart, chartdata, "no country selected");
		drawScatter(scatter, data, chartdata, chart);
	});
};

/* A function that draws the barchart, the chartdata is an array that holds 
the world average and the well-being and footprint of a clicked country. */
function drawBarchart(chart, chartdata, name){
	chart.selectAll("g").remove();
	chart.selectAll(".axis").remove();
	y.domain([0, d3.max(chartdata) + 0.5]);
	chart.call(tip);

	var bar = chart.selectAll("g")
		.data(chartdata)
		.attr("class", "bars")
		.enter().append("g")
		.attr("transform", function(d, i) { 
			return "translate(" + i * barwidth + ",0)"; 
		});

	bar.append("rect")
    	.attr("y", function(d) { 
    		return y(d); 
    	})
    	.attr("height", function(d) { 
    		return height - y(d); 
    	})
    	.attr("width", barwidth - 40)

     	.on("mouseover", function(d){
    		d3.select(this).style("fill", "#7ddc1f")
    		tip.show(d);
    	})
    	.on("mouseout", function(d) {
    		d3.select(this).style("fill", "blue")
    		tip.hide(d);
    	});
		
    // creëren van de assen
    chart.append("g")
    	.attr("class", "y axis")
    	.call(y_axis)
  		.append("text")
    	.attr("transform", "rotate(-90)")
    	.attr("y", -35)
    	.attr("dy", ".1em")
    	.style("text-anchor", "end")
    	.text("well-being and footprint");
	
	// second x- axis
	var x_country = d3.scale.ordinal()
		.domain(["world", name])
		.rangeRoundBands([0, barwidth * 4]);

	var x_axis1 = d3.svg.axis()
		.scale(x_country)
		.orient("bottom");

    chart.append("g")
    	.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
    	.call(x_axis);	
	
	chart.append("g")
    	.attr("class", "x axis1")
		.attr("transform", "translate(0," + (height + 25) + ")")
    	.call(x_axis1);
}

/* A function that draws the scatterplot. chartdata and chart are used as well to be able to call drawBarchart if a scatterpoint is clicked. */
function drawScatter(scatter, data, chartdata, chart){
	x_scatter.domain([d3.min(data, function(d){return d.footprint})-0.5, d3.max(data, function(d){return d.footprint})+0.5]);
	y_scatter.domain([d3.min(data, function(d){return d["well-being"]})-0.5, d3.max(data, function(d){return d["well-being"]})+0.5]);
	scatter.call(tooltip);
	
	// x-axis
	scatter.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(x_axis_scatter)
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", 40)
		.style("text-anchor", "end")
		.text("Ecological footprint");

	// y-axis
	scatter.append("g")
		.attr("class", "y axis")
		.call(y_axis_scatter)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", -35)
		.attr("dy", ".1em")
		.style("text-anchor", "end")
		.text("well-being");

	// draw dots
	scatter.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 3)
		.attr("cx", function(d){return x_scatter(d.footprint)})
		.attr("cy",  function(d){return y_scatter(d["well-being"])})
		.style("fill", "blue")
		.on("mouseover", function(d){
    		d3.select(this).style("fill", "#7ddc1f")
    		tooltip.show(d);
    	})
    	.on("mouseout", function(d) {
    		d3.select(this).style("fill", "blue")
    		tooltip.hide(d);
    	})
		.on('click', function(d) {
			chartdata.push(d["well-being"], d["footprint"]);
			drawBarchart(chart, chartdata, d.name);
			chartdata.length = 2;
		});
}

/* Colors the countries based on the size of the population. */
function key(size){
	var scale = [0, 1000000, 10000000, 100000000, 1000000000, 1500000000];
	var colors = ['< 1 million','< 10 million','< 100 million','< 1 billion','< 1.5 billion'];

	for (var h = 1, len = scale.length; h < len; h++){
		if (size >= scale[h - 1] && size < scale[h]){
			return colors[h - 1];
		}
	}
}

/* list Author: Robin Kuiper, 
 adjusted to the country names of the data
 Date: 27 03 2014 */
var country_codes = [
    ["af", "AFG", "Afghanistan"],
    ["ax", "ALA", "Åland Islands"],
    ["al", "ALB", "Albania"],
    ["dz", "DZA", "Algeria"],
    ["as", "ASM", "American Samoa"],
    ["ad", "AND", "Andorra"],
    ["ao", "AGO", "Angola"],
    ["ai", "AIA", "Anguilla"],
    ["aq", "ATA", "Antarctica"],
    ["ag", "ATG", "Antigua and Barbuda"],
    ["ar", "ARG", "Argentina"],
    ["am", "ARM", "Armenia"],
    ["aw", "ABW", "Aruba"],
    ["au", "AUS", "Australia"],
    ["at", "AUT", "Austria"],
    ["az", "AZE", "Azerbaijan"],
    ["bs", "BHS", "Bahamas"],
    ["bh", "BHR", "Bahrain"],
    ["bd", "BGD", "Bangladesh"],
    ["bb", "BRB", "Barbados"],
    ["by", "BLR", "Belarus"],
    ["be", "BEL", "Belgium"],
    ["bz", "BLZ", "Belize"],
    ["bj", "BEN", "Benin"],
    ["bm", "BMU", "Bermuda"],
    ["bt", "BTN", "Bhutan"],
    ["bo", "BOL", "Bolivia"],
    ["bq", "BES", "Bonaire, Sint Eustatius and Saba"],
    ["ba", "BIH", "Bosnia and Herzegovina"],
    ["bw", "BWA", "Botswana"],
    ["bv", "BVT", "Bouvet Island"],
    ["br", "BRA", "Brazil"],
    ["io", "IOT", "British Indian Ocean Territory"],
    ["bn", "BRN", "Brunei Darussalam"],
    ["bg", "BGR", "Bulgaria"],
    ["bf", "BFA", "Burkina Faso"],
    ["bi", "BDI", "Burundi"],
    ["kh", "KHM", "Cambodia"],
    ["cm", "CMR", "Cameroon"],
    ["ca", "CAN", "Canada"],
    ["cv", "CPV", "Cape Verde"],
    ["ky", "CYM", "Cayman Islands"],
    ["cf", "CAF", "Central African Republic"],
    ["td", "TCD", "Chad"],
    ["cl", "CHL", "Chile"],
    ["cn", "CHN", "China"],
    ["cx", "CXR", "Christmas Island"],
    ["cc", "CCK", "Cocos (Keeling) Islands"],
    ["co", "COL", "Colombia"],
    ["km", "COM", "Comoros"],
    ["cg", "COG", "Congo"],
    ["cd", "COD", "Congo. Dem Rep of the"],
    ["ck", "COK", "Cook Islands"],
    ["cr", "CRI", "Costa Rica"],
    ["ci", "CIV", "Cote d'Ivoire"],
    ["hr", "HRV", "Croatia"],
    ["cu", "CUB", "Cuba"],
    ["cw", "CUW", "Curaçao"],
    ["cy", "CYP", "Cyprus"],
    ["cz", "CZE", "Czech Republic"],
    ["dk", "DNK", "Denmark"],
    ["dj", "DJI", "Djibouti"],
    ["dm", "DMA", "Dominica"],
    ["do", "DOM", "Dominican Republic"],
    ["ec", "ECU", "Ecuador"],
    ["eg", "EGY", "Egypt"],
    ["sv", "SLV", "El Salvador"],
    ["gq", "GNQ", "Equatorial Guinea"],
    ["er", "ERI", "Eritrea"],
    ["ee", "EST", "Estonia"],
    ["et", "ETH", "Ethiopia"],
    ["fk", "FLK", "Falkland Islands (Malvinas)"],
    ["fo", "FRO", "Faroe Islands"],
    ["fj", "FJI", "Fiji"],
    ["fi", "FIN", "Finland"],
    ["fr", "FRA", "France"],
    ["gf", "GUF", "French Guiana"],
    ["pf", "PYF", "French Polynesia"],
    ["tf", "ATF", "French Southern Territories"],
    ["ga", "GAB", "Gabon"],
    ["gm", "GMB", "Gambia"],
    ["ge", "GEO", "Georgia"],
    ["de", "DEU", "Germany"],
    ["gh", "GHA", "Ghana"],
    ["gi", "GIB", "Gibraltar"],
    ["gr", "GRC", "Greece"],
    ["gl", "GRL", "Greenland"],
    ["gd", "GRD", "Grenada"],
    ["gp", "GLP", "Guadeloupe"],
    ["gu", "GUM", "Guam"],
    ["gt", "GTM", "Guatemala"],
    ["gg", "GGY", "Guernsey"],
    ["gn", "GIN", "Guinea"],
    ["gw", "GNB", "Guinea-Bissau"],
    ["gy", "GUY", "Guyana"],
    ["ht", "HTI", "Haiti"],
    ["hm", "HMD", "Heard Island and McDonald Islands"],
    ["va", "VAT", "Holy See (Vatican City State)"],
    ["hn", "HND", "Honduras"],
    ["hk", "HKG", "Hong Kong"],
    ["hu", "HUN", "Hungary"],
    ["is", "ISL", "Iceland"],
    ["in", "IND", "India"],
    ["id", "IDN", "Indonesia"],
    ["ir", "IRN", "Iran"],
    ["iq", "IRQ", "Iraq"],
    ["ie", "IRL", "Ireland"],
    ["im", "IMN", "Isle of Man"],
    ["il", "ISR", "Israel"],
    ["it", "ITA", "Italy"],
    ["jm", "JAM", "Jamaica"],
    ["jp", "JPN", "Japan"],
    ["je", "JEY", "Jersey"],
    ["jo", "JOR", "Jordan"],
    ["kz", "KAZ", "Kazakhstan"],
    ["ke", "KEN", "Kenya"],
    ["ki", "KIR", "Kiribati"],
    ["kp", "PRK", "Korea, Democratic People's Republic of"],
    ["kr", "KOR", "Korea, Republic of"],
    ["kw", "KWT", "Kuwait"],
    ["kg", "KGZ", "Kyrgyzstan"],
    ["la", "LAO", "Laos"],
    ["lv", "LVA", "Latvia"],
    ["lb", "LBN", "Lebanon"],
    ["ls", "LSO", "Lesotho"],
    ["lr", "LBR", "Liberia"],
    ["ly", "LBY", "Libya"],
    ["li", "LIE", "Liechtenstein"],
    ["lt", "LTU", "Lithuania"],
    ["lu", "LUX", "Luxembourg"],
    ["mo", "MAC", "Macao"],
    ["mk", "MKD", "Macedonia"],
    ["mg", "MDG", "Madagascar"],
    ["mw", "MWI", "Malawi"],
    ["my", "MYS", "Malaysia"],
    ["mv", "MDV", "Maldives"],
    ["ml", "MLI", "Mali"],
    ["mt", "MLT", "Malta"],
    ["mh", "MHL", "Marshall Islands"],
    ["mq", "MTQ", "Martinique"],
    ["mr", "MRT", "Mauritania"],
    ["mu", "MUS", "Mauritius"],
    ["yt", "MYT", "Mayotte"],
    ["mx", "MEX", "Mexico"],
    ["fm", "FSM", "Micronesia, Federated States of"],
    ["md", "MDA", "Moldova, Republic of"],
    ["mc", "MCO", "Monaco"],
    ["mn", "MNG", "Mongolia"],
    ["me", "MNE", "Montenegro"],
    ["ms", "MSR", "Montserrat"],
    ["ma", "MAR", "Morocco"],
    ["mz", "MOZ", "Mozambique"],
    ["mm", "MMR", "Myanmar"],
    ["na", "NAM", "Namibia"],
    ["nr", "NRU", "Nauru"],
    ["np", "NPL", "Nepal"],
    ["nl", "NLD", "Netherlands"],
    ["nc", "NCL", "New Caledonia"],
    ["nz", "NZL", "New Zealand"],
    ["ni", "NIC", "Nicaragua"],
    ["ne", "NER", "Niger"],
    ["ng", "NGA", "Nigeria"],
    ["nu", "NIU", "Niue"],
    ["nf", "NFK", "Norfolk Island"],
    ["mp", "MNP", "Northern Mariana Islands"],
    ["no", "NOR", "Norway"],
    ["om", "OMN", "Oman"],
    ["pk", "PAK", "Pakistan"],
    ["pw", "PLW", "Palau"],
    ["ps", "PSE", "Palestine, State of"],
    ["pa", "PAN", "Panama"],
    ["pg", "PNG", "Papua New Guinea"],
    ["py", "PRY", "Paraguay"],
    ["pe", "PER", "Peru"],
    ["ph", "PHL", "Philippines"],
    ["pn", "PCN", "Pitcairn"],
    ["pl", "POL", "Poland"],
    ["pt", "PRT", "Portugal"],
    ["pr", "PRI", "Puerto Rico"],
    ["qa", "QAT", "Qatar"],
    ["re", "REU", "Réunion"],
    ["ro", "ROU", "Romania"],
    ["ru", "RUS", "Russia"],
    ["rw", "RWA", "Rwanda"],
    ["bl", "BLM", "Saint Barthélemy"],
    ["sh", "SHN", "Saint Helena, Ascension and Tristan da Cunha"],
    ["kn", "KNA", "Saint Kitts and Nevis"],
    ["lc", "LCA", "Saint Lucia"],
    ["mf", "MAF", "Saint Martin (French part)"],
    ["pm", "SPM", "Saint Pierre and Miquelon"],
    ["vc", "VCT", "Saint Vincent and the Grenadines"],
    ["ws", "WSM", "Samoa"],
    ["sm", "SMR", "San Marino"],
    ["st", "STP", "Sao Tome and Principe"],
    ["sa", "SAU", "Saudi Arabia"],
    ["sn", "SEN", "Senegal"],
    ["rs", "SRB", "Serbia"],
    ["sc", "SYC", "Seychelles"],
    ["sl", "SLE", "Sierra Leone"],
    ["sg", "SGP", "Singapore"],
    ["sx", "SXM", "Sint Maarten (Dutch part)"],
    ["sk", "SVK", "Slovakia"],
    ["si", "SVN", "Slovenia"],
    ["sb", "SLB", "Solomon Islands"],
    ["so", "SOM", "Somalia"],
    ["za", "ZAF", "South Africa"],
    ["gs", "SGS", "South Georgia and the South Sandwich Islands"],
    ["ss", "SSD", "South Sudan"],
    ["es", "ESP", "Spain"],
    ["lk", "LKA", "Sri Lanka"],
    ["sd", "SDN", "Sudan"],
    ["sr", "SUR", "Suriname"],
    ["sj", "SJM", "Svalbard and Jan Mayen"],
    ["sz", "SWZ", "Swaziland"],
    ["se", "SWE", "Sweden"],
    ["ch", "CHE", "Switzerland"],
    ["sy", "SYR", "Syria"],
    ["tw", "TWN", "Taiwan, Province of China"],
    ["tj", "TJK", "Tajikistan"],
    ["tz", "TZA", "Tanzania"],
    ["th", "THA", "Thailand"],
    ["tl", "TLS", "Timor-Leste"],
    ["tg", "TGO", "Togo"],
    ["tk", "TKL", "Tokelau"],
    ["to", "TON", "Tonga"],
    ["tt", "TTO", "Trinidad and Tobago"],
    ["tn", "TUN", "Tunisia"],
    ["tr", "TUR", "Turkey"],
    ["tm", "TKM", "Turkmenistan"],
    ["tc", "TCA", "Turks and Caicos Islands"],
    ["tv", "TUV", "Tuvalu"],
    ["ug", "UGA", "Uganda"],
    ["ua", "UKR", "Ukraine"],
    ["ae", "ARE", "United Arab Emirates"],
    ["gb", "GBR", "United Kingdom"],
    ["us", "USA", "United States of America"],
    ["um", "UMI", "United States Minor Outlying Islands"],
    ["uy", "URY", "Uruguay"],
    ["uz", "UZB", "Uzbekistan"],
    ["vu", "VUT", "Vanuatu"],
    ["ve", "VEN", "Venezuela"],
    ["vn", "VNM", "Vietnam"],
    ["vg", "VGB", "Virgin Islands, British"],
    ["vi", "VIR", "Virgin Islands, U.S."],
    ["wf", "WLF", "Wallis and Futuna"],
    ["eh", "ESH", "Western Sahara"],
    ["ye", "YEM", "Yemen"],
    ["zm", "ZMB", "Zambia"],
    ["zw", "ZWE", "Zimbabwe"] ];