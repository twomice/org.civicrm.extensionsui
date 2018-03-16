<?php

use CRM_Extensionsui_ExtensionUtil as E;
use Civi\Test\HeadlessInterface;
use Civi\Test\HookInterface;
use Civi\Test\TransactionalInterface;

/**
 * FIXME - Add test description.
 *
 * Tips:
 *  - With HookInterface, you may implement CiviCRM hooks directly in the test class.
 *    Simply create corresponding functions (e.g. "hook_civicrm_post(...)" or similar).
 *  - With TransactionalInterface, any data changes made by setUp() or test****() functions will
 *    rollback automatically -- as long as you don't manipulate schema or truncate tables.
 *    If this test needs to manipulate schema or truncate tables, then either:
 *       a. Do all that using setupHeadless() and Civi\Test.
 *       b. Disable TransactionalInterface, and handle all setup/teardown yourself.
 *
 * @group headless
 */
class api_v3_Extensionsui_getCoalescedTest extends \PHPUnit_Framework_TestCase implements HeadlessInterface, HookInterface, TransactionalInterface {

  public function setUpHeadless() {
    // Civi\Test has many helpers, like install(), uninstall(), sql(), and sqlFile().
    // See: https://github.com/civicrm/org.civicrm.testapalooza/blob/master/civi-test.md
    return \Civi\Test::headless()
      ->installMe(__DIR__)
      ->apply();
  }

  public function setUp() {
    parent::setUp();
  }

  public function tearDown() {
    parent::tearDown();
  }

  /**
   * Test that an extension we know is installed is reported as installed.
   */
  public function testExtensionsuiIsInstalled() {
    $result = civicrm_api3('Extension', 'getCoalesced', array(
      'options' => array(
        'limit' => 0,
      ),
    ));
    $keyedValues = array_column($result['values'], NULL, 'key');
    $this->assertArrayHasKey('org.civicrm.extensionsui', $keyedValues);
    $this->assertEquals('installed', $keyedValues['org.civicrm.extensionsui']['status']);
  }

  /**
   * Test that an extension known to exist remotely is reported as existing.
   *
   * Assumes cividiscount is published for automated distribution, and that we
   * don't have that extension's files locally.
   */
  public function testRemoteExtensionIsReturned() {
    $result = civicrm_api3('Extension', 'getCoalesced', array(
      'options' => array(
        'limit' => 0,
      ),
    ));
    $keyedValues = array_column($result['values'], NULL, 'key');
    $this->assertArrayHasKey('org.civicrm.module.cividiscount', $keyedValues);
    $this->assertEquals('remote', $keyedValues['org.civicrm.module.cividiscount']['status']);
  }

}
