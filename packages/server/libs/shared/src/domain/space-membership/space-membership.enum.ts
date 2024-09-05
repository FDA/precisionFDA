enum SPACE_MEMBERSHIP_SIDE {
  HOST = 0,
  GUEST = 1,
  // fixme: how do I need to handle this?
  // HOST_ALIAS = 'reviewer'
  // GUEST_ALIAS = 'sponsor'
}

enum SPACE_MEMBERSHIP_ROLE {
  ADMIN = 0,
  CONTRIBUTOR = 1,
  VIEWER = 2,
  LEAD = 3,
}

export { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE }
