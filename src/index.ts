import { Collection, Db, MongoClient } from 'mongodb'
import { OMITTED_JSON_SCHEMA_KEYWORDS } from './constants'
import { DbNotFoundError } from './errors'
import { CrudOperation, DatabaseHook, SchemaOptions } from './types'
import {
  isParsedCrudOperationArgs,
  parsedCrudOperationArgs,
  removeProperties,
  unparseCrudOperationArgs
} from './utils'

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
    const { ignoreUnsupportedKeywords = true, ignoreType = false } = options
    const db = await this.promisifiedDatabase
    const propNames = new Set<string>(
      ignoreUnsupportedKeywords ? OMITTED_JSON_SCHEMA_KEYWORDS : []
    )
    if (ignoreType) propNames.add('type')
    schema = removeProperties(schema, propNames)

    const collections = await db.collections()
    const collectionNames = collections.map((collection) => collection.collectionName)

    if (!collectionNames.includes(collectionName)) {
      await db.createCollection(collectionName, {
        validator: { $jsonSchema: schema }
      })
    } else {
      await db.command({
        collMod: collectionName,
        validator: { $jsonSchema: schema }
      })
    }
  }

  /** Attach a database hook to a collection.
   * @param collection Collection.
   * @param hook Database hook/trigger.
   * @returns Collection with the hook attached.
   */
  public attachDatabaseHook<TSchema>(
    collection: Collection<TSchema>,
    hook: DatabaseHook
  ): Collection<TSchema> {
    for (const op of Object.values(CrudOperation)) {
      const originalFn = collection[op].bind(collection)
      collection[op] = this.withDatabaseHook(originalFn, hook, op) as any
    }
    return collection
  }

  /**
   * Attach a database hook to a method of MongoDB [[Collection]].
   *
   * Caution: Even if "error" hook handler is provided, all errors are rethrown.
   * @param fn Method of MongoDB [[Collection]].
   * @param hook Database hook/trigger.
   * @param operation CRUD operation respective to the method.
   */
  private withDatabaseHook(
    fn: Function,
    hook: DatabaseHook,
    operation: CrudOperation
  ): Function {
    return async (...args): Promise<any> => {
      let newArgs = args
      try {
        if (hook.before) {
          const parsedArgs = parsedCrudOperationArgs(operation, args)
          const result = await hook.before(
            { operation, event: 'before', arguments: parsedArgs },
            args
          )
          if (isParsedCrudOperationArgs(result))
            newArgs = unparseCrudOperationArgs(operation, result)
          else if (result) newArgs = result
        }
      } catch (err) {
        if (hook.error) await hook.error({ operation, event: 'before' }, err)
        throw err
      }

      let result
      try {
        result = await fn(...newArgs)
      } catch (err) {
        if (hook.error) await hook.error({ operation, event: 'during' }, err)
        throw err
      }

      try {
        if (hook.after) await hook.after({ operation, event: 'after' }, result)
      } catch (err) {
        if (hook.error) await hook.error({ operation, event: 'after' }, err)
        throw err
      }

      return result
    }
  }
}
