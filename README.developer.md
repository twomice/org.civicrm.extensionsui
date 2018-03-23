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