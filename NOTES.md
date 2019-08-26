# NOTES

## Authentication - for later

auth_request allows all incoming requests to be forwarded to an authentication endpoint


## Versions

Basic versioning is now available with the ocfl_versioned handler

https://server/ocfl/staging/OID/path/to/payload.jpg -> returns head

https://server/ocfl/staging/OID/path/to/payload.jpg?version=v1 -> returns this resource at v1

Note - I think that internal links are broken in versions - the fix for this could be to put the version in the id like

https://server/ocfl/staging/OID.vN/path/to/payload.jpg

### Versions - TODO

* put a test framework around this: a node package which uses the ocfl-js library to generate a lot of randomised versions of objects and then fires up a Docker nginx and deploys the ocfl.js code and tests whether it gets the right versions back

* scale and load testing. How feasible is using njs to read the inventory.json file? How much overhead does it impose? How quickly does it get slow with large datasets or many versions or both?

* alternative ways to resolve versions. Client side - expose the inventory.json and let frontend js request the correct resource from the server.

## More features

* package this code as a Docker container built on the nginx distro (this should be really simple)