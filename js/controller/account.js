app.controller('account', function($scope, $rootScope, userService, $location) {
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

		// console.log($scope.user.lokaty);
		// angular.forEach($scope.user.lokata.name, function(name) {
			// if(name != $scope.lokata.name) {
				$scope.user.lokaty.push($scope.lokata);
				var promise = userService.update($scope.user);
				promise.then(function(user) {
					$location.path('/account/lista-lokat');
					// $rootScope.$on('$routeChangeSuccess', function(event, next, current) {
					// 	next.scope.lokataCreateSuccess = true;
					// });
				});
				// $scope.lokata = null;
		// 	}
		// });
	};

	$scope.saveLokata = function(index, newVal) {
				$scope.user.lokaty[index].amount = newVal;
				var promise = userService.update($scope.user);
				promise.then(function(user) {
					// console.log('saved');
				});
	};

	$scope.removeLokata = function(index) {
		angular.forEach($scope.user.lokaty, function (val, key) {
			if(index == key) {
				$scope.user.lokaty.splice(key, 1);
				userService.update($scope.user);
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

		// angular.forEach($scope.user.lokata.name, function(name) {
			// if(name != $scope.lokata.name) {
				$scope.balanceError = false;
				var balanceWithCents = parseFloat($scope.user.balance);
				var newRachunek = parseFloat($scope.rachunek.amount.replace(' PLN', ''));
				// console.log(newRachunek);
				// return;

				if(balanceWithCents > newRachunek) {
					$scope.user.balance = balanceWithCents - newRachunek;
				} else {
					$scope.balanceError = true;
					return;
				}

				// if(parseInt($scope.user.balance) - )
					$scope.user.rachunki.push($scope.rachunek);
					var promise = userService.update($scope.user);
					promise.then(function(user) {
						$location.path('/account/rachunek-lista');
						// $rootScope.$on('$routeChangeSuccess', function(event, next, current) {
						// 	next.scope.lokataCreateSuccess = true;
						// });
					});
				// $scope.lokata = null;
		// 	}
		// });
	};

	// $scope.saveLokata = function(index, newVal) {
	// 	$scope.user.rachunki[index].amount = newVal;
	// 	var promise = userService.update($scope.user);
	// 	promise.then(function(user) {
	// 		// console.log('saved');
	// 	});
	// };

	$scope.removeRachunek = function(index) {
		angular.forEach($scope.user.rachunki, function (val, key) {
			if(index == key) {

				var rachunekFloat = parseFloat($scope.user.rachunki[key].amount);

				if(rachunekFloat && rachunekFloat > 0) {
					$scope.user.rachunki.splice(key, 1);
					userService.update($scope.user)
						.then(function() {
							$scope.user.balance += rachunekFloat;
						});
				}
			}
		});
	};





	$scope.kredyty = [
		{ label: 'Wybierz jedną z opcji', value: 0 },
		{ label: 'Kredyt na kwotę 100zł z oprocentowaniem 4%', value: 100},
		{ label: 'Kredyt na kwotę 200zł z oprocentowaniem 4%', value: 200},
		{ label: 'Kredyt na kwotę 300zł z oprocentowaniem 4%', value: 300},
		{ label: 'Kredyt na kwotę 400zł z oprocentowaniem 4%', value: 400},
		{ label: 'Kredyt na kwotę 500zł z oprocentowaniem 4%', value: 500},
		{ label: 'Kredyt na kwotę 600zł z oprocentowaniem 4%', value: 600},
		{ label: 'Kredyt na kwotę 700zł z oprocentowaniem 4%', value: 700},
		{ label: 'Kredyt na kwotę 800zł z oprocentowaniem 4%', value: 800},
		{ label: 'Kredyt na kwotę 900zł z oprocentowaniem 4%', value: 900},
		{ label: 'Kredyt na kwotę 1000zł z oprocentowaniem 4%', value: 1000}
	];
	$scope.kredyt.name = $scope.kredyty[0];



	$scope.createKredyt = function() {

		$scope.user.kredyty = $scope.user.kredyty || [];

		$scope.user.kredyty.push($scope.kredyt);
		var promise = userService.update($scope.user);
		promise.then(function(user) {
			$scope.user.balance += $scope.kredyt.name.value;
			$location.path('/account/kredyt-lista');
		});
	};

	$scope.payOffCredit = function(index) {

	}


});


app.directive('clickToEdit', function() {
	return {
		restrict: 'A',
		replace: true,
		require: 'ngModel',
		template: 	'<td class="width40Percent align-left">' +
						'<div ng-hide="viewable.editorEnabled">' +
							'some value' + 
							'<a ng-show="enableEditor()">Spłać kredyt</a>' +
						'</div>' +
						'<div ng-show="viewable.editorEnabled">' +
							'<input ng-model="viewable.editableValue">' +
							'<a href="#" ng-click="save()">Spłać</a>  ' +
							'<a ng-click="disableEditor()">Anuluj</a>' +
						'</div>' +
						// '<input type="number" ng-model="payOffAmount" placeholder="Kwota" />' +
						// '<a class="red" href="" ng-click="payOffCredit($index)">Spłać kredyt</a>' +
					'</td>',
		scope: {
			value: '=clickToEdit',
		},
		controller: function($scope) {
			$scope.viewable = {
				editableValue: $scope.value,
				editorEnabled: false
			};

			$scope.enableEditor = function() {
				$scope.viewable.editorEnabled = true;
				$scope.viewable.editableValue = $scope.value;
			};

			$scope.disableEditor = function() {
				$scope.viewable.editorEnabled = false;
			};

			$scope.save = function() {
				$scope.value = $scope.viewable.editableValue;
				$scope.disableEditor();
			};
		},
	};
});


app.directive('editable', function() {
	return {
		restrict: 'A',
		scope: {
			index: '@',
		},
		link: function(scope, el, atr, ctrl) {
			el.on('click', function() {
				if(el.html() == 'Edytuj kwotę') {
					el.parent().prev().focus();
					el.html('Zachowaj').attr('class', 'zachowaj-zmiany');
				} else {
					el.removeAttr('class', 'zachowaj-zmiany').attr('class', 'green');
					el.html('Edytuj kwotę');
				}
			});
		}
	};
});



app.directive('contenteditable', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        if(!ngModel) return;

        ngModel.$render = function() {
          element.html(ngModel.$viewValue || '');
        };

        element.on('blur keyup change', function() {
          scope.$apply(read);
        });
        read();

        function read() {
          var html = element.html();
          if( attrs.stripBr && html == '<br>' ) {
            html = '';
          }
          ngModel.$setViewValue(html);
        }

        scope.$watch('isUpdated', function(newVal) {
			if(newVal) {
				element.next().on('click', function() {
					scope.saveLokata(scope.$index, newVal);
				});
			}
		});
      }
    };
});
