var x = require('xon')
  , proto = require('./proto')

module.exports = function (document) {
  var AppName = 'MyApp'
  var app = angular.module(AppName, [])
    .factory('getData', function () {
      return proto.getData
    })
    .controller('MainController', ['$scope', 'getData', function ($scope, getData) {
      $scope.loadingData = true
      getData(function (err, data, cached) {
        $scope.loadingData = false
        for (var name in data) {
          if (!name.match(/^[a-zA-Z0-9_-]+$/)) continue;
          $scope[name] = data[name]
        }
        proto.init($scope, app)
        if (!cached) $scope.$digest()
      })
    }])

  angular.bootstrap(document.getElementById("main"), [AppName])

  return AppName
}
