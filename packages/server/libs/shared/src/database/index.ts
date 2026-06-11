import { Connection, MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'

let mainORM: MikroORM<MySqlDriver>

const init = (main: MikroORM<MySqlDriver>): void => {
  mainORM = main
}

interface DatabaseManager {
  init: (main: MikroORM<MySqlDriver>) => void
  orm: () => MikroORM<MySqlDriver>
  connection: () => Connection
}

export const database: DatabaseManager = {
  init,
  orm: (): MikroORM<MySqlDriver> => mainORM,
  connection: (): Connection => mainORM.em.getConnection(),
}
