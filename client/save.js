




module.exports = function (angular, manager) {
  var app = angular.module('SaveApp', [])
  app.controller('SaveController', ['$scope', function ($scope) {
    $scope.name = 'Newsies'
    $scope.save = function () {
      
    }
  }])
}

