import { InvalidStateError } from '@shared/errors'

enum SPACE_TYPE {
  GROUPS = 0,
  REVIEW = 1,
  PRIVATE_TYPE = 3,
  GOVERNMENT = 4,
  ADMINISTRATOR = 5,
  // deprecated type - no longer in use
  VERIFICATION = 2,
}

function getSpaceTypeEnum(key: string): SPACE_TYPE {
  switch (key?.toUpperCase()) {
    case 'GROUPS': return SPACE_TYPE.GROUPS;
    case 'REVIEW': return SPACE_TYPE.REVIEW;
    case 'PRIVATE_TYPE': return SPACE_TYPE.PRIVATE_TYPE;
    case 'GOVERNMENT': return SPACE_TYPE.GOVERNMENT;
    case 'ADMINISTRATOR': return SPACE_TYPE.ADMINISTRATOR;
    default: throw new InvalidStateError(`Unknown SPACE_TYPE: ${key}`);
  }
}

enum SPACE_STATE {
  UNACTIVATED = 0,
  ACTIVE = 1,
  LOCKED = 2,
  DELETED = 3,
}

export { SPACE_TYPE, SPACE_STATE, getSpaceTypeEnum }
