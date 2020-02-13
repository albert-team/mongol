/* eslint-disable @typescript-eslint/no-var-requires */
const { Mongol } = require('..')

const main = async () => {
  const mongol = new Mongol(
    'mongodb+srv://admin:admin@taiwan0-ishqm.gcp.mongodb.net/test?retryWrites=true&w=majority',
    'testdb'
  )

  try {
    await mongol.connect()
    const db = mongol.database

    const coll1 = db.collection('testcoll')
    const coll2 = mongol.attachDatabaseHook(coll1, {
      before: (context) => {
        console.log('inner hook', context)
      },
      after: (context) => {
        console.log('inner hook', context)
      }
    })
    const coll3 = mongol.attachDatabaseHook(coll2, {
      before: (context) => {
        console.log('outer hook', context)
      },
      after: (context) => {
        console.log('outer hook', context)
      }
    })
    await coll1.insertOne({ foo: 'bar' })
  } catch (err) {
    console.error(err)
  } finally {
    await mongol.disconnect()
  }
}

main()
