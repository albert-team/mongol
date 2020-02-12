const getSchemaProxy = (schema: object, invalidProps: string[]): object => {
  const handler: ProxyHandler<object> = {
    get: (target: object, prop: string, receiver: any): any => {
      if (invalidProps.includes(prop)) return undefined

      const value = Reflect.get(target, prop, receiver)

      if (value instanceof Array) {
        return value.map((item) => {
          if (item instanceof Object) return getSchemaProxy(item, invalidProps)
          return item
        })
      }
      if (value instanceof Object) {
        return getSchemaProxy(value, invalidProps)
      }
      return value
    }
  }
  return new Proxy(schema, handler)
}

export { getSchemaProxy }
