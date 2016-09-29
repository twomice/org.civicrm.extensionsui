# CiviCRM Extensions UI, Improved

This extension aims to implement UI improvements described at
<https://wiki.civicrm.org/confluence/display/CRM/Extensions+in-app+UI+improvements>.


## Requirements
1. <https://github.com/civicrm/civicrm-core/pull/9141>:
At time of writing, this patch has not been merged into core, but is required
for this extension.


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
