app.directive('clickToEdit', ['userService', function(userService) {
	return {
		restrict: 'A',
		require: '?ngModel',
		replace: true,
		template: 	'<form name="form" class="align-left">' +
						'<div ng-hide="viewable.editorEnabled">' +
							'<a ng-click="enableEditor()" class="green pointer">Spłać kredyt</a>' +
						'</div>' +
						'<div ng-show="viewable.editorEnabled">' +
							'<input name="payOffVal" ng-model="viewable.editableValue" float-field size="5">' +
							'<a ng-click="form.$valid ? save() : null" class="green pointer">Spłać</a>  ' +
							'<a ng-click="disableEditor()" class="red pointer">Anuluj</a>' +
						'</div>' +
						'<span class="error font-12" ng-show="form.payOffVal.$error.float">Przykładowa wartość pola to "999.99"</span>' +
						'<span class="error font-12" ng-show="balanceLess">Podana kwota jest większa od salda twojego konta.</span>' +
						'<span class="error font-12" ng-show="amountToMuch">Podana kwota jest większa od kwoty do spłacenia.</span>' +
					'</form>',
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
				$scope.form.payOffVal.$error.float = false;
				$scope.balanceLess = false;
				$scope.amountToMuch = false;
			};

			$scope.save = function() {

				if(parseFloat($scope.viewable.editableValue) > parseFloat($scope.$parent.user.balance)) {
					return	$scope.balanceLess = true;
				} 
				else {
					if(parseFloat($scope.viewable.editableValue) > parseFloat($scope.$parent.user.kredyty[$scope.$parent.$index].name.value)) {
						return $scope.amountToMuch = true;
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