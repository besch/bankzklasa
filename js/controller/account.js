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
		$scope.lokata.amount = parseFloat($scope.lokata.amount.replace(' PLN', ''));

		$scope.user.lokaty.push($scope.lokata);
		var promise = userService.update($scope.user);
		promise.then(function(user) {
			$location.path('/account/lista-lokat');
		});
	};

	$scope.saveLokata = function(index, newVal) {
		$scope.user.lokaty[index].amount = newVal;
		userService.update($scope.user);
	};

	$scope.removeLokata = function(index) {
		angular.forEach($scope.user.lokaty, function (val, key) {
			var deleteLokata = confirm('Czy na pewno chcesz usunąć lokatę?');

			if(index == key) {
				if(deleteLokata) {
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
		$scope.user.balance = (parseFloat($scope.user.balance) + parseFloat($scope.kredyt.name.value)).toFixed(2);

		var promise = userService.update($scope.user);
		promise.then(function(user) {
			
			$location.path('/account/kredyt-lista');
		});
	};

	$scope.balanceLess = false;
	$scope.amountToMuch = false;


});


app.directive('clickToEdit', ['userService', function(userService) {
	return {
		restrict: 'A',
		require: '?ngModel',
		replace: true,
		template: 	'<div class="align-left">' +
						'<div ng-hide="viewable.editorEnabled">' +
							'<a ng-click="enableEditor()" class="green pointer">Spłać kredyt</a>' +
						'</div>' +
						'<div ng-show="viewable.editorEnabled">' +
							'<input ng-model="viewable.editableValue" size="10">' +
							'<a ng-click="save()" class="green pointer">Spłać</a>  ' +
							'<a ng-click="disableEditor()" class="red pointer">Anuluj</a>' +
						'</div>' +
					'</div>',
		scope: {
			amountValue: '=clickToEdit',
		},
		controller: function($scope) {
			$scope.viewable = {
				editableValue: $scope.amountValue,
				editorEnabled: false
			};

			$scope.enableEditor = function() {
				$scope.viewable.editorEnabled = true;
				$scope.viewable.editableValue = $scope.amountValue;
			};

			$scope.disableEditor = function() {
				$scope.viewable.editorEnabled = false;
			};

			$scope.save = function() {


				console.log('$scope.$parent.amountToMuch ' + $scope.$parent.amountToMuch);
				console.log('$scope.user.balance ' + $scope.$parent.user.balance);
				console.log('viewable.editableValue ' + $scope.viewable.editableValue);
				console.log('$scope.user.kredyty[$scope.index].value ' + $scope.$parent.user.kredyty[$scope.$parent.$index].name.value);
				// console.log('$scope.amountValue ' + $scope.amountValue);
				// return;

				if(parseFloat($scope.viewable.editableValue) > parseFloat($scope.$parent.user.balance)) {
					return $scope.$parent.balanceLess = true;
				} 
				else {
					if(parseFloat($scope.viewable.editableValue) > parseFloat($scope.$parent.user.kredyty[$scope.$parent.$index].name.value)) {
						return $scope.$parent.amountToMuch = true;
					}
					else if(parseFloat($scope.viewable.editableValue) < parseFloat($scope.$parent.user.kredyty[$scope.$parent.$index].name.value)) {
						$scope.amountValue = $scope.viewable.editableValue;
						$scope.disableEditor();

						$scope.$parent.user.kredyty[$scope.$parent.$index].name.value = (parseFloat($scope.$parent.user.kredyty[$scope.$parent.$index].name.value) - parseFloat($scope.viewable.editableValue)).toFixed(2);
						$scope.$parent.user.balance = (parseFloat($scope.$parent.user.balance) - parseFloat($scope.viewable.editableValue)).toFixed(2);
						userService.update($scope.$parent.user);
					}
					else {
						$scope.$parent.user.kredyty.splice($scope.index, 1);
						$scope.$parent.user.balance = (parseFloat($scope.$parent.user.balance) - parseFloat($scope.viewable.editableValue)).toFixed(2);
						userService.update($scope.$parent.user);
					}
				}
			};
		},
		link: function(scope, element, attr, ngModel) {
			if(!ngModel) return;

			scope.$watch('viewable.editableValue', function(newVal) {
				if(newVal)
					scope.viewable.editableValue = newVal;
			});
		}
	};
}]);


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
