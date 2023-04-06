enum SPACE_TYPE {
  GROUPS = 0,
  REVIEW = 1,
  PRIVATE_TYPE = 3,
  GOVERNMENT = 4,
  ADMINISTRATOR = 5,

  // deprecated type - no longer in use
  VERIFICATION = 2,
}

enum SPACE_STATE {
  UNACTIVATED = 0,
  ACTIVE = 1,
  LOCKED = 2,
  DELETED = 3,
}

export { SPACE_TYPE, SPACE_STATE }
