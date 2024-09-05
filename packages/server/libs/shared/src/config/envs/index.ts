/**
 * Local machine development environment
 */
export { config as development } from './development'

/**
 * Unit and integration testing environment
 */
export { config as ci_test } from './ci_test'

/**
 * AWS - Dev environment
 */
export { config as dev } from './dev'

/**
 * AWS - Test environment
 */
export { config as test } from './test'

/**
 * AWS - Staging environment
 */
export { config as staging } from './staging'

/**
 * AWS - Production environment
 */
export { config as production } from './production'
