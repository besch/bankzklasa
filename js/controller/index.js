app.controller('index', ['$scope', 'userService', 'fileReader', function($scope, userService, fileReader) {
	console.debug($scope);
	$scope.user = {
		name: '',
		password: '',
		avatar: 'img/avatar.png',
		address: '',
		subAddress: '',
		phone: '',
		number: '31 1240 1075 2001 3850 0000 ' + Math.floor(Math.random() * 9999),
		// balance: '1000',
		balance: parseFloat(1000).toFixed(2),
		created: new Date().getTime(),
		updated: new Date().getTime(),
		current: true,
		transfers: [],
		recipient: []
	};

	var promise = userService.getAll();
	promise.then(function(users) {
		$scope.users = users;
		// wyloguj wszystkich
		for (var i = 0, user = users[i]; i < users.length; user = users[++i]) {
			user.quizDone = false;
			if (user.current === true) {
				user.current = false;
				user.updated = new Date().getTime();
				userService.update(user);
			}
		}
	});

	$scope.create = function(location) {
		var promise = userService.create($scope.user);
		// $scope.password
		promise.then(function(user) {
			document.location = location;
		});
	};

	$scope.login = function(id, password, location) {
		var promise = userService.get(id);
		promise.then(function(user) {

			$scope.wrongPass = false;

			if(password === user.password) {
				user.current = true;
				userService.update(user).then(function() {
					document.location = location;
				});
			}
			else {
				$scope.wrongPass = true;
			}

		}).then(function(user) {
			console.log(user);
		});
	};



	$scope.getFile = function() {
		fileReader.readAsDataUrl($scope.file, $scope).then(function(result) {
			$scope.user.avatar = result;
		});
	};

	$scope.selectedIndex = -1;

	$scope.toggleSelect = function(index) {
		$scope.wrongPass = false;
		if(index === $scope.selectedIndex) {
			$scope.selectedIndex = -1;
		} else {
			$scope.selectedIndex = index;
		}
	};

	$scope.getClass= function(index) {
		if(index === $scope.selectedIndex) {
			return 'selected';
		} else {
			return '';
		}
	};


	$scope.avatars = [
		{ name: '1', src: 'img/avatars/1.png'},
		{ name: '2', src: 'img/avatars/2.png'},
		{ name: '3', src: 'img/avatars/3.png'},
		{ name: '4', src: 'img/avatars/4.png'},
		{ name: '5', src: 'img/avatars/5.png'},
		{ name: '6', src: 'img/avatars/6.png'},
		{ name: '7', src: 'img/avatars/7.png'},
		{ name: '8', src: 'img/avatars/8.png'},
		{ name: '9', src: 'img/avatars/9.png'},
		{ name: '10', src: 'img/avatars/10.png'},
		{ name: '11', src: 'img/avatars/11.png'},
		{ name: '12', src: 'img/avatars/12.png'},
		{ name: '13', src: 'img/avatars/13.png'},
		{ name: '14', src: 'img/avatars/14.png'}
	];



	$scope.selectedImg = 14;

	$scope.setAvatar = function(index) {
		
		// $scope.selectedImgClass = '';

		if(index === $scope.selectedImg) {
			$scope.selectedImg = 14;
		} else {
			$scope.selectedImg = index;
		}
		$scope.user.avatar = $scope.avatars[$scope.selectedImg].src;
	};

	$scope.setAvatarClass = function(index) {
		if(index === $scope.selectedImg) {
			return 'selectedImg';
		} else {
			return '';
		}
	};
}]);
