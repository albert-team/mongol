import { OMITTED_JSON_SCHEMA_KEYWORDS } from './constants'
import { getSchemaProxy } from './utils'

let sampleSchema

beforeEach(() => {
  sampleSchema = {
    type: 'object',
    bsonType: 'object',
    required: ['name', 'dateOfBirth', 'accountBalance'],
    properties: {
      name: {
        type: 'string',
        bsonType: 'string',
        minLength: 8
      },
      dateOfBirth: {
        type: 'string',
        bsonType: 'date',
        format: 'date'
      },
      accountBalance: {
        type: 'integer',
        bsonType: 'int',
        default: 0
      },
      address: {
        type: 'array',
        bsonType: 'array',
        items: [
          {
            type: 'string',
            bsonType: 'string',
            description: 'Detail address'
          },
          {
            enum: ['Ha Noi', 'Ho Chi Minh City'],
            description: 'City'
          },
          {
            type: 'string',
            bsonType: 'string',
            description: 'Country'
          }
        ]
      }
    }
  }
})

test('getSchemaProxy(), without removing type', () => {
  const result = {
    type: 'object',
    bsonType: 'object',
    required: ['name', 'dateOfBirth', 'accountBalance'],
    properties: {
      name: {
        type: 'string',
        bsonType: 'string',
        minLength: 8
      },
      dateOfBirth: {
        type: 'string',
        bsonType: 'date'
      },
      accountBalance: {
        type: 'integer',
        bsonType: 'int'
      },
      address: {
        type: 'array',
        bsonType: 'array',
        items: [
          {
            type: 'string',
            bsonType: 'string',
            description: 'Detail address'
          },
          {
            enum: ['Ha Noi', 'Ho Chi Minh City'],
            description: 'City'
          },
          {
            type: 'string',
            bsonType: 'string',
            description: 'Country'
          }
        ]
      }
    }
  }

  expect(getSchemaProxy(sampleSchema, OMITTED_JSON_SCHEMA_KEYWORDS)).toEqual(result)
})

test('getSchemaProxy(), with type', () => {
  const result = {
    bsonType: 'object',
    required: ['name', 'dateOfBirth', 'accountBalance'],
    properties: {
      name: {
        bsonType: 'string',
        minLength: 8
      },
      dateOfBirth: {
        bsonType: 'date'
      },
      accountBalance: {
        bsonType: 'int'
      },
      address: {
        bsonType: 'array',
        items: [
          {
            bsonType: 'string',
            description: 'Detail address'
          },
          {
            enum: ['Ha Noi', 'Ho Chi Minh City'],
            description: 'City'
          },
          {
            bsonType: 'string',
            description: 'Country'
          }
        ]
      }
    }
  }

  expect(getSchemaProxy(sampleSchema, [...OMITTED_JSON_SCHEMA_KEYWORDS, 'type'])).toEqual(
    result
  )
})
