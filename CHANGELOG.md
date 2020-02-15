# CHANGELOG

## v0.4.0

### FEATURES

- Add builtin database hook factory `autoTimestamp()`
- Add parsed arguments into database hook context for "before" handler
- Improve some type names and signatures
- Convert array constants to ES6 sets

## v0.3.0

### FEATURES

- No need to run `Mongol.connect()` separately by using `Mongol.promisifiedDatabase`
- Add support for database hook/trigger
- Reorganize project

### PATCHES

- Fix `SchemaOptions.ignoreType` won't work without `ignoreUnsupportedKeywords` being true
- Set `Mongol.db = undefined` on disconnected
