(function(angular, $, _) {
  // Declare a list of dependencies.
  angular.module('crmExt', [
    'crmUi', 'crmUtil', 'ngRoute', 'dialogService'
  ])
    // Make utilities globally available in the app
    .run(function($rootScope) {
      $rootScope.ts = CRM.ts('org.civicrm.extensionsui');
    });
})(angular, CRM.$, CRM._);
