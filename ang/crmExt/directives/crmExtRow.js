(function (angular, $, _) {
  angular.module('crmExt').directive('crmExtRow', function() {
    return {
      restrict: 'A',
      scope: {
        extContext: '=',
        extData: '='
      },
      templateUrl: '~/crmExt/directives/crmExtRow.html',
      controller: ['$scope', '$http', function crmExtRow($scope, $http) {
      }]
    };
  });
})(angular, CRM.$, CRM._);