import { MongoClient, Db } from 'mongodb'
import { OMITTED_JSON_SCHEMA_KEYWORDS } from './constants'
import { DbNotFoundError } from './errors'
import { removeProperties } from './utils'

/**
 * Options when setting JSON schemas.
 */
interface SchemaOptions {
  /**
   * Ignore some JSON schema keywords MongoDB does not support, instead of throwing errors.
   *
   * They are: $ref, $schema, default, definitions, format, id.
   */
  ignoreUnsupportedKeywords?: boolean

  /** Ignore "type" keyword, so as not to conflict with "bsonType".
   */
  ignoreType?: boolean
}

/**
 * MongoDB helpers class.
 */
class Mongol {
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

  /** Database instance. */
  get database(): Db {
    if (!this.db) throw new DbNotFoundError()
    return this.db
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
  }

  /**
   * Add or update JSON schema for a collection.
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
}

export { Mongol }
