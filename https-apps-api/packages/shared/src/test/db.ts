import { Connection } from '@mikro-orm/core'
import { config, ENUMS } from '..'

const tableNamesToOmit = ['ar_internal_metadata', 'schema_migrations']

const generateTruncateStatements = () => `
  SELECT CONCAT('TRUNCATE TABLE ', table_name, ';')
  FROM information_schema.tables
  WHERE table_schema = '${config.database.dbName}'
  AND table_name NOT IN (${tableNamesToOmit.map(name => `'${name}'`).join(', ')});
`

/**
 * Creates a stored procedure that will truncate all the data (except for "tablesToOmit" array)
 * @param connection Connection
 */
const initDeleteProcedure = async (connection: Connection): Promise<void> => {
  if (config.env !== ENUMS.ENVS.TEST) {
    throw new Error('Database truncate cannot run in different config env.')
  }

  const truncateStatementsRes = await connection.execute(generateTruncateStatements())
  const statements: string[] = truncateStatementsRes.map(row => Object.values(row).pop())
  const procedure = `
    CREATE PROCEDURE \`${config.database.dbName}\`.droptest ()
    BEGIN
      set foreign_key_checks = 0;
      ${statements.join(' \n')}
	    set foreign_key_checks = 1;
    END;
  `
  await connection.execute(`DROP PROCEDURE IF EXISTS \`${config.database.dbName}\`.droptest;`)
  await connection.execute(procedure)
}

const dropData = (connection: Connection): Promise<void> =>
  connection.execute(`CALL  \`${config.database.dbName}\`.droptest();`)

export { initDeleteProcedure, dropData }
