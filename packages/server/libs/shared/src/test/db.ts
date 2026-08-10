import { Connection } from '@mikro-orm/core'
import { config } from '@shared/config'

const tableNamesToOmit = ['ar_internal_metadata', 'schema_migrations']

const selectTableNames = (): string => `
  SELECT table_name AS tableName
  FROM information_schema.tables
  WHERE table_schema = '${config.database.dbName}'
  AND table_name NOT IN (${tableNamesToOmit.map(name => `'${name}'`).join(', ')});
`

/**
 * TRUNCATE is DDL - MySQL drops and recreates the tablespace on every call, which costs roughly
 * 10ms per table even when the table is already empty. Since a test only ever touches a handful of
 * the ~70 tables, guarding each TRUNCATE with a cheap emptiness probe skips almost all of that work.
 * Semantics are unchanged: a table that holds rows is still truncated (so AUTO_INCREMENT resets),
 * and a table that is already empty was left reset by the TRUNCATE that emptied it.
 */
const truncateIfNotEmpty = (tableName: string): string =>
  `IF (SELECT 1 FROM \`${tableName}\` LIMIT 1) IS NOT NULL THEN TRUNCATE TABLE \`${tableName}\`; END IF;`

/**
 * Creates a stored procedure that will truncate all the data (except for "tablesToOmit" array)
 * @param connection Connection
 */
const initDeleteProcedure = async (connection: Connection): Promise<void> => {
  const rows = await connection.execute<{ tableName: string }[]>(selectTableNames())
  const statements = rows.map(({ tableName }) => truncateIfNotEmpty(tableName))
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

export { dropData, initDeleteProcedure }
