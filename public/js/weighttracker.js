// Angular App definition
var app = angular.module("weighttrackerApp", ["firebase"]);

// To use outside Classes I need to:
app.constant("moment", moment);
app.constant("Chart", Chart);

// General Chart configuration
/*
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
  */

// App Controller
app.controller("weighttrackerController", ['$scope','$timeout', '$firebaseArray','moment', 'Chart', function($scope, $timeout, $firebaseArray, moment, Chart) {

	console.log("Hello there!");

	// Initialize my variables
	$scope.data_weights = [0];
	$scope.labels_time = [0];
	var joffreyLineColor = 'rgba(66, 139, 202, 1)';

	// Get the Chart Element
	var chartElement = document.getElementById('WeightChart');

	// Firebase data binding
	var ref = firebase.database().ref().child("weights");
	// download the data into a local object
	$scope.data = $firebaseArray(ref);

	// function refreshing the Weight Chart
	function refreshChart() {

		// Update the data and labels with data from Firebase
		$scope.data_weights = $scope.data.map(weightMapping);
		$scope.labels_time = $scope.data.map(timeMapping);

		console.log("$scope.data_weights:" + $scope.data_weights );		
		console.log("Weights min:" + Math.min.apply(Math, $scope.data_weights) );

		var myChart = new Chart(chartElement, {
		    type: 'line',
		    data: {
		        labels: $scope.labels_time,
		        datasets: [{
		            fill: true,
		            lineTension: 0,
		            label: 'Weight',
		            data: $scope.data_weights,
		            borderColor: joffreyLineColor,
		            pointBackgroundColor: joffreyLineColor,
		            borderWidth: 1
		        }]
		    },
		    options: {
		    	legend: {
		    		display: false
		    	},
		        scales: {
		        	xAxes: [{
		        		type: "time"
		        	}],
		            yAxes: [{
		                ticks: {
		                    beginAtZero:false,
		                    min: Math.round( Math.min.apply(Math, $scope.data_weights)*0.95 ),
		                    max: Math.round( Math.max.apply(Math, $scope.data_weights)*1.05 )
		                }
		            }]
		        }
		    }
		});

	}

	// Mapping functions
	function weightMapping(weightEntry) {
		return weightEntry.Weight;
	}
	function timeMapping(weightEntry) {
		return weightEntry.DateAndTime;
	}

	// Watch for data events and resfresh Chart upon event
	$scope.data.$watch(function(event) {
		console.log(event);
		refreshChart();
	});

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





