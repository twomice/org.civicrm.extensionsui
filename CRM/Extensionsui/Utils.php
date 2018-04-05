<?php

/**
 * Utilities for Extensionsui API.
 */
class CRM_Extensionsui_Utils {
  public static function coalesceExtensions($local, $remote) {
    // Key arrays by extensions name.
    $local = array_column($local, NULL, 'key');

    $result = array_column($remote, NULL, 'key');

    foreach ($result as &$ext) {
      $ext['status'] = 'remote';
      $ext['remote'] = array(
        'version' => CRM_Utils_Array::value('version', $ext),
      );
      // Ensure consistent interface by initializing relevant array keys.
      $ext['local'] = array(
        'version' => NULL,
        'requires' => NULL,
        'releaseDate' => NULL,
      );
    }

    foreach ($local as $key => $ext) {
      $ext['local']['version'] = CRM_Utils_Array::value('version', $ext);
      $ext['local']['requires'] = CRM_Utils_Array::value('requires', $ext);
      $ext['local']['releaseDate'] = CRM_Utils_Array::value('releaseDate', $ext);

      // TODO: Well, we don't want this. This is clobbering all the work in the
      // previous foreach loop. We need to do a smarter merge. This is causing
      // api_v3_Extensionsui_localExtensionTest->testVersion() to fail.
      $result[$key] = $ext;
    }
    return $result;
  }

}
