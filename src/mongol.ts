import { Collection, Db, MongoClient } from 'mongodb'
import { OMITTED_JSON_SCHEMA_KEYWORDS } from './constants'
import { DatabaseHookError, DbNotFoundError } from './errors'
import {
  CrudOp,
  CrudOperation,
  DatabaseHook,
  DatabaseHookBeforeContext,
  DatabaseHookContext,
  MongolOptions,
  SchemaOptions
} from './types'
import {
  getCrudOp,
  isParsedCrudOperationArgs,
  parseCrudOperationArgs,
  removeProperties,
  unparseCrudOperationArgs
} from './utils'

/**
 * MongoDB helpers class.
 */
export class Mongol {
  private readonly client: MongoClient
  private readonly dbName: string
  private readonly options: MongolOptions
  private db: Db

  constructor(uri: string, dbName: string, options: MongolOptions = {}) {
    this.options = Object.assign(
      {
        client: { useNewUrlParser: true, useUnifiedTopology: true }
      },
      options
    )
    this.client = new MongoClient(uri, this.options.client)
    this.dbName = dbName
  }

  /** Database instance.
   *
   * In upcoming minor versions, this will be deprecated. In the next major version, this will be removed.
   */
  get database(): Db {
    if (!this.client.isConnected()) throw new DbNotFoundError()
    return this.db
  }

  /** Database instance, as a Promise. */
  get promisifiedDatabase(): Promise<Db> {
    if (!this.client.isConnected()) {
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
   * @returns Actually used JSON schema.
   */
  public async setSchema(
    collectionName: string,
    schema: object,
    options: SchemaOptions = {}
  ): Promise<object> {
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

    return schema
  }

  /** Attach a database hook to a collection.
   * @param collection Collection.
   * @param hook Database hook/trigger.
   * @returns Collection with the hook attached.
   */
  public attachDatabaseHook<TSchema, TArgs extends any[], TResult>(
    collection: Collection<TSchema>,
    hook: DatabaseHook<TArgs, TResult>
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
  private withDatabaseHook<TArgs extends any[], TResult>(
    fn: Function,
    hook: DatabaseHook<TArgs, TResult>,
    operation: CrudOperation
  ): Function {
    const op: CrudOp = getCrudOp(operation)

    return async (...args: TArgs): Promise<any> => {
      const parsedArgs = parseCrudOperationArgs(operation, args)
      let context: DatabaseHookContext
      let newArgs: TArgs

      try {
        context = {
          operation,
          op,
          event: 'before',
          arguments: parsedArgs
        } as DatabaseHookBeforeContext
        if (hook.before) {
          const result = await hook.before(context as DatabaseHookBeforeContext, args)
          if (!result) newArgs = args
          else if (isParsedCrudOperationArgs(result))
            newArgs = unparseCrudOperationArgs(operation, result)
          else newArgs = result
        }

        context = { operation, op, event: 'during' }
        const result = await fn(...newArgs)

        context = { operation, op, event: 'after' }
        if (hook.after) await hook.after(context, result)
        return result
      } catch (err) {
        if (hook.error) await hook.error(context, err)
        throw new DatabaseHookError(err.message, context)
      }
    }
  }
}
