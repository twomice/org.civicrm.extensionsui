(function (angular, $, _) {
  // Declare a list of dependencies.
  angular.module('crmExt').factory('Extension', function (crmApi) {

    /**
     * Constructor for the Extension object.
     *
     * @param {Object} data
     *   Properties as received from api.Extension.getCoalesced.
     */
    function Extension(data) {
      this.populateValues(data);
      this.statusOnPage = this.status;
    }

    /**
     * @param {Object} data
     *   Properties as received from api.Extension.getCoalesced.
     */
    Extension.prototype.populateValues = function (data) {
      // The underscore "result" helper used extensively below is a bit like
      // CiviCRM's CRM_Utils_Array::value(), though the signature is different.

      // TODO: Provide reasonable fallback values for the below. Likeliest need
      // for this is to elegantly deal with extensions which are missing from
      // the filesystem.
      this.comments = _.result(data, 'comments');
      this.compatibleVersions = normalizeCompatibleVersions(_.result(data, 'compatibility', {}));
      this.description = _.result(data, 'description');
      this.develStage = _.result(data, 'develStage');
      this.id = _.result(data, 'id');
      this.key = _.result(data, 'key');
      this.label = _.result(data, 'label');
      this.license = _.result(data, 'license');
      this.local = _.result(data, 'local');
      this.maintainer = _.result(data, 'maintainer');
      this.name = _.result(data, 'name');
      this.path = _.result(data, 'path');
      this.remote = _.result(data, 'remote');
      this.status = _.result(data, 'status');
      this.statusLabel = _.result(data, 'statusLabel');
      this.type = _.result(data, 'type');
      this.urls = _.result(data, 'urls');
      this.version = _.result(this.local, 'version') || _.result(this.remote, 'version');
    };

    /**
     * Abstracts the Extension API for lifecycle events.
     *
     * @param {String} action
     *   A lifecycle action to be performed against the Extension.
     * @returns {crmApi}
     *   Allows chaining of promise handlers.
     */
    Extension.prototype.lifecycle = function (action) {
      if (!isLifecycleAction(action)) {
        throw "Invalid or unsupported API method for Extension object.";
      }

      // Get these values before the action has a chance to be altered.
      var messages = this.getUserFeedbackMessages(action);

      var params = {
        key: this.key,
        sequential: 0
      };

      // If the extension has no path, it doesn't exist on disk and must be
      // downloaded before it can be installed. (Note: the download action also
      // installs the extension.)
      if (action === 'install' && (_.isUndefined(this.path) || _.isEmpty(this.path))) {
        action = 'download';
      }

      // An extension upgrade requires that we first download the extension with
      // a separate API call.
      var isUpgrade = 0;
      if (action === 'upgrade') {
        isUpgrade = 1;
        action = 'download';
      }

      var thisExtension = this;

      return crmApi('Extension', action, params, messages).then(function(){
        var apiCalls = [];
        if (isUpgrade) {
          apiCalls.push(['Extension', 'upgrade', params]);
        }
        apiCalls.push(['Extension', 'getcoalesced', params]);
        return crmApi(apiCalls).then(function(result){
          var getCoalescedResult = result.pop();
          thisExtension.populateValues(getCoalescedResult.values[thisExtension.key]);
        });
      });
    };

    /**
     * Private helper function for Extension models to get the appropriate
     * messages to display to the user depending on the action.
     *
     * @param {String} action
     *   An API action such as install, disable, etc.
     * @returns {Object}
     *   Message object that can be passed as the fourth parameter to CRM.api.
     */
    Extension.prototype.getUserFeedbackMessages = function (action) {
      var messages = {};

      switch (action) {
        case 'disable':
          messages.start = ts('Disabling %1 (%2)…', {1: this.name, 2: this.key});
          messages.success = ts('%1 (%2) disabled', {1: this.name, 2: this.key});
          break;
        case 'enable':
          messages.start = ts('Enabling %1 (%2)…', {1: this.name, 2: this.key});
          messages.success = ts('%1 (%2) enabled', {1: this.name, 2: this.key});
          break;
        case 'install':
          messages.start = ts('Installing %1 (%2)…', {1: this.name, 2: this.key});
          messages.success = ts('%1 (%2) installed', {1: this.name, 2: this.key});
          break;
        case 'uninstall':
          messages.start = ts('Uninstalling %1 (%2)…', {1: this.name, 2: this.key});
          messages.success = ts('%1 (%2) uninstalled', {1: this.name, 2: this.key});
          break;
        case 'upgrade':
          messages.start = ts('Upgrading %1 (%2)…', {1: this.name, 2: this.key});
          messages.success = ts('%1 (%2) upgraded', {1: this.name, 2: this.key});
          break;
      }

      return messages;
    };

    /**
     * Get the latest available version string, if greater than the current version,
     * otherwise false.
     *
     * @returns {String|Boolean}
     */
    Extension.prototype.getUpgradeVersion = function () {
      var localVersion = _.result(this.local, 'version');
      var remoteVersion = _.result(this.remote, 'version');
      var hasUpgrade = version_compare (localVersion, remoteVersion, '<');
      return (hasUpgrade ? remoteVersion : false);
    };

    /**
     * Private helper function for Extension models to determine whether the
     * requested action is supported.
     *
     * @param {String} action
     * @returns {Boolean}
     */
    function isLifecycleAction(action) {
      return _.contains(['disable', 'enable', 'install', 'uninstall', 'upgrade'], action);
    }

    /**
     * Private helper function for Extension models to ensure the value is an
     * array. Needed to workaround API inconsistency (see CRM-21561).
     *
     * TODO: Since we are considering writing our own API to service this
     * extension, let's handle normalization on the server side and chuck this.
     *
     * @param {String|Array} data
     * @returns {Array}
     */
    function normalizeCompatibleVersions(data) {
      var versions = _.result(data, 'ver', []);
      return (typeof versions === 'string' ? [versions] : versions);
    }

    /**
     * JavaScript implementation of of PHP's version_compare().
     * Part of the Locutus project; used here under MIT License:
     * https://github.com/kvz/locutus/blob/master/LICENSE
     */
    var version_compare = function (v1, v2, operator) { // eslint-disable-line camelcase
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
      var i;
      var x;
      var compare = 0;

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
      };

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
        v = ('' + v).replace(/[_\-+]/g, '.');
        v = v.replace(/([^.\d]+)/g, '.$1.').replace(/\.{2,}/g, '.');
        return (!v.length ? [-8] : v.split('.'));
      };

      // This converts a version component to a number.
      // Empty component becomes 0.
      // Non-numerical component becomes a negative number.
      // Numerical component becomes itself as an integer.
      var _numVersion = function (v) {
        return !v ? 0 : (isNaN(v) ? vm[v] || -7 : parseInt(v, 10));
      };

      v1 = _prepVersion(v1);
      v2 = _prepVersion(v2);
      x = Math.max(v1.length, v2.length);
      for (i = 0; i < x; i++) {
        if (v1[i] === v2[i]) {
          continue;
        }
        v1[i] = _numVersion(v1[i]);
        v2[i] = _numVersion(v2[i]);
        if (v1[i] < v2[i]) {
          compare = -1;
          break;
        } else if (v1[i] > v2[i]) {
          compare = 1;
          break;
        }
      }
      if (!operator) {
        return compare;
      }

      // Important: operator is CASE-SENSITIVE.
      // "No operator" seems to be treated as "<."
      // Any other values seem to make the function return null.
      switch (operator) {
        case '>':
        case 'gt':
          return (compare > 0);
        case '>=':
        case 'ge':
          return (compare >= 0);
        case '<=':
        case 'le':
          return (compare <= 0);
        case '===':
        case '=':
        case 'eq':
          return (compare === 0);
        case '<>':
        case '!==':
        case 'ne':
          return (compare !== 0);
        case '':
        case '<':
        case 'lt':
          return (compare < 0);
        default:
          return null;
      }
    };


    return Extension;
  });
})(angular, CRM.$, CRM._);
