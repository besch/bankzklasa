app.controller('quiz', ['$scope', 'userService', function($scope, userService) {
	$scope.save = function(money) {
		$scope.$apply(function() {
			$scope.user.quizDone = true;
			$scope.user.balance = parseInt($scope.user.balance) + money;
		});

		var transfer = {
			date:       new Date().getTime(),
			title:      'Nagroda za rozwiązanie quizu',
			subTitle:   '',
			name:       $scope.defined.name,
			address:    $scope.defined.address,
			subAddress: $scope.defined.subAddress,
			number:     $scope.defined.number,
			amount:     money,
			balance:    $scope.user.balance,
		};
		$scope.user.transfers.push(transfer);
		userService.update($scope.user, null);
	};
}]);
