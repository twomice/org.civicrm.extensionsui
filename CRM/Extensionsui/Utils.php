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
    }

    foreach ($local as $key => &$ext) {
      $result[$key] = $ext;
    }
    return $result;
  }

}
