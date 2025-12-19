import { LoadStrategy, LoggerOptions } from '@mikro-orm/core'
import { DefaultLogger, LogContext, MySqlDriver } from '@mikro-orm/mysql'
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { Logger } from '@nestjs/common'
import { config } from '@shared/config'

export interface MikroOrmConfigOptions {
  distPath: string
  sourcePath: string
}

class SQLQueryLogger extends DefaultLogger {
  logger: Logger

  constructor(
    private printValues: boolean,
    options: LoggerOptions,
  ) {
    super(options)
    this.logger = new Logger('SQL Logger')
  }

  // MikroORM calls this for most ORM-generated queries
  logQuery(context: LogContext): void {
    this.logger.log(this.formatQuery(context))
  }

  // MikroORM calls this for raw/populate loader queries
  logQueryRaw(context: LogContext): void {
    this.logger.log(this.formatQuery(context))
  }

  private formatQuery(context: LogContext): string {
    const queryText = this.printValues
      ? this.fillParams(context.query, context.params || [])
      : context.query

    const parts = [`[QUERY${context.id !== undefined ? ` ${context.id}` : ''}]`, queryText]

    if (context.took !== undefined) {
      parts.push(`[took ${context.took} ms]`)
    }

    return parts.join(' ')
  }

  private fillParams(query: string, params: unknown[]): string {
    let i = 0

    return query.replace(/\?/g, () => {
      if (i >= params.length) {
        throw new Error('Not enough parameters for query placeholders')
      }

      const param = params[i++]

      if (param === null || param === undefined) return 'NULL'
      if (typeof param === 'string') return `'${param.replace(/'/g, "''")}'`
      if (typeof param === 'number' || typeof param === 'boolean') return String(param)

      return `'${JSON.stringify(param).replace(/'/g, "''")}'`
    })
  }
}

export function getMikroOrmConfig(opts: MikroOrmConfigOptions): MikroOrmModuleSyncOptions {
  return {
    clientUrl: config.database.clientUrl,
    loggerFactory: (options) =>
      new SQLQueryLogger(config.database.printDBQueryValuesInLog, options),
    metadataProvider: TsMorphMetadataProvider,
    entities: [getEntityGlob(opts.distPath, 'js')],
    entitiesTs: [
      getEntityGlob(opts.sourcePath, 'ts'),
      getEntityGlob('./libs/shared/src', 'ts'),
      getEntityGlob(opts.distPath + '/**', 'd.ts'),
    ],
    driver: MySqlDriver,
    // v5 introduced strict checking. Having this enabled would mean a lot
    // of work, but we need to eventually reach this property to be true
    validateRequired: false,
    // useful for mysql datetime type https://mikro-orm.io/docs/configuration#forcing-utc-timezone
    // this way, created timestamps do not depend on developer's timezone
    // useful for testing database, for example
    forceUtcTimezone: true,
    metadataCache: { enabled: config.database.ormMetadataCacheEnabled },
    // https://jira.internal.dnanexus.com/browse/PFDA-5349
    discovery: { checkDuplicateFieldNames: false },
    registerRequestContext: false,
    loadStrategy: LoadStrategy.BALANCED,
  }
}

function getEntityGlob(path: string, ext: string): string {
  return `${path}/**/*.entity.${ext}`
}
