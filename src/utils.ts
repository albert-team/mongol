const removeProperties = (schema: object, keys: string[]): object => {
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

export { removeProperties }
