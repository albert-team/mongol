import { INSERT_OPERATIONS, REPLACE_OPERATIONS, UPDATE_OPERATIONS } from '../constants'
import {
  CrudOperation,
  DatabaseHook,
  NamingConvention,
  TimestampHookOptions
} from '../types'
import { withTimestamp } from '../utils'

/** Timestamp hook factory function. */
export const createTimestampHook = (options: TimestampHookOptions = {}): DatabaseHook => {
  const {
    namingConventions = [NamingConvention.Unchanged, NamingConvention.CamelCase]
  } = options
  const [, dbNC] = namingConventions
  const caPropName = dbNC === NamingConvention.SnakeCase ? 'created_at' : 'createdAt'
  const uaPropName = dbNC === NamingConvention.SnakeCase ? 'updated_at' : 'updatedAt'

  return {
    before: (context) => {
      const { operation: op, arguments: args } = context
      const { query, options } = args
      let { documents, update, subOperations } = args

      if (INSERT_OPERATIONS.has(op))
        documents = documents.map((doc) => withTimestamp(doc, caPropName))
      else if (UPDATE_OPERATIONS.has(op))
        update = { ...update, $currentDate: { [uaPropName]: true } }
      else if (REPLACE_OPERATIONS.has(op))
        documents = documents.map((doc) => withTimestamp(doc, uaPropName))
      else if (op === CrudOperation.BulkWrite)
        subOperations = subOperations.map((subOp) => {
          if (subOp.insertOne)
            subOp.insertOne.document = withTimestamp(subOp.insertOne.document, caPropName)
          else if (subOp.updateOne)
            subOp.updateOne.update = {
              ...subOp.updateOne.update,
              $currentDate: { [uaPropName]: true }
            }
          else if (subOp.updateMany)
            subOp.updateMany.update = {
              ...subOp.updateMany.update,
              $currentDate: { [uaPropName]: true }
            }
          else if (subOp.replaceOne)
            subOp.replaceOne.replacement = withTimestamp(
              subOp.replaceOne.replacement,
              uaPropName
            )
          return subOp
        })
      return { query, documents, update, subOperations, options }
    }
  } as DatabaseHook
}

/**
 * @deprecated Since v0.5.0. Use [[createTimestampHook]] instead.
 */
export const autoTimestamp = createTimestampHook
