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

/** Database hook context. */
interface DatabaseHookContext {
  operation: CrudOperation
  event: DatabaseHookEvent
}

/** Database hook "before" handler. */
type DatabaseBeforeHookHandler = (
  context: DatabaseHookContext,
  ...args
) => void | any[] | Promise<void> | Promise<any[]>

/** Database hook "after" handler. */
type DatabaseAfterHookHandler = (
  context: DatabaseHookContext,
  result
) => void | Promise<void>

/** Database hook "error" handler. */
type DatabaseErrorHookHandler = (
  context: DatabaseHookContext,
  error: Error
) => void | Promise<void>

/** Database hook. */
export interface DatabaseHook {
  before?: DatabaseBeforeHookHandler
  after?: DatabaseAfterHookHandler
  error?: DatabaseErrorHookHandler
}
