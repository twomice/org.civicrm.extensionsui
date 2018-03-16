(function (angular, $, _) {
  // Declare a list of dependencies.
  angular.module('crmExt').factory('Extension', function (crmApi) {

    function Extension(data) {
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
      this.maintainer = ''; // TODO: would it be overboard to have a separate model?
      this.name = _.result(data, 'name');
      this.path = _.result(data, 'path');
      this.releaseDate = _.result(data, 'releaseDate');
      this.status = _.result(data, 'status');
      /**
       * Used to keep track of state in the application, and may differ from the
       * state in the database (e.g., which tab an extension should appear in).
       *
       * Prevents the unexpected UX of disabling an extension and having it
       * disappear from view. TODO: It could be argued this doesn't belong in
       * our model and should be moved to the relevant controller.
       */
      this.state = {
        // check this syntax -- what if data.state doesn't exist?
        status: _.result(data.state, 'status', this.status)
      };
      this.type = _.result(data, 'type');
      this.urls = _.result(data, 'urls');
      this.version = _.result(data, 'version');
    }

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
      var messages = getUserFeedbackMessages(action);

      // If the extension has no path, it doesn't exist on disk and must be
      // downloaded before it can be installed. (Note: the download action also
      // installs the extension.)
      if (action === 'install' && (_.isUndefined(this.path) || _.isEmpty(this.path))) {
        action = 'download';
      }

      var params = {key: this.key};
      // TODO: explain why we are handling user feedback in the model (via messages)
      return crmApi('Extension', action, params, messages).then(function (result) {
        // TODO: "then" is probably inappropriate; let's do this conditionally
        // on success -- I think we want .success()
        // TODO: validate that the result object is actually structured this way
        this.status = result.status;
      }.bind(this));
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
    function getUserFeedbackMessages(action) {
      var messages = {};

      switch (action) {
        case 'disable':
          messages.start = 'Disabling ' + this.label + '&hellip;';
          messages.success = this.label + ' disabled';
          break;
        case 'enable':
          messages.start = 'Enabling ' + this.label + '&hellip;';
          messages.success = this.label + ' enabled';
          break;
        case 'install':
          messages.start = 'Installing ' + this.label + '&hellip;';
          messages.success = this.label + ' installed';
          break;
      }

      return messages;
    }

    /**
     * Private helper function for Extension models to determine whether the
     * requested action is supported.
     *
     * @param {String} action
     * @returns {Boolean}
     */
    function isLifecycleAction(action) {
      return _.contains(['disable', 'enable', 'install'], action);
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

    return Extension;
  });
})(angular, CRM.$, CRM._);