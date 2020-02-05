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
 * Mongol does not fully support all operations, especially deprecated ones.
 */
export enum CrudOperation {
  DeleteMany = 'deleteMany',
  DeleteOne = 'deleteOne',
  FindOne = 'findOne',
  FindOneAndDelete = 'findOneAndDelete',
  FindOneAndReplace = 'findOneAndReplace',
  FindOneAndUpdate = 'findOneAndUpdate',
  InsertMany = 'insertMany',
  InsertOne = 'insertOne',
  ReplaceOne = 'replaceOne',
  UpdateMany = 'updateMany',
  UpdateOne = 'updateOne'
}

type DatabaseHookEvent = 'before' | 'during' | 'after'

interface DatabaseHookContext {
  operation: CrudOperation
  event: DatabaseHookEvent
}

type DatabaseBeforeHookHandler = (context: DatabaseHookContext, ...args) => void

type DatabaseAfterHookHandler = (context: DatabaseHookContext, result) => void

// type DatabaseErrorHookHandler = (context: DatabaseHookContext, error: Error) => void

export interface DatabaseHook {
  before?: DatabaseBeforeHookHandler
  after?: DatabaseAfterHookHandler
  // error?: DatabaseErrorHookHandler
}
