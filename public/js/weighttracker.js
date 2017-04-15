// Angular App definition
var app = angular.module("weighttrackerApp", ["firebase"]);

// To use outside Classes I need to:
app.constant("moment", moment);
app.constant("Chart", Chart);

// App Controller
app.controller("weighttrackerController", ['$scope','$timeout', '$firebaseArray', '$firebaseObject','moment', 'Chart', function($scope, $timeout, $firebaseArray, $firebaseObject, moment, Chart) {

	console.log("Hello there!");

	// Initialize my variables
	$scope.uid = null;
	$scope.currentTargets = {};
	$scope.currentTargetInputAreaVisible = false;
	$scope.data_weights = [];
	$scope.data_target_weights = [];
	$scope.labels_time = [];

	// Chart related variables
	var chartElement = document.getElementById('WeightChart');
	var joffreyBlueLineColor = 'rgba(66, 139, 202, 1)';
	var joffreyGreenLineColor = 'rgba(92,184,92,1)';

	// Hide the target input area at first (it will be shown if required after)
	$("#joffrey-target-div").hide();

	// FirebaseUI config.
	var uiConfig = {
		signInSuccessUrl: '<url-to-redirect-to-on-success>',
		signInOptions: [
		  // Leave the lines as is for the providers you want to offer your users.
		  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		  firebase.auth.FacebookAuthProvider.PROVIDER_ID,
		  // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
		  // firebase.auth.GithubAuthProvider.PROVIDER_ID,
		  firebase.auth.EmailAuthProvider.PROVIDER_ID
		],
		// Terms of service url.
		tosUrl: '<your-tos-url>'
	};

	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseui-auth-container', uiConfig);

	// Firebase USER Sign In Monitoring
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    console.log("User is signed in!");
	    $scope.uid = user.uid;

	    // Ensure data binding for the Signed In User
	    angularFireDataBindingJoffrey();

	    var displayName = user.displayName;
	    var email = user.email;
	    var emailVerified = user.emailVerified;
	    var photoURL = user.photoURL;
	    var uid = user.uid;
	    var providerData = user.providerData;

	    user.getToken().then(function(accessToken) {

			//Display name in the Nav bar
			$("#user_name_navbar").text(displayName);
			$("#sign-out").text("(Sign out)");

			//jQuery hiding the Firebase UI Auth when the user is logged in
			$("#firebaseui-auth-container").slideUp(1000);  

			//Enable Forms
			$("#weightInputField").prop("disabled", false);
			$("#weightCheckInButton").prop("disabled", false);

			$("#weightTargetField").prop("disabled", false);
			$("#weightTargetSetButton").prop("disabled", false);

			// Set User Photo
			if (photoURL != null) {
				//Use valid Photo URL from Google or Facebook 
				document.getElementById('userPhoto').src = photoURL;
			} else {
				//Else, Default photo is used
				document.getElementById('userPhoto').src = "images/default_user.png";
			}

			// Set user account details to Firebase
			firebase.database().ref("users/" + uid + "/userDetails/").set({
			  "displayName": displayName,
			  "email": email,
			  "emailVerified": emailVerified,
			  "photoURL": photoURL,
			  "uid": uid,
			  "accessToken": accessToken,
			  "providerData": providerData
			  });

	    });
	  } else {
	    // User is signed out.
	    console.log("User is signed out!");
	    $scope.uid = "default_user";

	    // Ensure data binding for the Default User
	    angularFireDataBindingJoffrey();

		$("#user_name_navbar").text("Please Sign in below");
		$("#sign-out").text("");

    	//Disable Form
		$("#weightInputField").prop("disabled", true);
		$("#weightCheckInButton").prop("disabled", true);

		$("#weightTargetField").prop("disabled", true);
		$("#weightTargetSetButton").prop("disabled", true);
		
		// Set default user image
		document.getElementById('userPhoto').src = "images/default_user.png";

		//jQuery showing the Firebase UI Auth when the user is logged in
		$("#firebaseui-auth-container").slideDown(1000);




	  }
	}, function(error) {
	  console.log(error);
	});


	// Watch for target input area visibility changes and adapt view accordingly
	$scope.$watch('currentTargetInputAreaVisible', function(newValue, oldValue) {
		if ( newValue == true ) {
			$("#joffrey-target-div").slideDown(1000);
			$("#targetChangeHideLink").text("Hide");
		} else {
			$("#joffrey-target-div").slideUp(1000);
			$("#targetChangeHideLink").text("Change");
		}
	});

	// Watch for the target weight and adapt view accordingly
	$scope.$watch('currentTargets', function() {
			if ( isNaN($scope.currentTargets.currentTargetBodyWeight) ) {
				$("#spanCurrentTarget").text("Your Target Weight is not set yet: ");
				$("#targetChangeHideLink").hide();
				$scope.currentTargetInputAreaVisible = true;
			} else {
				$("#targetChangeHideLink").show();
				$("#spanCurrentTarget").text("Your current Target Weight is: " + $scope.currentTargets.currentTargetBodyWeight + "lbs");
				$scope.currentTargetInputAreaVisible = false;
			}
	});



	// AngularFire Data Binding 
	function angularFireDataBindingJoffrey() {

		// Angular-Fire Weight data binding
		var ref = firebase.database().ref().child("users/" + $scope.uid + "/weights/");
		$scope.data = $firebaseArray(ref);

		// Angular-Fire Current Target data binding
		var refTargets = firebase.database().ref().child("users/" + $scope.uid + "/currentTargets/");
		$scope.currentTargets = $firebaseObject(refTargets);
		// Three way data binding:
		$scope.currentTargets.$bindTo($scope, "currentTargets");

		// Watch for data events and resfresh Chart upon event
		$scope.data.$watch(function(event) {
			refreshChart();
		});

	}


	// function refreshing the Weight Chart
	function refreshChart() {

		// Update the data and labels with data from Firebase
		$scope.data_weights = $scope.data.map(weightMapping);
		$scope.data_target_weights = $scope.data.map(weightTargetMapping);
		$scope.labels_time = $scope.data.map(timeMapping);

		var myChart = new Chart(chartElement, {
		    type: 'line',
		    data: {
		        labels: $scope.labels_time,
		        datasets: [
		        {
		            // Actual Weight
		            fill: false,
		            lineTension: 0,
		            label: 'Actual Weight',
		            data: $scope.data_weights,
		            borderColor: joffreyBlueLineColor,
		            backgroundColor: joffreyBlueLineColor,
		            pointBackgroundColor: joffreyBlueLineColor,
		            borderWidth: 1
		        },

		        {
		            // Target Weight
		            fill: false,
		            lineTension: 0,
		            label: 'Target Weight',
		            data: $scope.data_target_weights,
		            borderColor: joffreyGreenLineColor,
		            backgroundColor: joffreyGreenLineColor,
		            pointBackgroundColor: joffreyGreenLineColor,
		            borderWidth: 1
		        }

		        ]
		    },
		    options: {
		    	legend: {
		    		display: true,
		    		position: "bottom"

		    	},
		        scales: {
		        	xAxes: [{
		        		type: "time",
		        		time: {
		        			displayFormats: {
		        			}
		        		}
		        	}],
		            yAxes: [{
		                ticks: {
		                    beginAtZero:false,
		                    min: calculateMinMaxScale().min,
		                    max: calculateMinMaxScale().max
		                }
		            }]
		        }
		    }
		});

	}

	// Array Mapping functions
	function weightMapping(weightEntry) {
		return weightEntry.Weight;
	}
	function weightTargetMapping(weightEntry) {
		return weightEntry.TargetBodyWeight;
	}	
	function timeMapping(weightEntry) {
		return weightEntry.DateAndTime;
	}

	// Function calculating the required scale min max to properly display
	function calculateMinMaxScale() {
		var minMax = {
			min: null,
			max: null
		};
		// Concatenate all data to be displayed in the chart
		var overallDataChart = $scope.data_weights.concat($scope.data_target_weights);
		// Filter out the elements that are not a number (undefined value for target for example)
		var overallDataChartFiltered = overallDataChart.filter(function(targW) {return !( isNaN(targW) ) });
		// Calculate the min and max for the scale
		minMax.min = Math.round( Math.min.apply( Math, overallDataChartFiltered ) * 0.995 );
		minMax.max = Math.round( Math.max.apply( Math, overallDataChartFiltered ) * 1.005 );
		return minMax;
	}



	//Method to add a new Weight, called by the form ng-submit
	$scope.checkInWeight = function(){

		//Add the order in the overall list of orders (Firebase)
		console.log("Add Weight " + $scope.weightInput + " into Firebase!");
		
		//Date 
		var d = moment().toISOString();

		console.log("current target weight at moment of check-in is: " + $scope.currentTargets.currentTargetBodyWeight);
	
		// Once current target retrieved, add weight entry in Firebase...
		$scope.data.$add({
	    	"DateAndTime": d,	    
	    	"Weight": $scope.weightInput,
	    	// If target is undefined in Firebase, replace by null to void that key/value
	    	"TargetBodyWeight": ( typeof $scope.currentTargets.currentTargetBodyWeight == 'undefined') ? null : $scope.currentTargets.currentTargetBodyWeight
		}).then(function(ref) {
			console.log("Weight has been entered in Firebase with key: " + ref.key);
			});

		

	}

	//Method to set the target weight
	$scope.setTargetWeight = function() {

		//Add the order in the overall list of orders (Firebase)
		console.log("Set Target Weight " + $scope.newUserInputWeightTarget + " into Firebase!");

		// Save the new user weight target (three way data binding will secure data saving in Firebase as well)
		$scope.currentTargets.currentTargetBodyWeight = $scope.newUserInputWeightTarget;

	}

	// Method changing value of target area visible when hyperlink clicked
	$scope.targetChangeHideLinkClicked = function() {

		if ($scope.currentTargetInputAreaVisible == true) {
			$scope.currentTargetInputAreaVisible = false;
		} else {
			$scope.currentTargetInputAreaVisible = true;
		}

	}



}]); // END OF APP CONTROLLER





