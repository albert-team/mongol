import { MongoClient, Db } from 'mongodb'
import { DbNotFoundError } from './errors'

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

  /** Connect to the database. */
  public async connect(): Promise<void> {
    await this.client.connect()
    this.db = this.client.db(this.dbName)
  }

  /** Disconnect from the database. */
  public async disconnect(): Promise<void> {
    await this.client.close()
  }

  /**
   * Add or update JSON schema for a collection.
   * @param collectionName Collection name.
   * @param schema JSON schema.
   */
  public async setSchema(collectionName: string, schema: object): Promise<void> {
    if (!this.db) throw new DbNotFoundError()

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
