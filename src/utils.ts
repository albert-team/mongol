import { DELETE_OPERATIONS, REPLACE_OPERATIONS, UPDATE_OPERATIONS } from './constants'
import { CrudOperation, ParsedCrudOperationArgs } from './types'

export const removeProperties = (schema: object, propNames: Set<string>): object => {
  const result = {}

  for (const [k, v] of Object.entries(schema)) {
    if (propNames.has(k)) continue

    if (v instanceof Array) {
      result[k] = v.map((item) => {
        if (item instanceof Object) return removeProperties(item, propNames)
        return item
      })
    } else if (v instanceof Object) {
      result[k] = removeProperties(v, propNames)
    } else result[k] = v
  }
  return result
}

export const withTimestamp = <T>(doc: T, propName: string): T => {
  doc[propName] = new Date()
  return doc
}

export const parsedCrudOperationArgs = <TArray extends any[]>(
  op: CrudOperation,
  args: TArray
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

export const unparseCrudOperationArgs = (
  op: CrudOperation,
  parsedArgs: ParsedCrudOperationArgs
): any[] => {
  const { query, documents, update, subOperations, options } = parsedArgs
  let args: any[]

  if (op === CrudOperation.InsertOne) args = [documents[0], options]
  else if (op === CrudOperation.InsertMany) args = [documents, options]
  else if (UPDATE_OPERATIONS.has(op)) args = [query, update, options]
  else if (REPLACE_OPERATIONS.has(op)) args = [query, documents[0], options]
  else if (DELETE_OPERATIONS.has(op)) args = [query, options]
  else if (op === CrudOperation.BulkWrite) args = [subOperations, options]

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
