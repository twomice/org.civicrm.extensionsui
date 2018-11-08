<?php

/**
 * Coalescer for Extensionsui API.
 */
class CRM_Extensionsui_Coalescer {

  /**
   * Extensions local to this installation.
   * @var array
   */
  private $local = array();

  /**
   * Extensions available remotely.
   * @var array
   */
  private $remote = array();

  /**
   * @param array $local
   *  Extensions local to this installation, keyed by extension key.
   * @param array $remote
   *  Extensions available remotely, keyed by extension key.
   */
  private function __construct(array $local, array $remote) {
    $this->local = $local;
    $this->remote = $remote;
  }

  /**
   * Coalesce local and remote extensions for use in return of extension.getcoalesce api.
   *
   * @param array $local
   *  Extensions local to this installation as returned by api Extension.get.
   * @param array $remote
   *  Extensions available remotely as returned by api Extension.getremote.
   *
   * @return array
   * @see civicrm_api3_extension_Getcoalesced
   */
  public static function coalesce(array $local, array $remote) {
    // Key arrays by extensions name.
    $local = array_column($local, NULL, 'key');
    $remote = array_column($remote, NULL, 'key');

    $util = new self($local, $remote);
    $extKeys = array_unique(array_keys($local + $remote));
    $coalescedExtensions = array();
    foreach ($extKeys as $extKey) {
      $coalescedExtensions[$extKey] = $util->getCoalescedProperties($extKey);
      $coalescedExtensions[$extKey]['local'] = $util->getLocalProperties($extKey);
      $coalescedExtensions[$extKey]['remote'] = $util->getRemoteProperties($extKey);
    }
    return $coalescedExtensions;
  }

  /**
   * Returns properties for an extension, defaulting to local and falling back
   * to remote.
   *
   * @param string $extKey
   *   Extension key.
   *
   * @return array
   */
  public function getCoalescedProperties($extKey) {
    $remoteExt = CRM_Utils_Array::value($extKey, $this->remote, array());
    $ext = CRM_Utils_Array::value($extKey, $this->local, $remoteExt);
    return array(
      'comments' => CRM_Utils_Array::value('comments', $ext),
      'compatibility' => CRM_Utils_Array::value('compatibility', $ext),
      'description' => CRM_Utils_Array::value('description', $ext),
      'develStage' => CRM_Utils_Array::value('develStage', $ext),
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

  /**
   * Get local properties for an extension if it's local; otherwise NULL properties.
   *
   * @param string $extKey
   * @return array
   */
  public function getLocalProperties($extKey) {
    if (array_key_exists($extKey, $this->local)) {
      return array(
        'releaseDate' => CRM_Utils_Array::value('releaseDate', $this->local[$extKey]),
        'requires' => CRM_Utils_Array::value('requires', $this->local[$extKey], array()),
        'version' => CRM_Utils_Array::value('version', $this->local[$extKey]),
      );
    }
    else {
      return array(
        'releaseDate' => NULL,
        'requires' => array(),
        'version' => NULL,
      );
    }
  }

  /**
   * Get remote properties for an extension if it's remote; otherwise NULL properties.
   *
   * @param string $extKey
   * @return array
   */
  public function getRemoteProperties($extKey) {
    if (array_key_exists($extKey, $this->remote)) {
      return array(
        'releaseDate' => CRM_Utils_Array::value('releaseDate', $this->remote[$extKey]),
        'requires' => CRM_Utils_Array::value('requires', $this->remote[$extKey], array()),
        'version' => CRM_Utils_Array::value('version', $this->remote[$extKey]),
      );
    }
    else {
      return array(
        'releaseDate' => NULL,
        'requires' => array(),
        'version' => NULL,
      );
    }
  }

}
