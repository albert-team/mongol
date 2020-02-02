class DbNotFoundError extends ReferenceError {
  constructor() {
    super('Database not found. The client may be disconnected from the database server.')
  }
}

export { DbNotFoundError }
