(function(angular, $, _) {

  angular.module('extensionsui').config(function($routeProvider) {
      $routeProvider.when('/extensions', {
        controller: 'ExtensionsuicrmExt',
        templateUrl: '~/extensionsui/crmExt.html',

        // If you need to look up data when opening the page, list it out
        // under "resolve".
        resolve: {
          apiLocalExtensions: function(crmApi) {
            return crmApi('Extension', 'get', {"options": {"limit":0}});
          },
          apiRemoteExtensions: function(crmApi) {
            return crmApi('Extension', 'getremote', {"options": {"limit":0}});
          }
        }
      });
    }
  );

  // The controller uses *injection*. This default injects a few things:
  //   $scope -- This is the set of variables shared between JS and HTML.
  //   crmApi, crmStatus, crmUiHelp -- These are services provided by civicrm-core.
  //   apiLocalExtensions, apiRemoteExtensions -- see above.
  //   dialogService -- provided by civicrm.
  angular.module('extensionsui').controller('ExtensionsuicrmExt', function($scope, crmApi, crmStatus, crmUiHelp, apiLocalExtensions, apiRemoteExtensions, dialogService) {

    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('extensionsui');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/extensionsui/crmExt'}); // See: templates/CRM/extensionsui/crmExt.hlp

    $scope.config = CRM.config
    $scope.extensionsDirectoryLink = '<a href="https://civicrm.org/extensions/' + CRM.config.userFramework +'">'+ ts('FIXME: link to CiviCRM Extensions Directory') + '</a>';

    var localExtensions = apiLocalExtensions;
    var remoteExtensions = apiRemoteExtensions;
    console.log('remoteExtensions', remoteExtensions)

    // Separate localExtensions into "installed" and "addnew" collections.
    var extensions = _.groupBy(localExtensions.values, function(obj) {
      return (obj.status == 'uninstalled' ? 'addnew' : 'installed');
    });
    // Add all remote extensions to the "addnew" collection.
    extensions.addnew = _.union(extensions.addnew, remoteExtensions.values);
    // Remove all "installed" extensions from "addnew" collection.
    installedKeys = _.map(extensions.installed, function(obj){return obj.key});
    extensions.addnew = _.reject(extensions.addnew, function(obj){
      return (installedKeys.indexOf(obj.key) >= 0)
    })
    // Add crmExt_parentname attribute to each extension
    extensions.installed = _.each(extensions.installed, function(obj){
      obj.crmExt_parentname = 'installed'
    })
    extensions.addnew = _.each(extensions.addnew, function(obj){
      obj.crmExt_parentname = 'addnew'
    })


    extensions.installed = _.sortBy(extensions.installed, 'name');
    extensions.addnew = _.sortBy(extensions.addnew, 'name');

    $scope.extensions = extensions;
    
    $scope.upgrade = function upgrade(key) {
      alert('fixme: upgrade('+ key + ')')
    }
    $scope.install = function install(key) {
      alert('fixme: install('+ key + ')')
    }
    $scope.uninstall = function uninstall(key) {
      alert('fixme: uninstall('+ key + ')')
    }
    $scope.disable = function disable(key) {
      alert('fixme: disable('+ key + ')')
    }
    $scope.enable = function enable(key) {
      alert('fixme: enable('+ key + ')')
    }
    $scope.showOverlay = function showOverlay(key, parentname) {
      var extension = _.findWhere(extensions[parentname], {'key': key})
      extension.upgrade = function upgrade() {
        return $scope.upgrade(extension.key)
      }
      extension.install = function install() {
        return $scope.install(extension.key)
      }
      extension.uninstall = function uninstall() {
        return $scope.uninstall(extension.key)
      }
      extension.disable = function disable() {
        return $scope.disable(extension.key)
      }
      extension.enable = function enable() {
        return $scope.enable(extension.key)
      }
      extension.availableUpgradeVersion = function availableUpgradeVersion() {
        return $scope.availableUpgradeVersion(extension.key)
      }
      extension.hasAvailableUpgrade = function hasAvailableUpgrade() {
        return $scope.hasAvailableUpgrade(extension.key)
      }
      var options = CRM.utils.adjustDialogDefaults({
        autoOpen: false,
        title: extension.name
      });
      dialogService.open('fixme', '~/extensionsui/OverlayCtrl.html', extension, options);
    }
    $scope.hasAvailableUpgrade = function hasAvailableUpgrade(key) {
      var remoteExtension = _.findWhere(remoteExtensions.values, {'key': key})
      if (_.isUndefined(remoteExtension)) {
        return false;
      }
      var localExtension = _.findWhere(localExtensions.values, {'key': key})
      if (_.isUndefined(localExtension)) {
        return false;
      }
      return (crmExt_version_compare(localExtension.version, remoteExtension.version, '<'))
    }
    $scope.availableUpgradeVersion = function availableUpgradeVersion(key) {
      var remoteExtension = _.findWhere(remoteExtensions.values, {'key': key})
      if (_.isUndefined(remoteExtension)) {
        return '';
      }
      return remoteExtension.version
    }
    
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


    /**
     * JavaScript implementation of of PHP's version_compare().
     * Part of the Locutus project; used here under MIT License:
     * https://github.com/kvz/locutus/blob/master/LICENSE
     *
     * FIXME: CiviCRM probably has an existing way of doing this, or if not,
     * this function probaby could/should be written in a better place.
     */
    var crmExt_version_compare = function (v1, v2, operator) { // eslint-disable-line camelcase
      //       discuss at: http://locutus.io/php/version_compare/
      //      original by: Philippe Jausions (http://pear.php.net/user/jausions)
      //      original by: Aidan Lister (http://aidanlister.com/)
      // reimplemented by: Kankrelune (http://www.webfaktory.info/)
      //      improved by: Brett Zamir (http://brett-zamir.me)
      //      improved by: Scott Baker
      //      improved by: Theriault (https://github.com/Theriault)
      //        example 1: version_compare('8.2.5rc', '8.2.5a')
      //        returns 1: 1
      //        example 2: version_compare('8.2.50', '8.2.52', '<')
      //        returns 2: true
      //        example 3: version_compare('5.3.0-dev', '5.3.0')
      //        returns 3: -1
      //        example 4: version_compare('4.1.0.52','4.01.0.51')
      //        returns 4: 1

      // Important: compare must be initialized at 0.
      var i
      var x
      var compare = 0

      // vm maps textual PHP versions to negatives so they're less than 0.
      // PHP currently defines these as CASE-SENSITIVE. It is important to
      // leave these as negatives so that they can come before numerical versions
      // and as if no letters were there to begin with.
      // (1alpha is < 1 and < 1.1 but > 1dev1)
      // If a non-numerical value can't be mapped to this table, it receives
      // -7 as its value.
      var vm = {
        'dev': -6,
        'alpha': -5,
        'a': -5,
        'beta': -4,
        'b': -4,
        'RC': -3,
        'rc': -3,
        '#': -2,
        'p': 1,
        'pl': 1
      }

      // This function will be called to prepare each version argument.
      // It replaces every _, -, and + with a dot.
      // It surrounds any nonsequence of numbers/dots with dots.
      // It replaces sequences of dots with a single dot.
      //    version_compare('4..0', '4.0') === 0
      // Important: A string of 0 length needs to be converted into a value
      // even less than an unexisting value in vm (-7), hence [-8].
      // It's also important to not strip spaces because of this.
      //   version_compare('', ' ') === 1
      var _prepVersion = function (v) {
        v = ('' + v).replace(/[_\-+]/g, '.')
        v = v.replace(/([^.\d]+)/g, '.$1.').replace(/\.{2,}/g, '.')
        return (!v.length ? [-8] : v.split('.'))
      }
      // This converts a version component to a number.
      // Empty component becomes 0.
      // Non-numerical component becomes a negative number.
      // Numerical component becomes itself as an integer.
      var _numVersion = function (v) {
        return !v ? 0 : (isNaN(v) ? vm[v] || -7 : parseInt(v, 10))
      }

      v1 = _prepVersion(v1)
      v2 = _prepVersion(v2)
      x = Math.max(v1.length, v2.length)
      for (i = 0; i < x; i++) {
        if (v1[i] === v2[i]) {
          continue
        }
        v1[i] = _numVersion(v1[i])
        v2[i] = _numVersion(v2[i])
        if (v1[i] < v2[i]) {
          compare = -1
          break
        } else if (v1[i] > v2[i]) {
          compare = 1
          break
        }
      }
      if (!operator) {
        return compare
      }

      // Important: operator is CASE-SENSITIVE.
      // "No operator" seems to be treated as "<."
      // Any other values seem to make the function return null.
      switch (operator) {
        case '>':
        case 'gt':
          return (compare > 0)
        case '>=':
        case 'ge':
          return (compare >= 0)
        case '<=':
        case 'le':
          return (compare <= 0)
        case '===':
        case '=':
        case 'eq':
          return (compare === 0)
        case '<>':
        case '!==':
        case 'ne':
          return (compare !== 0)
        case '':
        case '<':
        case 'lt':
          return (compare < 0)
        default:
          return null
      }
    }
  });

})(angular, CRM.$, CRM._);
