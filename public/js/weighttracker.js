// Angular App definition
var app = angular.module("weighttrackerApp", ["firebase", "chart.js"]);

// App Controller
app.controller("weighttrackerController", ['$scope','$timeout', '$firebaseArray', function($scope, $timeout, $firebaseArray) {

	console.log("Hello there!");

	// Initialize my variables
	$scope.data_weights = [];
	$scope.labels_time = [];

	var ref = firebase.database().ref().child("weights");
	// download the data into a local object
	$scope.data = $firebaseArray(ref);

	// Manage data once loaded
	$scope.data.$loaded().then(function() {
			console.log("Firebase data has been loaded!");
			// Iterate over each key/value pair
			angular.forEach($scope.data, function(entryPoint) {
				console.log(entryPoint);
				// Data update
				$scope.data_weights.push(entryPoint.Weight);
				console.log("$scope.data_weights is actually: " + $scope.data_weights);
				// Labels time update
				$scope.labels_time.push(entryPoint.DateAndTime);
				console.log("$scope.labels_time is actually: " + $scope.labels_time);				

			});
		});


	//Method to add a new Weight, called by the form ng-submit
	$scope.checkInWeight = function(){

		console.log("Check In button has been pressed");
		//Add the order in the overall list of orders (Firebase)
		console.log("Add Weight " + $scope.weightInput + " into Firebase!");
		
		//Date 
		var d = Date();
		console.log("Date used for weight check in: " + d)

		$scope.data.$add({
	    
	    	"Weight": $scope.weightInput,
	    	"DateAndTime": d,

		}).then(function(ref) {

			console.log("Weight has been entered in Firebase with key: " + ref.key);
			});

	}






}]); // END OF APP CONTROLLER



	/*

	// Weight Chart 
	var ctx = document.getElementById("WeightChart");
	var myWeightChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
	        datasets: [{
	            label: '# of Votes',
	            data: [12, 19, 3, 5, 2, 3],
	            backgroundColor: [
	                'rgba(0,0,0,0.1)'
	            ],
	            borderColor: [
	                'rgba(0,0,0,0.1)'
	            ],
	            borderWidth: 1
	        }]
	    },
	    options: {
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true
	                }
	            }]
	        },
	        legend: {
	        	display: false
	        }
	    }
	});



	*/



