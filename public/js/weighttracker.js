// Angular App definition
var app = angular.module("weighttrackerApp", ["firebase", "chart.js"]);


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
      		/*
      		time: {
	      		displayFormats: {
		           'millisecond': 'MMM DD',
		           'second': 'MMM DD',
		           'minute': 'MMM DD',
		           'hour': 'MMM DD',
		           'day': 'MMM DD',
		           'week': 'MMM DD',
		           'month': 'MMM DD',
		           'quarter': 'MMM DD',
		           'year': 'MMM DD',
	        	}
      		}
      		*/
      	}]
      }
    });
  }]);

// App Controller
app.controller("weighttrackerController", ['$scope','$timeout', '$firebaseArray', function($scope, $timeout, $firebaseArray) {

	console.log("Hello there!");

	// Initialize my variables
	$scope.data_weights = [0];
	$scope.labels_time = [0];

	// Set Chart Options
	$scope.joffreyChartOptions = {
		showLines: true,
	};

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



