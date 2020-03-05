import {
  DELETE_OPERATIONS,
  INSERT_OPERATIONS,
  REPLACE_OPERATIONS,
  UPDATE_OPERATIONS
} from './constants'
import { CrudOp, CrudOperation, ParsedCrudOperationArgs } from './types'

export const removeProperties = (
  schema: object,
  propNames: Set<string>,
  ignoreThisLevel = false
): object => {
  const result = {}

  for (const [k, v] of Object.entries(schema)) {
    if (!ignoreThisLevel && propNames.has(k)) continue
    if (v instanceof Array) {
      result[k] = v.map((item) => {
        if (item instanceof Object) return removeProperties(item, propNames)
        return item
      })
    } else if (v instanceof Object) {
      result[k] = removeProperties(v, propNames, k === 'properties')
    } else result[k] = v
  }
  return result
}

export const withTimestamp = <T>(doc: T, propName: string): T => {
  doc[propName] = new Date()
  return doc
}

export const getCrudOp = (operation: CrudOperation): CrudOp => {
  if (INSERT_OPERATIONS.has(operation)) return CrudOp.Insert
  else if (UPDATE_OPERATIONS.has(operation)) return CrudOp.Update
  else if (REPLACE_OPERATIONS.has(operation)) return CrudOp.Replace
  else if (DELETE_OPERATIONS.has(operation)) return CrudOp.Delete
  else return CrudOp.BulkWrite // operation === CrudOperation.BulkWrite
}

export const parseCrudOperationArgs = <TArgs extends any[]>(
  op: CrudOperation,
  args: TArgs
): ParsedCrudOperationArgs => {
  let query: object
  let documents: object[] = []
  let update: object
  let subOperations: object[]
  let options: object

  if (op === CrudOperation.InsertOne) [documents[0], options] = args
  else if (op === CrudOperation.InsertMany) [documents, options] = args
  else if (UPDATE_OPERATIONS.has(op)) [query, update, options] = args
  else if (REPLACE_OPERATIONS.has(op)) [query, documents[0], options] = args
  else if (DELETE_OPERATIONS.has(op)) [query, options] = args
  else if (op === CrudOperation.BulkWrite) [subOperations, options] = args

  return { query, documents, update, subOperations, options }
}

export const unparseCrudOperationArgs = <TArgs extends any[]>(
  op: CrudOperation,
  parsedArgs: ParsedCrudOperationArgs
): TArgs => {
  const { query, documents, update, subOperations, options } = parsedArgs
  let args: TArgs

  if (op === CrudOperation.InsertOne) args = [documents[0], options] as TArgs
  else if (op === CrudOperation.InsertMany) args = [documents, options] as TArgs
  else if (UPDATE_OPERATIONS.has(op)) args = [query, update, options] as TArgs
  else if (REPLACE_OPERATIONS.has(op)) args = [query, documents[0], options] as TArgs
  else if (DELETE_OPERATIONS.has(op)) args = [query, options] as TArgs
  else if (op === CrudOperation.BulkWrite) args = [subOperations, options] as TArgs

  return args
}

export const isParsedCrudOperationArgs = (
  test: any[] | ParsedCrudOperationArgs
): test is ParsedCrudOperationArgs => {
  const propNames = new Set(Object.keys(test))
  return (
    propNames.has('query') &&
    propNames.has('documents') &&
    propNames.has('update') &&
    propNames.has('subOperations') &&
    propNames.has('options')
  )
}
