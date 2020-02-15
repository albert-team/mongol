/** Naming conventions. */
export enum NamingConvention {
  Unchanged = 'unchanged',
  CamelCase = 'camelcase',
  SnakeCase = 'snakecase'
}

/** CRUD operations supported by MongoDB [[Collection]].
 *
 * Mongol does not support all operations, especially deprecated ones.
 */
export enum CrudOperation {
  BulkWrite = 'bulkWrite',
  DeleteMany = 'deleteMany',
  DeleteOne = 'deleteOne',
  // Find = 'find', // cannot support now
  // FindOne = 'findOne', // do not want to support now
  FindOneAndDelete = 'findOneAndDelete',
  FindOneAndReplace = 'findOneAndReplace',
  FindOneAndUpdate = 'findOneAndUpdate',
  InsertMany = 'insertMany',
  InsertOne = 'insertOne',
  ReplaceOne = 'replaceOne',
  UpdateMany = 'updateMany',
  UpdateOne = 'updateOne'
}

/** Database hook event. */
type DatabaseHookEvent = 'before' | 'during' | 'after'

/** Parsed CRUD operation arguments. */
export interface ParsedCrudOperationArgs {
  /** In delete, replace, update operations. */
  query: object
  /** In insert, replace operations. */
  documents: object[]
  /** In update operations. */
  update: object
  /** In bulkwrite operation. */
  subOperations: any[]
  /** In all operations. */
  options: object
}

/** Database hook context. */
export interface DatabaseHookContext {
  operation: CrudOperation
  event: DatabaseHookEvent
}

/** Database hook context for "before" handler. */
export interface DatabaseHookBeforeContext extends DatabaseHookContext {
  arguments: ParsedCrudOperationArgs
}

/** Database hook "before" handler. */
type DatabaseHookBeforeHandler = <TArray extends any[]>(
  context: DatabaseHookBeforeContext,
  args: TArray
) =>
  | void
  | TArray
  | ParsedCrudOperationArgs
  | Promise<void>
  | Promise<TArray>
  | Promise<ParsedCrudOperationArgs>

/** Database hook "after" handler. */
type DatabaseHookAfterHandler = (
  context: DatabaseHookContext,
  result
) => void | Promise<void>

/** Database hook "error" handler. */
type DatabaseHookErrorHandler = (
  context: DatabaseHookContext,
  error: Error
) => void | Promise<void>

/** Database hook. */
export interface DatabaseHook {
  before?: DatabaseHookBeforeHandler
  after?: DatabaseHookAfterHandler
  error?: DatabaseHookErrorHandler
}

/**
 * Options when setting JSON schemas.
 */
export interface SchemaOptions {
  /**
   * Ignore some JSON schema keywords MongoDB does not support, instead of throwing errors.
   * @see OMITTED_JSON_SCHEMA_KEYWORDS
   */
  ignoreUnsupportedKeywords?: boolean
  /** Ignore "type" keyword, so as not to conflict with "bsonType".
   */
  ignoreType?: boolean
}

/** Options for [[autoTimestamp]] hook. */
export interface AutoTimestampOptions {
  /** Naming conventions in source code and in database, default to [NamingConvention.Unchanged, NamingConvention.CamelCase]. */
  namingConventions?: [NamingConvention, NamingConvention]
}
