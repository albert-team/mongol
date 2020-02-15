import { CrudOperation } from './types'

/** JSON Schema keywords that MongoDB does not support. */
export const OMITTED_JSON_SCHEMA_KEYWORDS = new Set([
  '$ref',
  '$schema',
  'default',
  'definitions',
  'format',
  'id'
])

export const INSERT_OPERATIONS = new Set([
  CrudOperation.InsertMany,
  CrudOperation.InsertOne
])

export const UPDATE_OPERATIONS = new Set([
  CrudOperation.FindOneAndUpdate,
  CrudOperation.UpdateMany,
  CrudOperation.UpdateOne
])

export const REPLACE_OPERATIONS = new Set([
  CrudOperation.FindOneAndReplace,
  CrudOperation.ReplaceOne
])

export const DELETE_OPERATIONS = new Set([
  CrudOperation.DeleteMany,
  CrudOperation.DeleteOne,
  CrudOperation.FindOneAndDelete
])
