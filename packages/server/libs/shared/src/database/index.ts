import { Connection, MikroORM } from '@mikro-orm/core'
import { MySqlDriver } from '@mikro-orm/mysql'

let mainORM: MikroORM<MySqlDriver>

const init = (main: MikroORM<MySqlDriver>) => {
  mainORM = main
}

export const database = {
  init,
  orm: () => mainORM,
  connection: (): Connection => mainORM.em.getConnection(),
}
