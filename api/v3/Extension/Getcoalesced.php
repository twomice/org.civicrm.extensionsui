<?php
use CRM_Extensionsui_ExtensionUtil as E;

/**
 * Extension.Getcoalesced API specification (optional)
 * This is used for documentation and validation.
 *
 * @param array $spec description of fields supported by this API call
 * @return void
 * @see http://wiki.civicrm.org/confluence/display/CRMDOC/API+Architecture+Standards
 */
function _civicrm_api3_extension_Getcoalesced_spec(&$spec) {
}

/**
 * Extension.Getcoalesced API
 *
 * @param array $params
 * @return array API result descriptor
 * @see civicrm_api3_create_success
 * @see civicrm_api3_create_error
 * @throws API_Exception
 */
function civicrm_api3_extension_Getcoalesced($params) {
  $localExtensions = civicrm_api3('Extension', 'get', array(
      'options' => array(
        'limit' => 0,
      ),
    )
  );
  $remoteExtensions = civicrm_api3('Extension', 'getRemote', array(
      'options' => array(
        'limit' => 0,
      ),
    )
  );
  $allExtensions = CRM_Extensionsui_Utils::coalesceExtensions($localExtensions['values'], $remoteExtensions['values']);
  return civicrm_api3_create_success($allExtensions, $params, 'Extension', 'getcoalesced');
}
