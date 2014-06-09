// viscats
// Visualises user activity data from computer-aided translation sessions
// ---
// Author: Samuel Läubli <slaubli@inf.ed.ac.uk>
// Organisation: The University of Edinburgh
// ---
// This is a collection of JavaScript functions that implement the main functionality of viscats.
 
function translationSession ( csv_file_url, settings ) {
	// the visualisation of a single translation session

	var instance = {};

	var title, title_extension, description;

	var timeline; // states in translation session over time (left section)

	var states; // state distribution (right section)
	var states_container_width = 0; // width of the states container; will be updated in instance.appendStates()

	var color_scale = d3.scale.category10(); // the state colors will be dranw from here
	var state_color = {};

	// ---
	// helper functions

	instance.getStateColor = function ( state_name ) {
		return state_color[state_name];
	};

	// ---
	// rendering functions

	instance.appendTo = function ( selector ) {
		// appends the whole instance to a HTML element as specified by @param selector, e.g., '#main'
		// IMPORTANT: appendStates() must be applied before appendTineline()!

		// read CSV
		d3.csv(csv_file_url, csvTypeConverter, function (rows) {

			num_events = 0; // counter for number of CSV rows
			num_states = 0;
			time_offset = null; // all event times will be relative to the starting time of the first event
			var state_distribution = {}; // percentage of states relative to the total number of events

			for (var key in rows) {
				row = rows[key];
				if (!time_offset) time_offset = row.start;
				if (!state_color[row.state]) {
					state_color[row.state] = color_scale(num_states);
					num_states++;
				}
				if (!state_distribution[row.state]) state_distribution[row.state] = 1;
					else state_distribution[row.state] += 1;
				row.start -= time_offset;
				row.end -= time_offset;
				num_events++;
			}
			
			state_distribution_percentage = []
			for (var key in state_distribution) {
				state_name = key;
				percentage = state_distribution[key] / num_events; // convert number of state occurrences into percentages
				state_distribution_percentage.push( {'state': state_name, 'value': percentage} );
			}

			// produce HTML for visualisation elements
			var container = d3.select(selector).append('div').attr('class','viscats_item');
			instance.appendTitle(container, num_events);
			instance.appendDescription(container);
			instance.appendStates(container, state_distribution_percentage);
			instance.appendTimeline(container, rows);

		});

		function csvTypeConverter (row) {
			row.start = +row.start; // fast method to convert start from string to int
			row.end = +row.end;
			return row;
		}

	};

	instance.appendTitle = function ( container, num_events ) {
		/* appends the title box of this instance to @param container.
		** Sets the title saved in instance.title, as well as the title extension
		** according to @param num_events.
		*/
		if (num_events) title_extension = num_events + ' events';
		if (title) {
			title_container = container.append('div')
				.attr('class', 'viscats_item_title')
				.append('div').attr('class', 'viscats_item_content');
			title_container.append('span')
				.attr('class', 'title')
				.text(title);
			if (num_events) {
				title_container.append('span')
					.attr('class', 'title_extension')
				  	.text(title_extension);
				  }
			}

		return instance;
	};

	instance.appendDescription = function ( container ) {
		// appends the discription box of this instance to @param container
		if (description) {
		container.append('div').attr('class', 'viscats_item_description')
			.append('div').attr('class', 'viscats_item_content')
			.text(description);
		}

		return instance;
	}

	instance.appendStates = function ( container, data ) {
		/* appends a bar chart of the states and their distribution to @param container
		** @param data consists of the names and percentages of N states, such that all values
		** sum to 1.0. Example:
		**		data = [ 
		**			{state: "Name of State 1", value: 33.1},
					{state: "Name of State 2", value: 12.9},
					{state: "Name of State N", value: 54.0},
		**		];
		*/

		var chart_container = container.append('div')
			.attr('class', 'viscats_item_state_distribution');

		var bar_width = 60;
		var margin = {top: 10, right: 20, bottom: 20, left: 40}
		var chart_width = (data.length * bar_width) - margin.left - margin.right ; // flexible chart width
		var chart_height = 120 - margin.top - margin.bottom; // fixed chart height

		states_container_width = chart_width + margin.left + margin.right ; // to be accessed in appendTimeline()

		var x = d3.scale.ordinal()
			.rangeRoundBands([0, chart_width], .2, .7)
			.domain(data.map(function (d) { return d.state; } ));

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
			.attr("x", function (d) { return x(d.state); })
			.attr("y", function (d) { return y(d.value); })
			.attr('height', function (d) { return chart_height - y(d.value); } )
			.attr('width', x.rangeBand())
			.style("fill", function (d, i) { return instance.getStateColor(d.state) } );

		return instance;
	};

	instance.appendTimeline = function ( container, data, start, end ) {
		/* appends a bar chart of the states and their distribution to @param container
		** @param data consists of the state names and their start and end IN MILISECONDS.
		** Example:
		**		data = [ 
		**			{state: "Name of State X", start: 2000, end: 3000}, // from 2000 - 3000
					{state: "Name of State X", start: 3000, end: 7000}, // from 3000 - 7000
					{state: "Name of State X", start: 7000, end: 10000}, // from 7000 - 10000
		**		];
		** @param start (int) is the absolute start time in miliseconds; default is 0.
		** @param end (int) is the absolute end time in miliseconds; default is the end time of the last item in @param data.
		*/

		if (!start) start =  new Date( 0 );
		if (!end) end = new Date( data[data.length -1].end );
			// NOTE: miliseconds in data are not yet converted to Date objects at this point!

		// create div that will hold the timeline
		var timeline_container = container.append('div')
			.attr('class', 'viscats_item_timeline');

		// define overall dimensions of the timeline
		timeline_height = 120;
		timeline_width = parseInt(timeline_container.style('width')) - states_container_width; // gets the width of the div; timeline width can only be updated by refreshing the page (e.g., after window resizing). Then subtracts the width of the div container of the state distribution chart as set in instance.appendStates().
		var margin = {top: 10, right: 0, bottom: 20, left: 24};
		timeline_height = timeline_height - margin.top - margin.bottom;
		timeline_width = timeline_width - margin.left - margin.right;

		// define scale
		var x = d3.time.scale()
			.domain([start, end], 1)
			.rangeRound([0, timeline_width - margin.left - margin.top]);

		// define axis
		var x_axis = d3.svg.axis() // define x axis
			.scale(x)
			.orient('bottom')
			.ticks(d3.time.minutes.utc, 5)
			.tickFormat(d3.time.format.utc('%H:%M'));

		// enable tooltipps
		// TODO

		// add SVG element
		timeline = timeline_container.append('svg')
			.attr('class', 'timeline')
			.attr('width', timeline_width + margin.left + margin.right)
			.attr('height', timeline_height + margin.top + margin.bottom)
		  .append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// add axis
		timeline.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + timeline_height + ')')
			.call(x_axis);

		// add events (timespans)
		timeline.selectAll('.event')
			.data(data)
			.enter().append('rect')
			.attr("x", function (d) { return x(d.start); } )
			.attr('height', timeline_height)
			.attr('width', function (d) { return x(d.end) - x(d.start); } )
			.style("fill", function (d, i) { return instance.getStateColor(d.state) } );

		return instance;

	}

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