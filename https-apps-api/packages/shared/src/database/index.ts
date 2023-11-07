import { Connection, MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'
import { config } from '..'
import { DatabaseService, IDatabaseService } from './database.service'

let db: IDatabaseService | null
let dbReplica: IDatabaseService | null

const createDatabaseService = (): IDatabaseService => {
  db = new DatabaseService(config.database.clientUrl, config.database.debug)
  return db
}

const createDatabaseReplicaService = (): IDatabaseService => {
  dbReplica = new DatabaseService(config.databaseReplica.clientUrl, config.databaseReplica.debug)
  return dbReplica
}

const start = async(): Promise<void> => {
  if (!db) {
    db = createDatabaseService()
  }
  await db.start()
}

const stop = async(): Promise<void> => {
  if (db) {
    await db.stop()
  }
  if (dbReplica) {
    await dbReplica.stop()
  }
}

// TODO: In the future this will be created and injected by DI, but for now
//       keeping the exported functions as-is because the refactor touches many files
export const database = {
  start: start,
  stop: stop,
  orm: (): MikroORM<MySqlDriver> => db!.getOrm()!,
  connection: (): Connection => db!.getOrm()!.em.getConnection(),
  createDatabaseReplicaService,
}
