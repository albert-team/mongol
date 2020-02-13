import { DatabaseHook, DatabaseHookContext, CrudOperation } from '../types'
import { withCreatedAt, withUpdatedAt } from '../utils'

interface AutoTimestampOptions {
  useSnakeCase?: boolean
  // softDelete?: boolean
}

export const autoTimestamp = (options: AutoTimestampOptions): DatabaseHook => {
  const { useSnakeCase = false } = options

  const hook: DatabaseHook = {
    before: (context: DatabaseHookContext, ...args) => {
      const { operation: op } = context

      if ([CrudOperation.FindOneAndReplace, CrudOperation.ReplaceOne].includes(op)) {
        // args = filter, replacement, options
        args[1] = withUpdatedAt(args[1], useSnakeCase)
      } else if (
        [
          CrudOperation.FindOneAndUpdate,
          CrudOperation.UpdateMany,
          CrudOperation.UpdateOne
        ].includes(op)
      ) {
        // args = filter, update, options
        args[1] = {
          ...args[1],
          $currentDate: { [useSnakeCase ? 'updated_at' : 'updatedAt']: true }
        }
      } else if (op === CrudOperation.InsertMany) {
        // args = docs, options
        args[0] = args[0].map((doc) => withCreatedAt(doc, useSnakeCase))
      } else if (op === CrudOperation.InsertOne) {
        // args = doc, options
        args[0] = withCreatedAt(args[0], useSnakeCase)
      }

      return args
    }
  }

  return hook
}
