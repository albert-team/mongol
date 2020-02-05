import { MongoClient, Db, Collection } from 'mongodb'
import { OMITTED_JSON_SCHEMA_KEYWORDS } from './constants'
import { DbNotFoundError } from './errors'
import { SchemaOptions, DatabaseHook, CrudOperation } from './types'
import { removeProperties } from './utils'

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

  /** Attach a database hook to a collection and return the monkey-patched one.
   * @param collection Collection.
   * @param hook Hook/trigger.
   * @returns Collection with the hook attached.
   */
  public attachDatabaseHook(collection: Collection, hook: DatabaseHook): Collection {
    for (const [op, fn] of Object.entries(CrudOperation)) {
      const original: Function = collection[fn]
      collection[fn] = async (...args): Promise<any> => {
        const operation = CrudOperation[op]
        if (hook.before) hook.before({ operation, event: 'before' }, ...args)
        const result = await original(...args)
        if (hook.after) hook.after({ operation, event: 'after' }, result)
        return result
      }
    }
    return collection
  }
}
