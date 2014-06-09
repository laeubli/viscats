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
// Functions

function handleFileSelect (e) {
	
	var files = e.target.files; // FileList object
	for (var i = 0, f; f = files[i]; i++) {

		var reader = new FileReader();
		file_name = f.name;
		
		reader.addEventListener('load', function (event) {
			csv_file_content = event.target.result;
			// pass data to viscats.js and append the returned item to #main_content
			var new_timeline = translationSession(csv_file_content).title(file_name);
			new_timeline.appendTo('#main_content');
			console.log(event.target);
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
			console.log(csv_file_content);
			// pass data to viscats.js and append the returned item to #main_content
			var new_timeline = translationSession(csv_file_content).title(file_name);
			new_timeline.appendTo('#main_content');
			console.log(event.target);
		});
		
		reader.readAsText(f);

	}

}

function handleDragOver (e) {

	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.

}