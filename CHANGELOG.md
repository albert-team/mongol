# CHANGELOG

## v0.3.0

### FEATURES

- No need to run `Mongol.connect()` separately by using `Mongol.promisifiedDatabase`
- Add support for database hook/trigger
- Reorganize project

### PATCHES

- Fix `SchemaOptions.ignoreType` won't work without `ignoreUnsupportedKeywords` being true
- Set `Mongol.db = undefined` on disconnected
