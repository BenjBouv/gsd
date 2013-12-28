var gsd = angular.module('gsd')

// This file is very inspired by https://github.com/ednapiranha/persona-express-angular/

gsd.controller('LoginController', function($scope, $http, $rootScope) {
    $rootScope.isAuthenticated = false;

    var resetUser = function () {
        $rootScope.isAuthenticated = false;
        localStorage.removeItem('persona.email');
        delete $rootScope.user;
    };

    // Synchronize Angular and Persona
    if (localStorage.getItem('persona.email')) {
        if (!$rootScope.user) {
            $http({
                url: '/login',
                method: 'GET'
            }).success(function (data) {
                $rootScope.isAuthenticated = true;
                $rootScope.user = data.email;
            }).error(function (data) {
                localStorage.removeItem('persona.email')
                console.log('Login failed because ' + data);
            });
        }
    }

    $scope.login = function() {
        navigator.id.get(function (assertion) {
            if (!assertion) {
                console.log('No assertion provided');
                return;
            }

            $http({
                url: '/persona/verify',
                method: 'POST',
                data: { assertion: assertion }
            }).success(function (data) {
                if (data.status === 'okay') {
                    $http({
                        url: '/login',
                        method: 'GET'
                    }).success(function (data) {
                        $rootScope.isAuthenticated = true;
                        $rootScope.user = data.email;
                        localStorage.setItem('persona.email', data.email);
                    }).error(function (data) {
                        resetUser();
                        console.log('Login failed');
                    });
                } else {
                    resetUser();
                    console.log('Login failed');
                }
            }).error(function (data) {
                resetUser();
                console.log('Login failed');
            });
        });
    };

    $scope.logout = function() {
        $http({
            url: '/persona/logout',
            method: 'POST'
        }).success(function (data) {
            if (data.status === 'okay') {
                resetUser();
            } else {
                console.log('Logout failed because ' + data.reason);
            }
        }).error(function (data) {
            console.log('error logging out: ', data);
        })
    };
});
