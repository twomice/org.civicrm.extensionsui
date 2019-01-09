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
  $spec['keys'] = array(
    'title' => 'Extension Key(s)',
    'api.aliases' => array('key', 'full_name'),
    'type' => CRM_Utils_Type::T_STRING,
    'description' => 'Fully qualified name of one or more extensions; multiple values must be passed as an array',
  );

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
  // Ensure $keys is always an array, whether an empty string, empty array, or
  // actual value has been passed; this avoids casting an empty string to an array
  // containing one empty string. E.g., this is insufficient:
  // $keys = (array) $params['keys'];
  $keys = (empty($params['keys']) ? array() : (array) $params['keys']);
  $localExtensions = civicrm_api3('Extension', 'get', array(
      'options' => array(
        'limit' => 0,
      ),
      'full_name' => $keys,
    )
  )['values'];
  // Extension.getRemote doesn't support a 'keys' parameter, so if we're given
  // that parameter, we'll filter for it below.
  $remoteExtensions = civicrm_api3('Extension', 'getRemote', array(
      'options' => array(
        'limit' => 0,
      ),
    )
  )['values'];
  if (empty($keys)) {
    $filteredRemoteExtensions = $remoteExtensions;
  }
  else {
    $keyedRemoteExtensions = array_column($remoteExtensions, NULL, 'key');
    $filteredRemoteExtensions = array_intersect_key($keyedRemoteExtensions, array_flip($keys));
  }

  $allExtensions = CRM_Extensionsui_Coalescer::coalesce($localExtensions, $filteredRemoteExtensions);
  return civicrm_api3_create_success($allExtensions, $params, 'Extension', 'getcoalesced');
}
