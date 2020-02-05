import { MongoClient, Db, Collection } from 'mongodb'
import { OMITTED_JSON_SCHEMA_KEYWORDS } from './constants'
import { DbNotFoundError } from './errors'
import { removeProperties } from './utils'

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
 * Mongol does not support deprecated operations.
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

/** CRUD operation hook context. */
export interface CrudOperationHookContext {
  operation: CrudOperation
}

/** CRUD operation hook handler function. */
export type CrudOperationHookHandler = (
  context: CrudOperationHookContext,
  ...args
) => void

/** CRUD operation hook. */
export interface CrudOperationHook {
  before?: CrudOperationHookHandler
  after?: CrudOperationHookHandler
}

/**
 * MongoDB helpers class.
 */
export class Mongol {
  private readonly client: MongoClient
  private readonly dbName: string
  private db: Db

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    this.dbName = dbName
  }

  /** Database instance.
   *
   * In upcoming minor versions, this will be deprecated. In the next major version, this will be removed.
   */
  get database(): Db {
    if (!this.db) throw new DbNotFoundError()
    return this.db
  }

  /** Database instance, as a Promise. */
  get promisifiedDatabase(): Promise<Db> {
    if (!this.db) {
      return this.client
        .connect()
        .then((client) => client.db(this.dbName))
        .catch(() => {
          throw new DbNotFoundError()
        })
    }
    return Promise.resolve(this.db)
  }

  /** Connect to the database.
   *
   * In upcoming minor versions, this will do nothing. In the next major version, this will be removed.
   */
  public async connect(): Promise<void> {
    await this.client.connect()
    this.db = this.client.db(this.dbName)
  }

  /** Disconnect from the database.
   *
   * In upcoming minor versions, this will do nothing. In the next major version, this will be removed.
   */
  public async disconnect(): Promise<void> {
    await this.client.close()
    this.db = undefined
  }

  /**
   * Add or update JSON schema of a collection.
   * @param collectionName Collection name.
   * @param schema JSON schema.
   * @param options Options.
   */
  public async setSchema(
    collectionName: string,
    schema: object,
    options: SchemaOptions = {}
  ): Promise<void> {
    if (!this.db) throw new DbNotFoundError()

    const { ignoreUnsupportedKeywords = true, ignoreType = false } = options
    const keys = [] // properties to remove
    if (ignoreUnsupportedKeywords) keys.push(...OMITTED_JSON_SCHEMA_KEYWORDS)
    if (ignoreType) keys.push('type')
    schema = removeProperties(schema, keys)

    const collections = await this.db.collections()
    const collectionNames = collections.map((collection) => collection.collectionName)

    if (!collectionNames.includes(collectionName)) {
      await this.db.createCollection(collectionName, {
        validator: { $jsonSchema: schema }
      })
    } else {
      await this.db.command({
        collMod: collectionName,
        validator: { $jsonSchema: schema }
      })
    }
  }

  /** Attach a CRUD operation hook to a collection and return the monkey-patched one.
   * @param collection Collection.
   * @param hook Hook/trigger.
   * @returns Collection with the hook attached.
   */
  public attachHook(collection: Collection, hook: CrudOperationHook): Collection {
    for (const [operation, method] of Object.entries(CrudOperation)) {
      const original: Function = collection[method]
      collection[method] = async (...args): Promise<any> => {
        if (hook.before) hook.before({ operation: CrudOperation[operation] }, ...args)
        const result = await original(...args)
        if (hook.after) hook.after({ operation: CrudOperation[operation] }, result)
        return result
      }
    }
    return collection
  }
}
