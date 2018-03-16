<?php

/**
 * Utilities for Extensionsui API.
 */
class CRM_Extensionsui_Utils {
  public static function coalesceExtensions($local, $remote) {
    // Key arrays by extensions name.
    $local = array_column($local, NULL, 'key');
    $remote = array_column($remote, NULL, 'key');

    $result = array();
    
    foreach ($remote as $key => $ext) {
      $result[$key] = $ext;
      if (isset($local[$key])) {
        // TODO: think harder about how to coalesce local and remote.
        unset($local[$key]);
      }
      else {
        $result[$key]['status'] = 'remote';      
      }
    }
    foreach ($local as $key => $ext) {
      $result[$key] = $ext;
    }
    return $result;
  }

}
