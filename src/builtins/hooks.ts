import { CrudOp, DatabaseHook, NamingConvention, TimestampHookOptions } from '../types'
import { withTimestamp } from '../utils'

/** Timestamp hook factory function. */
export const createTimestampHook = <TArray extends any[], T>(
  options: TimestampHookOptions = {}
): DatabaseHook<TArray, T> => {
  const {
    namingConventions = [NamingConvention.Unchanged, NamingConvention.CamelCase]
  } = options
  const [, dbNC] = namingConventions
  const caPropName = dbNC === NamingConvention.SnakeCase ? 'created_at' : 'createdAt'
  const uaPropName = dbNC === NamingConvention.SnakeCase ? 'updated_at' : 'updatedAt'

  return {
    before: (context) => {
      const { op, arguments: args } = context
      const { query, options } = args
      let { documents, update, subOperations } = args

      if (op === CrudOp.Insert)
        documents = documents.map((doc) => withTimestamp(doc, caPropName))
      else if (op === CrudOp.Update)
        update = { ...update, $currentDate: { [uaPropName]: true } }
      else if (op === CrudOp.Replace)
        documents = documents.map((doc) => withTimestamp(doc, uaPropName))
      else if (op === CrudOp.BulkWrite)
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
  } as DatabaseHook<TArray, T>
}

/**
 * @deprecated Since v0.5.0. Use [[createTimestampHook]] instead.
 */
export const autoTimestamp = createTimestampHook
