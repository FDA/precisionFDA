enum JOB_STATE {
  DONE = 'done',
  FAILED = 'failed',
  IDLE = 'idle',
  TERMINATED = 'terminated',
  TERMINATING = 'terminating',
}

enum JOB_DB_ENTITY_TYPE {
  REGULAR = 0,
  HTTPS = 1,
}

const TERMINAL_STATES = [JOB_STATE.DONE, JOB_STATE.FAILED, JOB_STATE.TERMINATED]

const allowedInstanceTypes = {
  'baseline-2': 'mem1_ssd1_x2_fedramp',
  'baseline-4': 'mem1_ssd1_x4_fedramp',
  'baseline-8': 'mem1_ssd1_x8_fedramp',
  'baseline-16': 'mem1_ssd1_x16_fedramp',
  'baseline-36': 'mem1_ssd1_x36_fedramp',
  'himem-2': 'mem3_ssd1_x2_fedramp',
  'himem-4': 'mem3_ssd1_x4_fedramp',
  'himem-8': 'mem3_ssd1_x8_fedramp',
  'himem-16': 'mem3_ssd1_x16_fedramp',
  'himem-32': 'mem3_ssd1_x32_fedramp',
  'hidisk-2': 'mem1_ssd2_x2_fedramp',
  'hidisk-4': 'mem1_ssd2_x4_fedramp',
  'hidisk-8': 'mem1_ssd2_x8_fedramp',
  'hidisk-16': 'mem1_ssd2_x16_fedramp',
  'hidisk-36': 'mem1_ssd2_x36_fedramp',
} as const

const DEFAULT_INSTANCE_TYPE = allowedInstanceTypes['baseline-2']

const allowedFeatures = {
  python: 'PYTHON_R',
  mlIp: 'ML_IP',
}

export {
  JOB_STATE,
  TERMINAL_STATES,
  JOB_DB_ENTITY_TYPE,
  DEFAULT_INSTANCE_TYPE,
  allowedFeatures,
  allowedInstanceTypes,
}
