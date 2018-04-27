# TODO
 - How about some tests for local-only extensions?
 - How about some tests against the remote and local subarrays? (We should find
   that the current code is now (or again?) clobbering the remote values when
   items go through the local loop. See next section)

# Refactoring sketch
I'm inclined to refactor to use a proper class rather than continue to
masquerade these static PHP functions as a class.

The class probably needs only one public function, which gets the same args as
coalesceExtensions(). It caches the args in class properties `$this->localExtensions`
and `$this->remoteExtensions` and builds a new (local in scope) array of unique
extension keys, which it loops through, calling private methods:

```php
$this->coalescedExtensions[$key] = $this->getCoalescedProperties($key);
$this->coalescedExtensions[$key]['local'] = $this->getLocalProperties($key);
$this->coalescedExtensions[$key]['remote'] = $this->getRemoteProperties($key);
```

`getCoalescedProperties()` checks if the key exists in the `$this->localExtensions`
and returns something like our current `getCoalescedExtProperties()` if so.
Otherwise it does so based on the data in `$this->remoteExtensions`.

`getLocalProperties()` builds the 'local' subarray based on the values in
`$this->localExtensions`, else returns the array structure with NULL values to
address the "consistent interfaces" concern. `getRemoteProperties()` does the
same using `$this->remoteExtensions` as its data source.

# Coalescing Specification

Notes from a 2018-03-22 meeting between Allen and Frank. Stashed in this repo
for safekeeping and convenience, these notes can be deleted when they are no
longer needed.

## Fields where both local and remote values should be returned

- version: needed to indicate when upgrades are available
- requires: need to know what dependencies there are in case I've broken my
    local instance by manually installing an extension without its dependencies;
    want to know about new dependencies before I upgrade in-app
- releaseDate: just how out of date am I?

## Fields where local values should trump remote values
- status
- name
- description
- urls
- license
- maintainer
- comments
- path
- statusLabel (probably with heavy massaging from this API)

## Fields that ought not be in the API result at all
- id: the extension (database) ID
- type: deprecated and not something we want to display anyway
- label: despite its name, this is not expected to be used for human-readable display
- file
- classloader
- compatibility: the extensions microservice shouldn't tell me about extensions
    that aren't compatible with my instance
- civix
- downloadUrl
- develStage
- typeInfo

## Matching
- key: used to match results from `Extension.get` and `Extension.getRemote`