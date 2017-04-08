// Angular App definition
var app = angular.module("weighttrackerApp", ["firebase"]);

// AngularFire Controller
app.controller("weighttrackerController", function($scope, $firebaseArray) {
	
	var ref = firebase.database().ref();
	// download the data into a local object
	$scope.data = $firebaseArray(ref);
	// putting a console.log here won't work, see below
	console.log("Hello there!")



	//Method to add a new Weight, called by the form ng-submit
	$scope.checkInWeight = function(){

		//Add the order in the overall list of orders (Firebase)
		console.log("Add Weight Entry to Firebase!");
		$scope.data.$add({
	    
	    "Weight": 175,   

		}).then(function(ref) {

			console.log("That thing was a success!");
			});

	}




}); // END OF APP CONTROLLER







// CHART

var data = {
  // A labels array that can contain any sort of values
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  // Our series array that contains series objects or in this case series data arrays
  series: [
    [169, 170, 171, 170, 173, 174, 173]
  ]
};

// Create a new line chart object where as first parameter we pass in a selector
// that is resolving to our chart container element. The Second parameter
// is the actual data object.
new Chartist.Line('.ct-chart', data);




