(function(angular, $, _) {

  angular.module('crmExt').config(function ($routeProvider) {
      $routeProvider.when('/extensions', {
        controller: 'ExtensionsuicrmExt',
        templateUrl: '~/crmExt/crmExt.html',

        // If you need to look up data when opening the page, list it out
        // under "resolve".
      resolve: {
        extensions: function (crmApi, Extension) {
          return crmApi('Extension', 'getCoalesced').then(function (data) {
            return _.map(data.values, function (ext) {
              return new Extension(ext);
            });
          });
        }
      }
      });
    }
  );

  // The controller uses *injection*. This default injects a few things:
  //   $scope -- This is the set of variables shared between JS and HTML.
  //   crmApi, crmStatus, crmUiHelp -- These are services provided by civicrm-core.
  //   dialogService -- provided by civicrm.
  //   $q, $timeout -- provided by angular.
  angular.module('crmExt').controller('ExtensionsuicrmExt', function ($scope, crmApi, crmStatus, crmUiHelp, dialogService, $q, $timeout, extensions, Extension) {
    $scope.extensions = extensions;

    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('crmExt');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/crmExt/crmExt'}); // See: templates/CRM/crmExt/crmExt.hlp

    $scope.addNewHelpText = ts('These extensions are compatible with your version of CiviCRM and have passed a quality review by the CiviCRM community. You may also want to check the <a href="https://civicrm.org/extensions">CiviCRM Extensions Directory</a> for CiviCRM-related <a href="https://civicrm.org/extensions/%1">%1 modules</a>, which are not listed here.', {1: CRM.config.userFramework});
    $scope.legacyExtensionsURL = CRM.url('civicrm/admin/extensions', {reset: 1});

    /**
     * Updates model with newest list of available extensions, both local and remote.
     */
    $scope.scan = function scan() {
      return crmStatus(
        // Status messages. For defaults, just use "{}"
        {start: ts('Scanning...'), success: ts('Scan completed')},
        crmApi('Extension', 'refresh', {})
      )
      .then(function () {
        crmApi('Extension', 'getCoalesced').then(function (data) {
          $scope.extensions = _.map(data.values, function (ext) {
            return new Extension(ext);
          });
        });
      });
    };

    /**
     * Click handler to update on-page status for all extensions.
     *
     * @param {jQuery.Event} e
     *  Instance of a jQuery event object, since this is a click-handler.
     */
    $scope.updatestatusOnPage = function updatestatusOnPage(e) {
      // crm-ui-tab-set applies the click handler to the entire tab-set block.
      // We only want to take action on clicks to the tab controls themselves.
      if($(e.target).is('a.ui-tabs-anchor')) {
        $scope.extensions.forEach(function (extension) {
          extension.statusOnPage = extension.status;
        });
      }
    };

  });

})(angular, CRM.$, CRM._);
