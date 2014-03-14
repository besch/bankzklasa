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
});
