import {
  AutoTimestampOptions,
  CrudOperation,
  DatabaseHook,
  NamingConvention
} from '../types'
import { withTimestamp } from '../utils'

export const autoTimestamp = (options: AutoTimestampOptions): DatabaseHook => {
  const {
    namingConventions = [NamingConvention.Unchanged, NamingConvention.CamelCase]
  } = options
  const dbNC = namingConventions[1]

  return {
    before: (context, ...args) => {
      const { operation: op } = context

      if ([CrudOperation.FindOneAndReplace, CrudOperation.ReplaceOne].includes(op)) {
        // args = filter, replacement, options
        const propName = dbNC === NamingConvention.SnakeCase ? 'updated_at' : 'updatedAt'
        args[1] = withTimestamp(args[1], propName)
      } else if (
        [
          CrudOperation.FindOneAndUpdate,
          CrudOperation.UpdateMany,
          CrudOperation.UpdateOne
        ].includes(op)
      ) {
        // args = filter, update, options
        const propName = dbNC === NamingConvention.SnakeCase ? 'updated_at' : 'updatedAt'
        args[1] = { ...args[1], $currentDate: { [propName]: true } }
      } else if (op === CrudOperation.InsertMany) {
        // args = docs, options
        const propName = dbNC === NamingConvention.SnakeCase ? 'created_at' : 'createdAt'
        args[0] = args[0].map((doc) => withTimestamp(doc, propName))
      } else if (op === CrudOperation.InsertOne) {
        // args = doc, options
        const propName = dbNC === NamingConvention.SnakeCase ? 'created_at' : 'createdAt'
        args[0] = withTimestamp(args[0], propName)
      }

      return args
    }
  } as DatabaseHook
}
