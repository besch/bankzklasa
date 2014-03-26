app.directive('odsetkiDirective', ['userService', '$interval', function (userService, $interval) {
	return {
		restrict: 'A',
		link: function(scope, elm, attr) {

			// console.log(scope.odsetki);

			var temp = scope.k.name;
			// console.log(temp);
			function counter() {
				for(var i = 0; i < temp.length; i++) {
					scope.odsetki = temp[i].value * temp[i].percentage / 100;
				}
			}

			// scope.$watch(attr.odsetkiDirective, function(value) {

			// });

			var stop = $interval(counter, 1000);

			elm.bind('$destroy', function() {
				$interval.cancel(stop);
			});

			// scope.$watch(scope.odsetki, function(newVal) {
			// 	if(newVal) {
			// 		console.log(newVal);
			// 		counter();
			// 	}
			// });
		}
	};
}]);