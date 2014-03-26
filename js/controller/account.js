app.controller('account', function($scope, $rootScope, userService, $location, $interval) {
	$scope.transfer = {
		date: new Date().getTime(),
		title: '',
		subTitle: '',
		name: '',
		address: '',
		subAddress: '',
		number: '',
		amount: '',
		balance: '',
	};
	$scope.recipient = {
		name:       '',
		address:    '',
		subAddress: '',
		number:     ''
	};
	$scope.lokata = {
		name: 		'',
		amount: 	''
	};
	$scope.rachunek = {
		name: 		'',
		amount: 	''
	};
	$scope.kredyt = {
		name: '',
		description: '',
		amount: ''
	};


	$scope.balanceError = false;

	$scope.saveTransfer = function() {
		var balance = parseInt($scope.user.balance) - $scope.transfer.amount;
		$scope.transfer.amount *= -1;		
		$scope.transfer.balance = balance;
		$scope.user.balance = balance;
		$scope.user.transfers.push($scope.transfer);
	
		var promise = userService.update($scope.user);
		promise.then(
			function(user) {
				$rootScope.transferSummary = $scope.transfer;
				$rootScope.transferSummary.isRecipient = false;
				$rootScope.transferSummary.amount *= -1;
				for(i=0; i<$scope.user.recipient.length; i++) {
					if($scope.user.recipient[i].number == $scope.transfer.number) {
						$rootScope.transferSummary.isRecipient = true;
						break;
					}
				}
				$location.path('/account/transfer/success');
				$scope.$apply();
			}
		);
	};

	$scope.saveSms = function() {
		var promise = userService.update($scope.user);
		promise.then(function(user) {
			$scope.success = true;
		});
	};

	$scope.saveRecipient = function() {
		var recipient = {
			name: $rootScope.transferSummary.name,
			address: $rootScope.transferSummary.address,
			subAddress: $rootScope.transferSummary.subAddress,
			number: $rootScope.transferSummary.number
		};
		$scope.user.recipient.push(recipient);
		var promise = userService.update($scope.user);
		promise.then(function(user) {
			$scope.transferSummary = null;
			$location.path('/account/recipient');
			$scope.$apply();
		});
	};

	$scope.createRecipient = function() {
		$scope.user.recipient.push($scope.recipient);
		var promise = userService.update($scope.user);
		promise.then(function(user) {
			$location.path('/account/recipient');
			$rootScope.$on("$routeChangeSuccess", function(event, next, current) {
				next.scope.recipientCreateSuccess = true;
			});
		});
	};

	$scope.deleteRecipient = function(number) {
		var index = null;
		for (i = 0; i < $scope.user.recipient.length; i++) {
			if ($scope.user.recipient[i].number == number) {
				index = i;
				break;
			}
		}
		if (index != null) {
			$scope.user.recipient.splice(index, 1);
			var promise = userService.update($scope.user);
			promise.then(function(user) {
				$scope.success = true;
			});
		}
	};

	$scope.setRecipient = function() {
		$scope.transfer.name       = $scope.recipient ? $scope.recipient.name : '';
		$scope.transfer.address    = $scope.recipient ? $scope.recipient.address : '';
		$scope.transfer.subAddress = $scope.recipient ? $scope.recipient.subAddress : '';
		$scope.transfer.number     = $scope.recipient ? $scope.recipient.number : '';
	};





	$scope.lokaty = [
		{ label: 'Wybierz jedną z opcji', value: 0 },
		{ label: '„CArmelkowa lokata”. Lokata na 2 miesiące z oprocentowaniem 2% w skali roku', value: 1},
		{ label: '„Świnka-skarbonka-6”. Lokata na  6 miesięcy z oprocentowaniem 2,5% w skali roku', value: 2},
		{ label: '„Świnka-skarbonka-12”. Lokata na  12 miesięcy z oprocentowaniem 2,5% w skali roku', value: 3},
		{ label: '„Świnka-skarbonka-24”. Lokata na  24 miesięcy z oprocentowaniem 2,5% w skali roku', value: 4}
	];
	$scope.lokata.name = $scope.lokaty[0];

	$scope.createLokata = function() {

		$scope.user.lokaty = $scope.user.lokaty || [];

		if(parseFloat($scope.user.balance) >= parseFloat($scope.lokata.amount)) {
			$scope.user.lokaty.push($scope.lokata);
			$scope.user.balance = (parseFloat($scope.user.balance) - parseFloat($scope.lokata.amount)).toFixed(2);

			var promise = userService.update($scope.user);
			promise.then(function(user) {
				$location.path('/account/lista-lokat');
			});
		}
	};

	// $scope.saveLokata = function(index, newVal) {
	// 	$scope.user.lokaty[index].amount = newVal;
	// 	userService.update($scope.user);
	// };

	$scope.removeLokata = function(index) {
		angular.forEach($scope.user.lokaty, function (val, key) {
			var deleteLokata = confirm('Czy na pewno chcesz usunąć lokatę?');

			if(deleteLokata) {
				if(index == key) {
					$scope.user.balance = (parseFloat($scope.user.balance) + parseFloat($scope.user.lokaty[key].amount)).toFixed(2);
					$scope.user.lokaty.splice(key, 1);
					userService.update($scope.user);
				}
			}
		});
	};




	$scope.rachunki = [
		{ label: 'Wybierz jedną z opcji', value: 0 },
		{ label: 'CArmelkowy zysk z oprocentowaniem 3% w skali roku', value: 1},
		{ label: 'CArmelkowy zysk z oprocentowaniem 4% w skali roku', value: 2},
		{ label: 'CArmelkowy zysk z oprocentowaniem 5% w skali roku', value: 3},
		{ label: 'CArmelkowy zysk z oprocentowaniem 6% w skali roku', value: 4}
	];
	$scope.rachunek.name = $scope.rachunki[0];

	$scope.createRachunek = function() {

		$scope.user.rachunki = $scope.user.rachunki || [];

		// $scope.balanceError = false;
		var balanceWithCents = parseFloat($scope.user.balance);
		var newRachunek = parseFloat($scope.rachunek.amount);

		if(balanceWithCents >= newRachunek) {
			$scope.user.balance = (balanceWithCents - newRachunek).toFixed(2);
		} else {
			$scope.balanceError = true;
			return;
		}
		$scope.user.rachunki.push($scope.rachunek);
		var promise = userService.update($scope.user);
		promise.then(function(user) {
			$location.path('/account/rachunek-lista');
		});
	};

	$scope.removeRachunek = function(index) {
		angular.forEach($scope.user.rachunki, function (val, key) {
			var deleteRachunek = confirm('Czy na pewno chcesz usunąć rachunek?');

			if(deleteRachunek) {
				if(index == key) {
					var rachunekFloat = parseFloat($scope.user.rachunki[key].amount);
					if(rachunekFloat && rachunekFloat > 0) {
						$scope.user.rachunki.splice(key, 1);
						$scope.user.balance = (parseFloat($scope.user.balance) + rachunekFloat).toFixed(2);
						userService.update($scope.user);
					}
				}
			}
		});
	};




	$scope.kredyty = [
		{ label: 'Wybierz jedną z opcji', value: 0 },
		{ label: 'Kredyt na kwotę 100zł z oprocentowaniem 4% w ciągu 4 tygodni', value: 100, percentage: 4, numberOfWeeks: 4},
		{ label: 'Kredyt na kwotę 200zł z oprocentowaniem 4% w ciągu 4 tygodni', value: 200, percentage: 4, numberOfWeeks: 4},
		{ label: 'Kredyt na kwotę 300zł z oprocentowaniem 4% w ciągu 6 tygodni', value: 300, percentage: 4, numberOfWeeks: 6},
		{ label: 'Kredyt na kwotę 400zł z oprocentowaniem 5% w ciągu 8 tygodni', value: 400, percentage: 5, numberOfWeeks: 8},
		{ label: 'Kredyt na kwotę 500zł z oprocentowaniem 5% w ciągu 10 tygodni', value: 500, percentage: 5, numberOfWeeks: 10},
		{ label: 'Kredyt na kwotę 600zł z oprocentowaniem 7% w ciągu 12 tygodni', value: 600, percentage: 7, numberOfWeeks: 12},
		{ label: 'Kredyt na kwotę 700zł z oprocentowaniem 7% w ciągu 10 tygodni', value: 700, percentage: 7, numberOfWeeks: 10},
		{ label: 'Kredyt na kwotę 800zł z oprocentowaniem 8% w ciągu 18 tygodni', value: 800, percentage: 8, numberOfWeeks: 18},
		{ label: 'Kredyt na kwotę 900zł z oprocentowaniem 8% w ciągu 24 tygodni', value: 900, percentage: 8, numberOfWeeks: 24},
		{ label: 'Kredyt na kwotę 1000zł z oprocentowaniem 10% w ciągu 12 tygodni', value: 1000, percentage: 10, numberOfWeeks: 12}
	];
	$scope.kredyt.name = $scope.kredyty[0];



	$scope.createKredyt = function() {

		$scope.user.kredyty = $scope.user.kredyty || [];

		$scope.user.kredyty.push($scope.kredyt);
		$scope.user.balance = (parseFloat($scope.user.balance) + parseFloat($scope.kredyt.name.value)).toFixed(2);

		var promise = userService.update($scope.user);
		promise.then(function(user) {
			
			$location.path('/account/kredyt-lista');
		});
	};

	$scope.balanceLess = false;
	$scope.amountToMuch = false;





	// Counter

	$scope.odsetki = 0;
	$scope.tygodnie = 0;
	var stop;


	$scope.turnOnCounter = function() {
		if(angular.isDefined(stop)) return;
		console.log($scope);
		stop = $interval(function() {
			// console.log($scope.odsetki);
			// return;
			angular.forEach($scope.user.kredyty, function(kredyt, key) {
				// console.log(key);
				// return;
				if($scope.user.kredyty[key].name.numberOfWeeks) {
					console.log($scope.index);

					if(key == $scope.index){

					}

					if($scope.tygodnie < 24) {
						$scope.tygodnie += 1/$scope.user.kredyty.length;
						$scope.odsetki += 1/$scope.user.kredyty.length * $scope.user.kredyty[key].name.numberOfWeeks * $scope.user.kredyty[key].name.value * $scope.user.kredyty[key].name.percentage / 100;
					} else {
						$scope.turnOffCounter();
					}
				}
			});
		}, 1000);
	};

	$scope.turnOffCounter = function() {
		if(angular.isDefined(stop)) {
			$interval.cancel(stop);
			stop = undefined;
		}
	};

	$scope.resetCounter = function() {
		$scope.odsetki = 0;
	}

	$scope.$on('$destroy', function() {
		$scope.turnOffCounter();
	});
});



// app.directive('editable', function() {
// 	return {
// 		restrict: 'A',
// 		scope: {
// 			index: '@',
// 		},
// 		link: function(scope, el, atr, ctrl) {
// 			el.on('click', function() {
// 				if(el.html() == 'Edytuj kwotę') {
// 					el.parent().prev().focus();
// 					el.html('Zachowaj').attr('class', 'zachowaj-zmiany');
// 				} else {
// 					el.removeAttr('class', 'zachowaj-zmiany').attr('class', 'green');
// 					el.html('Edytuj kwotę');
// 				}
// 			});
// 		}
// 	};
// });



// app.directive('contenteditable', function() {
//     return {
//       restrict: 'A',
//       require: '?ngModel',
//       link: function(scope, element, attrs, ngModel) {
//         if(!ngModel) return;

//         ngModel.$render = function() {
//           element.html(ngModel.$viewValue || '');
//         };

//         element.on('blur keyup change', function() {
//           scope.$apply(read);
//         });
//         read();

//         function read() {
//           var html = element.html();
//           if( attrs.stripBr && html == '<br>' ) {
//             html = '';
//           }
//           ngModel.$setViewValue(html);
//         }

//         scope.$watch('isUpdated', function(newVal) {
// 			if(newVal) {
// 				element.next().on('click', function() {
// 					scope.saveLokata(scope.$index, newVal);
// 				});
// 			}
// 		});
//       }
//     };
// });
