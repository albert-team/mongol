import { REPLACE_OPERATIONS, UPDATE_OPERATIONS } from '../constants'
import {
  AutoTimestampOptions,
  CrudOperation,
  DatabaseHook,
  NamingConvention
} from '../types'
import { withTimestamp } from '../utils'

export const autoTimestamp = (options: AutoTimestampOptions = {}): DatabaseHook => {
  const {
    namingConventions = [NamingConvention.Unchanged, NamingConvention.CamelCase]
  } = options
  const [, dbNC] = namingConventions
  const caPropName = dbNC === NamingConvention.SnakeCase ? 'created_at' : 'createdAt'
  const uaPropName = dbNC === NamingConvention.SnakeCase ? 'updated_at' : 'updatedAt'

  return {
    before: (context, ...args) => {
      const { operation: op } = context

      if (op === CrudOperation.InsertOne)
        // args = doc, options
        args[0] = withTimestamp(args[0], caPropName)
      else if (op === CrudOperation.InsertMany)
        // args = docs, options
        args[0] = args[0].map((doc) => withTimestamp(doc, caPropName))
      else if (UPDATE_OPERATIONS.includes(op))
        // args = filter, update, options
        args[1] = { ...args[1], $currentDate: { [uaPropName]: true } }
      else if (REPLACE_OPERATIONS.includes(op))
        // args = filter, replacement, options
        args[1] = withTimestamp(args[1], uaPropName)
      else if (op === CrudOperation.BulkWrite)
        // args = operations, options
        args[0] = args[0].map((subOp) => {
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
      return args
    }
  } as DatabaseHook
}
