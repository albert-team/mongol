import { DatabaseHookContext } from './types'

export class DbNotFoundError extends ReferenceError {
  constructor() {
    super('Database not found. The client may be disconnected from the database server.')
  }
}

export class DatabaseHookError extends Error {
  public readonly context: DatabaseHookContext

  constructor(message = 'Database hook error.', context: DatabaseHookContext) {
    super(message)
    this.context = context
  }
}
