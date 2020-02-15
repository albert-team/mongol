# CHANGELOG

## v0.5.0

### FEATURES

- Rename `autoTimestamp()` to `createTimestampHook()`. From now on, all builtin hook factories will have `create*Hook()` format.

### PATCHES

- Fix a typo in `/src/utils.ts`

## v0.4.0

### FEATURES

- Add builtin database hook factory `autoTimestamp()`
- Add parsed arguments into database hook context for "before" handler
- Improve some type names and signatures
- Convert array constants to ES6 sets

## v0.3.0

### FEATURES

- Auto-connect with `Mongol.promisifiedDatabase`
- Add support for database hook/trigger
- Reorganize project

### PATCHES

- Fix `SchemaOptions.ignoreType` won't work without `ignoreUnsupportedKeywords` being true
- Set `Mongol.db = undefined` on disconnected
