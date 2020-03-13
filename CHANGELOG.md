# CHANGELOG

## v0.8.0

### FEATURES

- Add `ExtendedCollection` with additional method `attachHook()` with the same functionality as `Mongol.attachDatabaseHook()`
- Add `Mongol.collection()` and `Mongol.promisifiedCollection()` to fetch `ExtendedCollection`
- `Mongol.attachDatabaseHook()` now returns the original collection object as `ExtendedCollection`

## v0.7.3

### PATCHES

- Fix accidentally remove fields named "type"

## v0.7.2

### PATCHES

- Fix missing files when deploying to NPM

## v0.7.1

### PATCHES

- Fix `Mongol` always overwrites its constructor options

## v0.7.0

### FEATURES

- `Mongol.setSchema()` returns actually used JSON schema
- Add Mongol constructor options `MongolOptions`, with custom `MongoClient` options support
- Deprecate database hook "error" handler and promote `DatabaseHookError`
- Internally use `Mongol.client.isConnected()` instead of `Mongol.db` to check connection state
- Improve some generic type names
- Improve documentation

## v0.6.0

### FEATURES

- Add `CrudOp` - abbreviation for `CrudOperation`
- Move `Mongol` to a separate file named `/src/mongol.ts`
- Export all type definitions together with `Mongol` under `@albert-team/mongol`
- Use `createdAt/created_at` in replace operations in builtin timestamp hook
- Remove meaningless tests

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
