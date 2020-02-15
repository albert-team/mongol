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

export const INSERT_OPERATIONS = [CrudOperation.InsertMany, CrudOperation.InsertOne]

export const UPDATE_OPERATIONS = [
  CrudOperation.FindOneAndUpdate,
  CrudOperation.UpdateMany,
  CrudOperation.UpdateOne
]

export const REPLACE_OPERATIONS = [
  CrudOperation.FindOneAndReplace,
  CrudOperation.ReplaceOne
]

export const DELETE_OPERATIONS = [
  CrudOperation.DeleteMany,
  CrudOperation.DeleteOne,
  CrudOperation.FindOneAndDelete
]
