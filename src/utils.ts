export const removeProperties = (schema: object, propNames: string[]): object => {
  const result = {}

  for (const [k, v] of Object.entries(schema)) {
    if (propNames.includes(k)) continue

    if (v instanceof Array) {
      result[k] = v.map((item) => {
        if (item instanceof Object) return removeProperties(item, propNames)
        return item
      })
    } else if (v instanceof Object) {
      result[k] = removeProperties(v, propNames)
    } else result[k] = v
  }
  return result
}

export const withTimestamp = <T>(doc: T, propName: string): T => {
  doc[propName] = new Date()
  return doc
}
