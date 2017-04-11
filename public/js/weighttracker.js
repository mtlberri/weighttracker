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




	// FirebaseUI config.
	var uiConfig = {
		signInSuccessUrl: '<url-to-redirect-to-on-success>',
		signInOptions: [
		  // Leave the lines as is for the providers you want to offer your users.
		  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
		  // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
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

	// Firebase USER MANAGEMENT
	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    console.log("User is signed in!");
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
			console.log("Hide Firebase UI Auth please!");
			$("#firebaseui-auth-container").slideUp(1000);  

			//Enable Ordering Form
			$("#weightInputField").prop("disabled", false);

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

		$("#user_name_navbar").text("Please Sign in below");
		$("#sign-out").text("");

    	//Disable Ordering Form
		$("#weightInputField").prop("disabled", true);

		// Set default user image
		document.getElementById('userPhoto').src = "images/default_user.png";

		//jQuery showing the Firebase UI Auth when the user is logged in
		$("#firebaseui-auth-container").slideDown(1000);


	  }
	}, function(error) {
	  console.log(error);
	});


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
		//console.log(event);
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





