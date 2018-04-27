<?php

/**
 * Utilities for Extensionsui API.
 */
class CRM_Extensionsui_Utils {
  public static function coalesceExtensions($local, $remote) {
    // Key arrays by extensions name.
    $local = array_column($local, NULL, 'key');

    // start with all of the remote extensions in our result
    $remote = array_column($remote, NULL, 'key');
    $coalescedExtensions = array();

    foreach ($remote as $key => $ext) {
      $coalescedExtensions[$key] = self::getCoalescedExtProperties($ext);

      // Ensure consistent interface by initializing relevant array keys.
      $coalescedExtensions[$key]['local'] = array(
        'releaseDate' => NULL,
        'requires' => NULL,
        'version' => NULL,
      );

      $coalescedExtensions[$key]['remote'] = array(
        'releaseDate' => CRM_Utils_Array::value('releaseDate', $ext),
        'requires' => CRM_Utils_Array::value('requires', $ext),
        'version' => CRM_Utils_Array::value('version', $ext),
      );
    }

    foreach ($local as $key => $ext) {
      $coalescedExtensions[$key] = self::getCoalescedExtProperties($ext);
      $coalescedExtensions[$key]['local'] = array(
        'releaseDate' => CRM_Utils_Array::value('releaseDate', $ext),
        'requires' => CRM_Utils_Array::value('requires', $ext),
        'version' => CRM_Utils_Array::value('version', $ext),
      );

      // Ensure consistent interface by initializing relevant array keys.
      if (!isset($coalescedExtensions[$key]['remote'])) {
        $coalescedExtensions[$key]['remote'] = array(
          'releaseDate' => NULL,
          'requires' => NULL,
          'version' => NULL,
        );
      }
    }
    return $coalescedExtensions;
  }

  /**
   * @param array $ext
   *   Result from api.Extension.get or api.Extension.getRemote
   * @return array
   */
  private static function getCoalescedExtProperties(array $ext) {
    return array(
      'comments' => CRM_Utils_Array::value('comments', $ext),
      'description' => CRM_Utils_Array::value('description', $ext),
      'key' => CRM_Utils_Array::value('key', $ext),
      'license' => CRM_Utils_Array::value('license', $ext),
      'maintainer' => CRM_Utils_Array::value('maintainer', $ext),
      'name' => CRM_Utils_Array::value('name', $ext),
      'path' => CRM_Utils_Array::value('path', $ext),
      'status' => CRM_Utils_Array::value('status', $ext, 'remote'),
      'statusLabel' => CRM_Utils_Array::value('statusLabel', $ext),
      'urls' => CRM_Utils_Array::value('urls', $ext),
    );
  }

}
