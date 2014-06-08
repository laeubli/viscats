// viscats
// Visualises user activity data from computer-aided translation sessions
// ---
// Author: Samuel Läubli <slaubli@inf.ed.ac.uk>
// Organisation: The University of Edinburgh
// ---
// This is a collection of JavaScript functions that implement the main functionality of viscats.
 
function translationSession ( data, settings ) {
	// the visualisation of a single translation session

	var instance = {};

	var title, description;

	var timeline; // states in translation session over time (left section)

	var states; // state distribution (right section)

	var color_scale = d3.scale.category10();

	// ---
	// rendering functions

	instance.appendTo = function ( selector ) {
		// appends the whole instance to a HTML element as specified by @param selector, e.g., '#main'
		var container = d3.select(selector).append('div').attr('class','viscats_item');
		instance.appendTitle(container);
		// etc.
		instance.appendStates(container)
		instance.appendDescription(container);
	};

	instance.appendTitle = function ( container ) {
		// appends the title box of this instance to @param container
		if (title) {
			container.append('div').attr('class', 'viscats_item_title')
				.append('div').attr('class', 'viscats_item_content')
				.text(title);
			}
	};

	instance.appendDescription = function ( container ) {
		// appends the discription box of this instance to @param container
		if (description) {
		container.append('div').attr('class', 'viscats_item_description')
			.append('div').attr('class', 'viscats_item_content')
			.text(description);
		}
	}

	instance.appendStates = function ( container, data ) {
		/* appends a bar chart of the states and their distribution to @param container
		** @param data consists of the names and percentages of N states, such that all values
		** sum to 1.0. Example:
		**		data = [ 
		**			{name: "Name of State 1", value: 33.1},
					{name: "Name of State 2", value: 12.9},
					{name: "Name of State N", value: 54.0},
		**		]
		*/
		
		data = [ // Temporarily assume the data has been converted already
			{name: "H1", value: 0.331},
			{name: "H2", value: 0.129},
			{name: "H3", value: 0.540},
		]

		var chart_container = container.append('div')
			.attr('class', 'viscats_item_state_distribution')

		var bar_width = 60;
		var margin = {top: 10, right: 20, bottom: 20, left: 40}
		var chart_width = (data.length * bar_width) - margin.left - margin.right ; // flexible chart width
		var chart_height = 120 - margin.top - margin.bottom; // fixed chart height

		var x = d3.scale.ordinal()
			.rangeRoundBands([0, chart_width], .2, .7)
			.domain(data.map(function (d) { return d.name; } ));

		var y = d3.scale.linear()
			.range([chart_height, 0])
			.domain([0, d3.max(data, function (d) { return d.value; } )]);

		var x_axis = d3.svg.axis() // define x axis
			.scale(x)
			.orient('bottom');

		var y_axis = d3.svg.axis() // define x axis
			.scale(y)
			.orient('left')
			.ticks(2, '%');
			
		chart = chart_container.append('svg')
			.attr('class', 'barchart')
			.attr('width', chart_width + margin.left + margin.right)
			.attr('height', chart_height + margin.top + margin.bottom)
		  .append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		chart.append('g') // add x axis
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + chart_height + ')')
			.call(x_axis);

		chart.append('g') // add y axis
			.attr('class', 'y axis')
			.call(y_axis)
		  .append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Frequency");

		chart.selectAll('.bar') // add bars
			.data(data)
			.enter().append('rect')
			.attr("x", function (d) { return x(d.name); })
			.attr("y", function (d) { return y(d.value); })
			.attr('height', function (d) { return chart_height - y(d.value); } )
			.attr('width', x.rangeBand())
			.style("fill", function (d, i) { return color_scale(i) } );

		return instance;
	};

	// ---
	// accessors serving as both setter and getter

	instance.title = function ( t ) {
		if (!arguments.length) return title;
		title = t;
		return instance;
	};

	instance.description = function ( d ) {
		if (!arguments.length) return description;
		description = d;
		return instance;
	};

	// ---
	// return

	return instance;

}