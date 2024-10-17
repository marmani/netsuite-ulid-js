# ULID Library for NetSuite (SuiteScript)

This is a SuiteScript library for generating [Universally Unique
Lexicographically Sortable Identifiers][ulid] (ULIDs) inside of NetSuite.
Allegedly, it's pretty quick.

The API is a single constructor. It constructs a closure that generates
monotonic ULIDs each time it's invoked.

```js
/**
 * @NApiVersion 2.1
 * @summary Copy and paste this into the Debugger Editor. Ensure the folder path matches where your library file is stored.
 */
require([
	"SuiteScripts/CommonLibs/ns-ulid",
], (ULID) => {
	let generator = new ULID.ULID()
	let ulid0 = generator();
	let ulid1 = generator();
	log.audit("should be true...", ulid0 < ulid1);
	log.audit("done", "one more line to debug with");
});
```

The generator itself makes no allocations when generating ULIDs, except
for the returned ULID string.


[ulid]: https://github.com/ulid/spec
