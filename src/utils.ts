export const removeProperties = (schema: object, keys: string[]): object => {
  const result = {}

  for (const [k, v] of Object.entries(schema)) {
    if (keys.includes(k)) continue

    if (v instanceof Array) {
      result[k] = v.map((item) => {
        if (item instanceof Object) return removeProperties(item, keys)
        return item
      })
    } else if (v instanceof Object) {
      result[k] = removeProperties(v, keys)
    } else result[k] = v
  }
  return result
}

export const withCreatedAt = <T>(doc: T, useSnakeCase: boolean): T => {
  const prop = useSnakeCase ? 'created_at' : 'createdAt'
  doc[prop] = new Date()
  return doc
}

export const withUpdatedAt = <T>(doc: T, useSnakeCase: boolean): T => {
  const prop = useSnakeCase ? 'updated_at' : 'updatedAt'
  doc[prop] = new Date()
  return doc
}

export const withDeletedAt = <T>(doc: T, useSnakeCase: boolean): T => {
  const prop = useSnakeCase ? 'deleted_at' : 'deletedAt'
  doc[prop] = new Date()
  return doc
}
