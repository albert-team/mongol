import { CrudOperation } from './types'

/** JSON Schema keywords that MongoDB does not support. */
export const OMITTED_JSON_SCHEMA_KEYWORDS = [
  '$ref',
  '$schema',
  'default',
  'definitions',
  'format',
  'id'
]

export const UPDATE_OPERATIONS = [
  CrudOperation.FindOneAndUpdate,
  CrudOperation.UpdateOne,
  CrudOperation.UpdateMany
]

export const REPLACE_OPERATIONS = [
  CrudOperation.FindOneAndReplace,
  CrudOperation.ReplaceOne
]
