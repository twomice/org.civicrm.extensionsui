# CiviCRM Extensions Manager: Architecture

## Angular directives

### crmExtTable

Renders a table of extensions available to the system.

Example: `<crm-ext-table ext-context="'not-installed'" ext-data="extensions"></crm-ext-table>`

Parameters:
* extContext String [installed|ANYTHING ELSE] Determines which statuses will
  allow an extension to be displayed in the table.
* extData Array Extension objects; see extension.service.js.

## Angular services

### Extension

Massages the results of the Extension.getCoalesced API into a suitable structure,
adding values to accommodate state on page, and providing methods for managing 
the extension lifecycle.

## CiviCRM APIs

### Extension.getCoalesced

Returns extension data needed to build the management interface, regardless of 
whether those extensions are available locally or not. In short, it retrieves 
and massages data from `Extension.get` and `Extension.getRemote` so that the same 
doesn't need to be done on the client side.
