(function(angular, $, _) {

  angular.module('crmExt').config(function($routeProvider) {
      $routeProvider.when('/extensions', {
        controller: 'ExtensionsuicrmExt',
        templateUrl: '~/crmExt/crmExt.html',

        // If you need to look up data when opening the page, list it out
        // under "resolve".
        resolve: {}
      });
    }
  );

  // The controller uses *injection*. This default injects a few things:
  //   $scope -- This is the set of variables shared between JS and HTML.
  //   crmApi, crmStatus, crmUiHelp -- These are services provided by civicrm-core.
  //   dialogService -- provided by civicrm.
  //   $q, $timeout -- provided by angular.
  angular.module('crmExt').controller('ExtensionsuicrmExt', function($scope, crmApi, crmStatus, crmUiHelp, dialogService, $q, $timeout) {

    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('crmExt');
    var hs = $scope.hs = crmUiHelp({file: 'CRM/crmExt/crmExt'}); // See: templates/CRM/crmExt/crmExt.hlp

    $scope.addNewHelpText = ts('These extensions are compatible with your version of CiviCRM and have passed a quality review by the CiviCRM community. You may also want to check the <a href="https://civicrm.org/extensions">CiviCRM Extensions Directory</a> for CiviCRM-related <a href="https://civicrm.org/extensions/%1">%1 modules</a>, which are not listed here.', {1: CRM.config.userFramework})

    /**
     * Add action-link methods to the given extension object. These methods
     * will be called by click events in the UI, for example, "Enable" or "Uninstall".
     *
     * @param obj An object defining an extension, in the same format as one
     *   provided by, for example, crmApi('extension', 'getsingle').
     */
    var addActionMethods = function addActionMethods(obj) {
      obj.disable = function disable() {
          return crmStatus(
          // Status messages. For defaults, just use "{}"
          {start: ts('Disabling...'), success: ts('Disabled')},
          crmApi('Extension', 'disable', {
            "keys": this.key
          })
        )
        .then(function(result) {
          loadAll();
        });
      }
      obj.enable = function enable() {
        return crmStatus(
          // Status messages. For defaults, just use "{}"
          {start: ts('Enabling...'), success: ts('Enabled')},
          crmApi('Extension', 'enable', {
            "keys": this.key
          })
        )
        .then(function(result) {
          loadAll();
        });
      }
      obj.install = function install() {
        var promise;
        if (_.isUndefined(this.path) || _.isEmpty(this.path)) {
          // Extension has no path, meaning it doesn't exist on disk.
          // First download it, then install it.
          promise = crmApi('Extension', 'download', {
            "key": this.key
          })
          .then(function() {
            crmApi('Extension', 'install', {
              "keys": this.key
            })
          });
        }
        else {
          // Extension has a path, meaning it does exist on disk.
          // Just install it.
          promise = crmApi('Extension', 'install', {
            "keys": this.key
          });
        }
        return crmStatus(
          // Status messages. For defaults, just use "{}"
          {start: ts('Installing...'), success: ts('Installed')},
          promise
        )
        .then(function(result) {
          loadAll();
        })
      }
      obj.uninstall = function uninstall() {
        return crmStatus(
          // Status messages. For defaults, just use "{}"
          {start: ts('Uninstalling...'), success: ts('Uninstalled')},
          crmApi('Extension', 'uninstall', {
            "keys": this.key
          })
        )
        .then(function(result) {
          loadAll();
        });
      }
      obj.upgrade = function upgrade() {
        return crmStatus(
          // Status messages. For defaults, just use "{}"
          {start: ts('Upgrading...'), success: ts('Upgraded')},
          crmApi('Extension', 'download', {
            "key": this.key
          })
          .then(function(){
            crmApi('Extension', 'upgrade', {})
          })
        )
        .then(function(result) {
          loadAll();
        });
      }
    }

    /**
     * Reload all data from the server.
     */
    var loadAll = function loadAll() {
      var apiLocal = crmApi('Extension', 'get', {"options": {"limit":0}})
      var apiRemote = crmApi('Extension', 'getremote', {"options": {"limit":0}})
      $q.all([apiLocal, apiRemote])
      .then(function(values){
        localExtensions = values[0]
        remoteExtensions = values[1]
        // Separate localExtensions into "installed" and "addnew" collections.
        var extensions = _.groupBy(localExtensions.values, function(obj) {
          return (obj.status == 'uninstalled' ? 'addnew' : 'installed');
        });
        // Remove all "installed" extensions from "addnew" collection.
        installedKeys = _.map(extensions.installed, function(obj){return obj.key});
        extensions.addnew = _.reject(extensions.addnew, function(obj){
          return (installedKeys.indexOf(obj.key) >= 0)
        })
        // Create a collection of remote extensions which are not also local.
        localKeys = _.map(localExtensions.values, function(obj){return obj.key});
        remoteOnly = _.reject(remoteExtensions.values, function(obj){
          return (localKeys.indexOf(obj.key) >= 0);
        })
        // Add all remoteOnly extensions to the "addnew" collection.
        extensions.addnew = _.union(extensions.addnew, remoteOnly);
        // Add crmExt_parentname attribute to each extension
        extensions.installed = _.each(extensions.installed, function(obj){
          obj.crmExt_parentname = 'installed'
          addActionMethods(obj)
        })
        extensions.addnew = _.each(extensions.addnew, function(obj){
          obj.crmExt_parentname = 'addnew'
          addActionMethods(obj)
        })

        $scope.extensions = extensions;
      });
    };

    $scope.refresh = function refresh() {
      return crmStatus(
        // Status messages. For defaults, just use "{}"
        {start: ts('Refreshing...'), success: ts('Refreshed')},
        crmApi('Extension', 'refresh', {})
      )
      .then(function(result) {
        loadAll();
      });
    }
    $scope.showOverlay = function showOverlay(key, parentname) {
      var extension = _.findWhere($scope.extensions[parentname], {'key': key})
      extension.availableUpgradeVersion = function availableUpgradeVersion() {
        return $scope.availableUpgradeVersion(extension.key)
      }
      extension.hasAvailableUpgrade = function hasAvailableUpgrade() {
        return $scope.hasAvailableUpgrade(extension.key)
      }

      // Ensure extension.compatibility.ver is an array.
      extension.compatibility.ver = (typeof extension.compatibility.ver == 'string' ? [extension.compatibility.ver] : extension.compatibility.ver)

      var options = CRM.utils.adjustDialogDefaults({
        autoOpen: false,
        title: extension.name
      });
      dialogService.open('crmExt-overlay', '~/crmExt/OverlayCtrl.html', extension, options)

      var setOverlayButtons = function setOverlayButtons() {
        var buttons = []
        if (_.isUndefined(extension.status) || _.isEmpty(extension.status) || extension.status == 'uninstalled') {
          buttons.push({
            text: ts('Install'),
            click: function() {
              CRM.confirm({message: ts('Install <em>%1 (%2)</em>?', {1: extension.name, 2: extension.key})})
              .on('crmConfirm:yes', function() {
                extension.install();
                dialogService.close('crmExt-overlay');
              });
            }
          })
        }
        if (extension.status == 'disabled') {
          buttons.push({
            text: ts('Enable'),
            click: function() {
              CRM.confirm({message: ts('Enable <em>%1 (%2)</em>?', {1: extension.name, 2: extension.key})})
              .on('crmConfirm:yes', function() {
                extension.enable();
                dialogService.close('crmExt-overlay');
              });
            }
          })
        }
        if (extension.status == 'disabled') {
          buttons.push({
            text: ts('Uninstall'),
            click: function() {
              CRM.confirm({message: ts('Completely uninstall <em>%1 (%2)</em>?', {1: extension.name, 2: extension.key})})
              .on('crmConfirm:yes', function() {
                extension.uninstall();
                dialogService.close('crmExt-overlay');
              });
            }
          })
        }
        if (extension.status == 'installed') {
          buttons.push({
            text: ts('Disable'),
            click: function() {
              CRM.confirm({message: ts('Disable <em>%1 (%2)</em>?', {1: extension.name, 2: extension.key})})
              .on('crmConfirm:yes', function() {
                extension.disable();
                dialogService.close('crmExt-overlay');
              });
            }
          }
        )}
        buttons.push({
          text: ts('Cancel'),
          icons: {primary: 'fa-times'},
          click: function() {
            dialogService.cancel('crmExt-overlay');
          }
        })
        dialogService.setButtons('crmExt-overlay', buttons);
      }
      $timeout(setOverlayButtons)

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
     * FIXME: Move this to an angulaar service within this extension.
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

    // Initially load all data from server.
    loadAll();

  });

})(angular, CRM.$, CRM._);
