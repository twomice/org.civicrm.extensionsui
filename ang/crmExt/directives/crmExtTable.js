(function (angular, $, _) {
  angular.module('crmExt').directive('crmExtTable', function(dialogService) {
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
          $scope.displayedStatuses = ['disabled', 'disabled-missing', 'installed', 'installed-missing'];
        }
        else {
          $scope.displayedStatuses = ['remote', 'uninstalled'];
        }

        $scope.hasDisplayStatus = function (extension) {
          return ($scope.displayedStatuses.indexOf(extension.status) > -1);
        };

        $scope.showDetail = function showDetail(extension) {
          var dialogModel = {
            dataSource: ($scope.extContext === 'installed' ? 'local' : 'remote'),
            extension: extension
          };
          var options = CRM.utils.adjustDialogDefaults({
            autoOpen: false,
            title: extension.name
          });
          dialogService.open('crmExt-extDetail', '~/crmExt/ExtDetailCtrl.html', dialogModel, options);
        };
      }]
    };
  });
})(angular, CRM.$, CRM._);