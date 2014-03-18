var app = angular.module('app', ['ngRoute'], function() {});

app.run(function($rootScope, $location, userService) {
	var d = new Date();
	$rootScope.defined = {
		date:       d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear(),
		number:     '02 1940 1076  1234 5678 0000 0000',
		name:       'Credit Agricole Bank Polska S.A.',
		address:    'pl. Orląt Lwowskich 1',
		subAddress: '53-605 Wrocław'
	};
	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		var promise = userService.getCurrent();
		promise.then(function(user) {
			if (user) {
				$rootScope.user = user;
			} else {
				document.location = 'index.html';
			}
		},
		function(reason) {
			document.location = 'index.html';
		});
		if ($location.path() === '/account/transfer/success' && $rootScope.transferSummary === undefined) {
			$location.path('/account');
		}
	});
});

// routing
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/account', {
		templateUrl: 'partials/account.html'
	}).when('/account/history', {
		templateUrl: 'partials/history.html'
	}).when('/account/transfer', {
		templateUrl: 'partials/transfer.html'
	}).when('/account/transfer/success', {
		templateUrl: 'partials/transfer-success.html'
	}).when('/account/recipient', {
		templateUrl: 'partials/recipient.html'
	}).when('/account/recipient-add', {
		templateUrl: 'partials/recipient-add.html'
	}).when('/account/phone', {
		templateUrl: 'partials/phone.html'
	}).when('/quiz', {
		templateUrl: 'partials/quiz.html'
	}).when('/account/lokata', {
		templateUrl: 'partials/lokata.html'
	}).when('/account/rachunek', {
		templateUrl: 'partials/rachunek.html'
	}).when('/account/kredyty', {
		templateUrl: 'partials/kredyty.html'
	}).when('/account/poczta', {
		templateUrl: 'partials/poczta.html'
	}).when('/account/zasady_bezpieczenstwa', {
		templateUrl: 'partials/zasady_bezpieczenstwa.html'
	}).when('/account/zaloz-lokate', {
		templateUrl: 'partials/zaloz-lokate.html'
	}).when('/account/lista-lokat', {
		templateUrl: 'partials/lista-lokat.html'
	}).otherwise({
		redirectTo: '/account'
	});
}]);

/****
USER SERVICE
****/
app.factory('userService', function($rootScope, $q) {

	var service = {};
	
	var db = Pouch('idb://account', {auto_compaction: true});

	/*
	Zwraca polaczenie z baza account
	*/
	service.getDB = function() {
		return db;
	};

	/**
	 * Zwraca uzytkownikow
	 */
	service.getAll = function() {
		var deferred = $q.defer();
		db.allDocs({include_docs: true}, function(err, response) {
			if (err) {
				deferred.reject(err);
			} else {
				var users = [];
				for (var i = 0, row; i < response.rows.length; ++i) {
					row = response.rows[i];
					if (row.doc) users.push(row.doc);
				}
				deferred.resolve(users);
			}
		});
		return deferred.promise;
	};


	/**
	 * Zwraca zalogowanego uzytkownika
	 */
	service.getCurrent = function() {
		var deferred = $q.defer();

		db.query(function(doc) {
			if (doc.current) emit(doc._id, doc);
		}, 
		function(err, res) {
			if (err || res.total_rows !== 1) {
				deferred.reject(err);
			} else {
				deferred.resolve(res.rows[0].value);
			}
		});
		return deferred.promise;
	};

	/**
	 * Zwraca uzytkownika po id
	 * @param {string} id
	 * @returns {$q@call;defer.promise}
	 */
	service.get = function(id) {
		var deferred = $q.defer();
		db.get(id, function(err, doc) {
			err? deferred.reject(err) : deferred.resolve(doc);
		});
		return deferred.promise;
	};

   /**
	* Stworzenie uzytkownika
	* @param {Object} account
	* @param {function} callback
	* @returns {$q@call;defer.promise}
	*/
	service.create = function(account, callback) {
		var deferred = $q.defer();
		
		account._id = account.name.toLowerCase();
		// account.password = account.password;

		db.post(account, function(err, doc) {
			if (err) {
				deferred.reject(err);
			}
			else {
				deferred.resolve(doc);
			}
		});
		return deferred.promise;
	};

	/**
	 * Edycja uzytkownika
	 * @param {Object} user
	 * @returns {Promise}
	 */
	service.update = function(user) {
		var deferred = $q.defer();

		db.get(user._id, function(err, lastAccount) {
			if (err) {
				deferred.reject(err); return; 
			}
			user._rev = lastAccount._rev;
			db.put(user, function(err, updatedAccount) {
				if (err) {
					deferred.reject(err);
				} else {
					//db.compact();
					deferred.resolve(updatedAccount);
				}
			});
		});

		return deferred.promise;
	};

	return service;
});

/****
AMOUNT DIRECTIVE
****/
var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;
app.directive('amount', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
			ctrl.$setValidity('min', true);
         ctrl.$setValidity('max', true);
			ctrl.$setValidity('float', true);

			if(FLOAT_REGEXP.test(viewValue)) {
				viewValue = parseFloat(viewValue.toString().replace(',', '.'));
        		if(viewValue < 1) {
          		ctrl.$setValidity('min', false);
							return viewValue;
        		}else if (viewValue > parseFloat(scope.user.balance)) {
         		ctrl.$setValidity('max', false);
          		return viewValue;
        		}
			}
			else {
				ctrl.$setValidity('float', false);
          	return undefined;
			}
			return viewValue;
      });
    }
  };
});

app.directive('uniqueProperty', function() {
	return {
		require: 'ngModel',
		restrict: 'A',
		link: function(scope, element, attrs, model) {
			var pos = attrs.uniqueProperty.lastIndexOf("."), path, prop; 
			if (pos < 0) {return;}
			path = attrs.uniqueProperty.substring(0, pos);
			prop = attrs.uniqueProperty.substring(pos+1);
			element.bind('blur', function (e) {
				var val = element.val(), isUnique = true;
				angular.forEach(scope.$eval(path), function(item) {
					if (item[prop] === val) {
						isUnique = false;
					}
					model.$setValidity('unique', isUnique);
				});
			});
		}
	};
});


/****
NEW USER VALIDATOR
****/
app.directive('login', function(userService) { return {
	require: 'ngModel',

	link: function(scope, elm, attrs, ctrl) {
		ctrl.$parsers.unshift(function(viewValue) {
			ctrl.$setValidity('min', true);
			ctrl.$setValidity('max', true);
			ctrl.$setValidity('unique', true);

			if (elm.val().length > 2 && elm.val().length <= 25) {
				elm.on('blur', function(e) {
					scope.$apply(function() {
						userService.getAll(function(users) {
							for (i = 0; i < users.length; i++) {
								if (users[i].name == elm.val()) {
									ctrl.$setValidity('unique', false);
									return;
								}
							}
						});
					});
				});
				return viewValue;
			}
			else if (elm.val().length <= 2) {
				ctrl.$setValidity('min', false);
			}
			else {
				ctrl.$setValidity('max', false);
			}
			return viewValue;
		});
	}
}; });


app.directive('password', function() {
	return {
		require: 'ngModel',

		link: function(scope, el, attr, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				ctrl.$setValidity('pass_min', true);
				ctrl.$setValidity('one_capital_letter', true);
				ctrl.$setValidity('one_digit', true);

				if(viewValue.length < 8) {
					ctrl.$setValidity('pass_min', false);
				} else if(/[A-Z]/.test(viewValue)) {
					ctrl.$setValidity('one_capital_letter', true);
				} else if(/\d/.test(viewValue)) {
					ctrl.$setValidity('one_digit', false);
				}
				return viewValue;
			});
		}
	};
});


app.filter('reverse', function() {
  return function(items) {
		if(items !== undefined) {
    	return items.reverse();
		}
  };
});

/****
FILE UPLOAD
****/
app.directive("ngFileSelect",function(){
	return {
		link: function($scope, el){
     		el.bind("change", function(e){
         	$scope.file = (e.srcElement || e.target).files[0];
					if("image/png, image/gif, image/jpeg".indexOf($scope.file.type) != -1) {				
						if($scope.file.size < 2040740) {			 //2MB			
							$scope.getFile();				
						}
						else {
							el.next().next().show();
						}	
					}
					else {
						el.next().show();
					}
      	})
 	 	}  
  }
});


app.directive('phoneMask', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, el, attrs, ctrl) {
			el.mask('+48 999 999 999');
			el.on('keyup', function() {
				scope.$apply(function() {
					ctrl.$setViewValue(el.val());
				});
			});
		}
	};
});

app.directive('bankMask', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, el, attrs, ctrl) {
			el.mask('99 9999 9999 9999 9999 9999 9999');
			el.on('keyup', function() {
				scope.$apply(function() {
					ctrl.$setViewValue(el.val());
				});
			});
		}
	};
});

app.directive('moneyMask', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, el, attr, ctrl) {
			el.mask('999.999,99');
			el.on('keyup', function() {
				scope.$apply(function() {
					ctrl.$setViewValue(el.val());
				});
			});
		}
	};
});

app.factory('fileReader', ['$q', '$log', function($q, $log) {

   var onLoad = function(reader, deferred, scope) {
       return function () {
      	scope.$apply(function () {
          	deferred.resolve(reader.result);
      	});
       };
   };
 
   var onError = function (reader, deferred, scope) {
       return function () {
      	scope.$apply(function () {
          deferred.reject(reader.result);
      	});
       };
   };
 
   var onProgress = function(reader, scope) {
       return function (event) {
      	scope.$broadcast("fileProgress",
          {
         	total: event.total,
         	loaded: event.loaded
          });
       };
   };
 
   var getReader = function(deferred, scope) {
       var reader = new FileReader();
       reader.onload = onLoad(reader, deferred, scope);
       reader.onerror = onError(reader, deferred, scope);
       reader.onprogress = onProgress(reader, scope);
       return reader;
   };
 
   var readAsDataURL = function (file, scope) {
       var deferred = $q.defer();
        
       var reader = getReader(deferred, scope);    
       reader.readAsDataURL(file);
        
       return deferred.promise;
   };
 
   return {
       readAsDataUrl: readAsDataURL  
   };

}]);

app.directive('bankColorizedHeader', function() {
	return function($scope, element, attrs) {
		var html = "";
		$(element.text().split('')).each(function (i, char) {
			html += (' \t\n\r\v'.indexOf(char) < 0)? "<em>" + char + "</em>" : char;
		});
		$(element).html(html).addClass("bankColorizedHeader").attr("data-bank-colorized-header", null);
	};
});

app.directive('bankMenu', ['$location', function(location) {
	return {
		restrict: 'A',
		template: '<ul>' +
			'<li><a href="app.html#/account">Informacje o koncie</a></li>' +
			'<li><a href="app.html#/account/transfer">Przelewy</a></li>' +
			'<ul>'+
				'<li><a href="app.html#/account/transfer">Wykonaj przelew</a></li>'+
				'<li><a href="app.html#/account/recipient">Odbiorcy</a></li>'+
			'</ul>'+
			'<li><a href="app.html#/account/history">Historia</a></li>' +
			'<li><a href="app.html#/account/phone">Doładowania telefonu</a></li>' +
			'</ul>',
		link: function(scope, element, attrs, controller) {
			element.attr('id', 'menu');
			$('a[href$="'+location.path()+'"]', element).parent().each(function(i, el) {
				if (!$(el).next('ul')[0]) $(el).addClass('active');
			});
		}
	};
}]);


app.directive('lokataMenu', ['$location', function(location) {
	return {
		restrict: 'A',
		template: '<ul>' + 
		'<li><a href="app.html#/account/zaloz-lokate">Załóż lokatę</a></li>' +
		'<li><a href="app.html#/account/lista-lokat">Lista lokat</a></li>' +
		'</ul>',
		link: function(scope, element, atr, ctrl) {
			element.attr('id', 'menu');
			$('a[href$="'+location.path()+'"]', element).parent().each(function(i, el) {
				if (!$(el).next('ul')[0]) $(el).addClass('active');
			});
		}
	};
}]);