// viscats
// Visualises user activity data from computer-aided translation sessions
// ---
// Author: Samuel Läubli <slaubli@inf.ed.ac.uk>
// Organisation: The University of Edinburgh
// ---
// Enables CSV file selection through drag'n'drop or a file selection popup.
// This file is partially based on http://www.html5rocks.com/en/tutorials/file/dndfiles/

// Check for the various File API support.
if (!window.File && window.FileReader && window.FileList && window.Blob) alert("Your browser doesn't provide all functionality needed to use segcats. Please update or change your browser to access this site.");

// ---
// Currently loaded timeline objects
var state_colors_of_previous_timeline = null;

// ---
// Functions

function addTimeline (csv_file_content, file_name) {
	// pass data to viscats.js and append the returned item to #main_content
	var new_timeline = translationSession(csv_file_content, state_colors_of_previous_timeline).title(file_name);
	new_timeline.appendTo('#main_content');
	state_colors_of_previous_timeline = new_timeline.getStateColors();
}

function handleFileSelect (e) {
	
	var files = e.target.files; // FileList object
	for (var i = 0, f; f = files[i]; i++) {

		var reader = new FileReader();
		file_name = f.name;
		
		reader.addEventListener('load', function (event) {
			csv_file_content = event.target.result;
			addTimeline(csv_file_content, file_name);
		});
		
		reader.readAsText(f);
	}
}

function handleFileDrop (e) {

	var files = e.dataTransfer.files;
	for (var i = 0, f; f = files[i]; i++) {

		e.stopPropagation();
		e.preventDefault();

		var reader = new FileReader();
		file_name = f.name;
		
		reader.addEventListener('load', function (event) {
			csv_file_content = event.target.result;
			addTimeline(csv_file_content, file_name);
		});
		
		reader.readAsText(f);

	}

}

function handleDragOver (e) {

	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.

}