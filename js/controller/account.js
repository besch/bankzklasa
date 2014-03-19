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
		console.log($scope.user.lokaty);
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



$scope.rachunek = [
	{ label: 'Wybierz jedną z opcji', value: 0 },
	{ label: 'CArmelkowy zysk z oprocentowaniem 3% w skali roku', value: 1},
	{ label: 'CArmelkowy zysk z oprocentowaniem 4% w skali roku', value: 2},
	{ label: 'CArmelkowy zysk z oprocentowaniem 5% w skali roku', value: 3},
	{ label: 'CArmelkowy zysk z oprocentowaniem 6% w skali roku', value: 4}
];
$scope.rachunek.name = $scope.rachunek[0];