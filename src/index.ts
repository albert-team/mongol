import { MongoClient, Db, Collection } from 'mongodb'

/**
 * MongoDB helpers class.
 */
class Mongol {
  private readonly client: MongoClient
  private readonly db: Db

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri, { useNewUrlParser: true })
    this.db = this.client.db(dbName)
  }

  /** Connect to the database. */
  public async connect(): Promise<void> {
    await this.client.connect()
  }

  /** Disconnect from the database. */
  public async disconnect(): Promise<void> {
    await this.client.close()
  }

  /** Get a collection.
   * @param name Collection name.
   * @param schema JSON schema. If provided, it will be added to the collection on created.
   */
  public async getCollection(name: string, schema: object = null): Promise<Collection> {
    if (schema) {
      const collections = await this.db.collections()
      const collectionNames = collections.map((collection) => collection.collectionName)
      if (!collectionNames.includes(name)) {
        await this.db.createCollection(name, { validator: { $jsonSchema: schema } })
      }
    }
    return this.db.collection(name)
  }
}

export { Mongol }
