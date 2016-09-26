(function(angular, $, _) {

  
  angular.module('extensionsui').config(function($routeProvider) {
      $routeProvider.when('/extensions', {
        controller: 'ExtensionsuicrmExt',
        templateUrl: '~/extensionsui/crmExt.html',

        // If you need to look up data when opening the page, list it out
        // under "resolve".
        resolve: {
          apiLocalExtensions: function(crmApi) {
            return crmApi('Extension', 'get');
          }
        }
      });
    }
  );

  // The controller uses *injection*. This default injects a few things:
  //   $scope -- This is the set of variables shared between JS and HTML.
  //   crmApi, crmStatus, crmUiHelp -- These are services provided by civicrm-core.
  //   apiLocalExtensions -- The current contact, defined above in config().
  angular.module('extensionsui').controller('ExtensionsuicrmExt', function($scope, crmApi, crmStatus, crmUiHelp, apiLocalExtensions) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('extensionsui');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/extensionsui/crmExt'}); // See: templates/CRM/extensionsui/crmExt.hlp

    // We have apiLocalExtensions available in JS. We also want to reference it in HTML.
    $scope.apiLocalExtensions = apiLocalExtensions;
    console.log($scope.apiLocalExtensions.values, '$scope.apiLocalExtensions');

    $scope.save = function save() {
      return crmStatus(
        // Status messages. For defaults, just use "{}"
        {start: ts('Saving...'), success: ts('Saved')},
        // The save action. Note that crmApi() returns a promise.
        crmApi('Contact', 'create', {
          id: apiLocalExtensions.id,
          first_name: apiLocalExtensions.first_name,
          last_name: apiLocalExtensions.last_name
        })
      );
    };
  });

})(angular, CRM.$, CRM._);
