<?php
// This file declares an Angular module which can be autoloaded
// in CiviCRM. See also:
// http://wiki.civicrm.org/confluence/display/CRMDOC/hook_civicrm_angularModules

return array(
  'js' => array(
    0 => 'ang/crmExt.js',
    1 => 'ang/crmExt/*.js',
    2 => 'ang/crmExt/*/*.js',
  ),
  'css' => array(
    0 => 'ang/crmExt.css',
  ),
  'partials' => array(
    0 => 'ang/crmExt',
  ),
  'settings' => array(),
);
