(function (angular, $, _) {
  angular.module('crmExt').directive('crmExtTable', function() {
    return {
      restrict: 'E',
      scope: {
        extContext: '=',
        extData: '='
      },
      templateUrl: '~/crmExt/directives/crmExtTable.html',
      controller: ['$scope', '$http', function crmExtTable($scope, $http) {
        var ts = $scope.ts = CRM.ts('crmExt');

        $scope.location = ($scope.extContext == 'installed' ? 'local' : 'remote');
        $scope.displayedStatuses = ($scope.extContext == 'installed' ? 'installed' : 'remote');
      }]
    };
  });
})(angular, CRM.$, CRM._);