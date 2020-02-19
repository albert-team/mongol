import { MongoClientOptions } from 'mongodb'

/** Naming conventions. */
export enum NamingConvention {
  Unchanged = 'unchanged',
  CamelCase = 'camelcase',
  SnakeCase = 'snakecase'
}

/** CRUD operations supported by MongoDB driver, but more specific than [[CrudOp]].
 *
 * Mongol does not try to support all operations, especially deprecated ones.
 */
export enum CrudOperation {
  BulkWrite = 'bulkWrite',
  DeleteMany = 'deleteMany',
  DeleteOne = 'deleteOne',
  FindOneAndDelete = 'findOneAndDelete',
  FindOneAndReplace = 'findOneAndReplace',
  FindOneAndUpdate = 'findOneAndUpdate',
  InsertMany = 'insertMany',
  InsertOne = 'insertOne',
  ReplaceOne = 'replaceOne',
  UpdateMany = 'updateMany',
  UpdateOne = 'updateOne'
}

/** CRUD operations supported by MongoDB driver, but more generic than [[CrudOperation]]. */
export enum CrudOp {
  BulkWrite = 'bulkWrite',
  Delete = 'delete',
  Insert = 'insert',
  Replace = 'replace',
  Update = 'update'
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
  op: CrudOp
  event: DatabaseHookEvent
}

/** Database hook context for "before" handler. */
export interface DatabaseHookBeforeContext extends DatabaseHookContext {
  arguments: ParsedCrudOperationArgs
}

/** Database hook "before" handler. */
export interface DatabaseHookBeforeHandler<TArgs extends any[]> {
  (context: DatabaseHookBeforeContext, args: TArgs):
    | void
    | TArgs
    | ParsedCrudOperationArgs
    | Promise<void>
    | Promise<TArgs>
    | Promise<ParsedCrudOperationArgs>
}

/** Database hook "after" handler. */
export interface DatabaseHookAfterHandler<TResult> {
  (context: DatabaseHookContext, result: TResult): void | Promise<void>
}

/** Database hook "error" handler.
 * @deprecated Since v0.7.0. Use normal try-catch blocks instead.
 */
export interface DatabaseHookErrorHandler {
  (context: DatabaseHookContext, error: Error): void | Promise<void>
}

/** Database hook. */
export interface DatabaseHook<TArgs extends any[], TResult> {
  before?: DatabaseHookBeforeHandler<TArgs>
  after?: DatabaseHookAfterHandler<TResult>
  /** @deprecated Since v0.7.0. Use normal try-catch blocks instead. */
  error?: DatabaseHookErrorHandler
}

/** Mongol constructor options. */
export interface MongolOptions {
  client?: MongoClientOptions
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

/** Timestamp hook options. */
export interface TimestampHookOptions {
  /** Naming conventions in source code and in database, default to [NamingConvention.Unchanged, NamingConvention.CamelCase]. */
  namingConventions?: [NamingConvention, NamingConvention]
}
