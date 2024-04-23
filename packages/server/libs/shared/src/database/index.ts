import { Connection, MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'

let mainORM: MikroORM<MySqlDriver>
let readOnlyORM: MikroORM<MySqlDriver>

const init = (main: MikroORM<MySqlDriver>, readOnly: MikroORM<MySqlDriver>) => {
  mainORM = main
  readOnlyORM = readOnly
}

const getReadOnlyEM = async () => {
  const connected = await readOnlyORM?.isConnected()

  if (!connected) {
    throw new Error('Readonly DB connection not established')
  }

  return readOnlyORM.em.fork()
}

export const database = {
  init,
  orm: () => mainORM,
  getReadOnlyEM,
  connection: (): Connection => mainORM.em.getConnection(),
}
