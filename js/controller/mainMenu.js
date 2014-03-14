app.controller('mainMenu', function($scope) {

	$scope.menuLinks = [
		{ name: 'Konto', href: 'app.html#/account'},
		{ name: 'Lokata', href: 'app.html#/account/lokata'},
		{ name: 'Rachunek oszczędnościowy', href: 'app.html#/account/rachunek'},
		{ name: 'Kredyty', href: 'app.html#/account/kredyty'},
	];

	$scope.selectedIndex = 0;

	$scope.getClass= function(index) {
		if(index === $scope.selectedIndex) {
			return 'active';
		} else {
			return '';
		}
		console.log($scope.selectedIndex);
	};

	$scope.toggleSelect = function(index) {
		if(index === $scope.selectedIndex) {
			$scope.selectedIndex = 0;
		} else {
			$scope.selectedIndex = index;
		}
	};
});




