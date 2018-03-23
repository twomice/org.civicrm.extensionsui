# CiviCRM Extensions Manager

This extension aims to implement UI improvements described at
<https://wiki.civicrm.org/confluence/display/CRM/Extensions+in-app+UI+improvements>.


## Requirements

1. CiviCRM version 4.7.13 or greater, or 4.7.x plus this [small core patch](https://github.com/civicrm/civicrm-core/pull/9141).

## Usage

After enabling this extension, navigate to http://[your.site]/civicrm/a/#/extensions/.
This UI will exist alongside the core "CiviCRM Extensions" UI.

## Known issues

1. **Display of session status messages:**  Where this extension uses AJAX to
communicate with CiviCRM, it may fail to display session status messages in a
timely fashion, due to issues described at
<https://issues.civicrm.org/jira/browse/CRM-19428>. Resolution of CRM-19428 is
important to the success of this extension.
2. **Display of extension statistics:**  Work is currently in progress to provide
a microservice under statistics.civicrm.org from which statistics for each
extension can be retrieved. In the meantime, statistics are not being displayed
in this UI.

## Development

### API

This extension provides an API `Extension.getCoalesced` which returns extension
data needed to build the management interface, regardless of whether those
extensions are available locally or not. In short, it retrieves and massages
data from `Extension.get` and `Extension.getRemote` so that the same doesn't need to
be done on the client side.

### Unit Tests

This extension's tests are based on CiviCRM's [Testapalooza PHPUnit
Template](https://github.com/civicrm/org.civicrm.testapalooza/tree/phpunit).
They run "headlessly" (possibly an abuse of the term), which is to say that they
run against a test database spun up expressly for the purpose of testing.

To run the unit tests, you must have [cv](https://github.com/civicrm/cv) and
phpunit4 installed. (If you are using
[civicrm-buildkit](https://github.com/civicrm/civicrm-buildkit), both will have
been installed for you already.)

To run all tests, execute the following:

```bash
$ cd /path/to/extension
$ export CIVICRM_SETTINGS=/path/to/civicrm.settings.php
$ phpunit4 --group headless
```
To run a single test, change that last command to:

```bash
$ phpunit4 path/to/test/class.php --filter nameOfTestMethod
```
