// Angular App definition
var app = angular.module("weighttrackerApp", ["firebase", "chart.js"]);

// To use moment I need to:
app.constant("moment", moment);

// General Chart configuration
app.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      animation: {
      	// animation duration in ms
      	duration: 1000,
      },
      scales: {
      	xAxes: [{
      		type: 'time',
      	}]
      }
    });
  }]);

// App Controller
app.controller("weighttrackerController", ['$scope','$timeout', '$firebaseArray','moment', function($scope, $timeout, $firebaseArray, moment) {

	console.log("Hello there!");

	// Initialize my variables
	$scope.data_weights = [0];
	$scope.labels_time = [0];

	// Set Chart Options
	$scope.joffreyChartOptions = {
		showLines: true,
	};

	// Dataset override for options of my Chart Line
	$scope.joffreyDatasetOverride = {
		fill: false,
		lineTension: 0,
		pointBackgroundColor: 'rgba(66, 139, 202, 1)',
		borderColor: 'rgba(66, 139, 202, 1)',
	};

	var ref = firebase.database().ref().child("weights");
	// download the data into a local object
	$scope.data = $firebaseArray(ref);

	// watch for data events 
	$scope.data.$watch(function(event) {
		console.log(event);
		// Update the data and labels with data from Firebase
		$scope.data_weights = $scope.data.map(weightMapping);
		$scope.labels_time = $scope.data.map(timeMapping);
	});
	
	// Mapping functions
	function weightMapping(weightEntry) {
		return weightEntry.Weight;
	}
	function timeMapping(weightEntry) {
		return weightEntry.DateAndTime;
	}


	//Method to add a new Weight, called by the form ng-submit
	$scope.checkInWeight = function(){

		console.log("Check In button has been pressed");
		//Add the order in the overall list of orders (Firebase)
		console.log("Add Weight " + $scope.weightInput + " into Firebase!");
		
		//Date 
		var d = moment().toISOString();
		console.log("Date used for weight check in: " + d)

		$scope.data.$add({
	    
	    	"Weight": $scope.weightInput,
	    	"DateAndTime": d,

		}).then(function(ref) {

			console.log("Weight has been entered in Firebase with key: " + ref.key);
			});

	}






}]); // END OF APP CONTROLLER





