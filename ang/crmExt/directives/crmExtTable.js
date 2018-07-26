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

        if ($scope.extContext === 'installed') {
          $scope.displayedStatuses = ['disabled', 'disabled-missing', 'installed'];
        }
        else {
          $scope.displayedStatuses = ['remote', 'uninstalled'];
        }

        $scope.hasDisplayStatus = function (extension) {
          return ($scope.displayedStatuses.indexOf(extension.status) > -1);
        };
      }]
    };
  });
})(angular, CRM.$, CRM._);