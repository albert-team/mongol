const OMITTED_KEYWORDS = ['$ref', '$schema', 'default', 'definitions', 'format', 'id']

const removeUnsupportedKeywords = (schema: object, removeType: boolean): object => {
  const result = {}

  for (const [k, v] of Object.entries(schema)) {
    if (OMITTED_KEYWORDS.includes(k)) continue
    if (removeType && k === 'type') continue

    if (v instanceof Array) {
      result[k] = v.map((item) => {
        if (item instanceof Object) return removeUnsupportedKeywords(item, removeType)
        return item
      })
    } else if (v instanceof Object) {
      result[k] = removeUnsupportedKeywords(v, removeType)
    } else result[k] = v
  }
  return result
}

export { removeUnsupportedKeywords }
