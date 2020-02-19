[![](https://img.shields.io/github/license/albert-team/mongol.svg?style=flat-square)](https://github.com/albert-team/mongol)
[![](https://img.shields.io/npm/v/@albert-team/mongol.svg?style=flat-square)](https://www.npmjs.com/package/@albert-team/mongol)
[![](https://img.shields.io/travis/com/albert-team/mongol.svg?style=flat-square)](https://travis-ci.com/albert-team/mongol)

# Mongol

Minimalistic MongoDB helper for Node.js.

## FEATURES

- [Auto-connect support](#auto-connect-support)
- [Enhanced JSON Schema draft-4 support](#enhanced-json-schema-draft-4-support)
- [Database hook/trigger support](#database-hooktrigger-support) _(This feature is still in its early stage of development. Please use it with caution!)_
- [Useful builtin hooks](#useful-builtin-hooks)

## INSTALLATION

### Requirements

- Node.js >= 10
- MongoDB >= 3.6

### Instructions

With yarn

```bash
$ yarn add @albert-team/mongol
```

With npm

```bash
$ npm i @albert-team/mongol
```

## USAGE

### Auto-connect support

Instead of manually calling `Mongol.connect()`:

```js
await mongol.connect()
const db = mongol.database
const coll = db.collection('mycollection')
```

Just use `Mongol.promisifiedDatabase` and you are good to go:

```js
const db = await mongol.promisifiedDatabase
const coll = db.collection('mycollection')
```

### Enhanced JSON Schema draft-4 support

Instead of throwing errors on schemas with [omitted keywords](https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/#json-schema-omission) ('$ref', '$schema', 'default', 'definitions', 'format', 'id'), Mongol may help you ignore them quietly:

```js
const usedSchema = await mongol.setSchema('mycollection', originalSchema, {
  ignoreType: true,
  ignoreUnsupportedKeywords: true
})
```

### Database hook/trigger support

Basic hook:

```js
const coll = db.collection('mycollection')
mongol.attachDatabaseHook(coll, {
  before: (context) => console.log(`Before ${context.operation}`),
  after: (context) => console.log(`After ${context.operation}`)
})
await coll.insertOne({ foo: 'bar' })
// Before insertOne
// After insertOne
```

Nested hook:

```js
const coll = db.collection('mycollection')
mongol.attachDatabaseHook(coll, {
  before: () => console.log('Inner before'),
  after: () => console.log('Inner after')
})
mongol.attachDatabaseHook(coll, {
  before: () => console.log('Outer before'),
  after: () => console.log('Outer after')
})
await coll.insertOne({ foo: 'bar' })
// Outer before
// Inner before
// Inner after
// Outer after
```

Want an "unhooked" version? Just create another collection object:

```js
const another = db.collection('mycollection') // this has nothing to do with coll object above
await another.insertOne({ foo: 'bar' })
```

### Useful builtin hooks

Timestamp hook:

```js
const { createTimestampHook } = require('@albert-team/mongol/builtins/hooks')

const coll = db.collection('mycollection')
mongol.attachDatabaseHook(
  coll,
  createTimestampHook({ namingConventions: ['unchanged', 'snakecase'] })
)
```

**Notice:** Replacement document in replace operations (findOneAndReplace, replaceOne) is considered a new one, hence uses createdAt/created_at.

## API Documentation

Read more [here](https://albert-team.github.io/mongol).

## CHANGELOG

Read more [here](https://github.com/albert-team/mongol/blob/master/CHANGELOG.md).
