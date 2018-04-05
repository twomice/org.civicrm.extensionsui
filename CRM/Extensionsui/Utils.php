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
        'version' => $ext['version'],
      );
      // Ensure consistent interface by initializing relevant array keys.
      $ext['local'] = array(
        'version' => NULL,
        'requires' => NULL,
        'releaseDate' => NULL,
      );
    }

    foreach ($local as $key => $ext) {
      $ext['local']['version'] = $ext['version'];
      $ext['local']['requires'] = $ext['requires'];
      $ext['local']['releaseDate'] = $ext['releaseDate'];
      $result[$key] = $ext;
    }
    return $result;
  }

}
