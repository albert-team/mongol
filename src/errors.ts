class DbNotFoundError extends ReferenceError {
  constructor() {
    super('Database not found. MongoClient must be connected beforehand.')
  }
}

export { DbNotFoundError }
