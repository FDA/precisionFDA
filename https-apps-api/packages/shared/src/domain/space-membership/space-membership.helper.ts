import { SPACE_MEMBERSHIP_ROLE } from "./space-membership.enum";


const ADMIN_LEAD_ROLES = [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD]
const isAdminOrLead = (role: SPACE_MEMBERSHIP_ROLE): boolean =>
  ADMIN_LEAD_ROLES.includes(role)

const CAN_EDIT_ROLES = [...ADMIN_LEAD_ROLES, SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR]
const canEditSpace = (role: SPACE_MEMBERSHIP_ROLE): boolean =>
  CAN_EDIT_ROLES.includes(role)

export { isAdminOrLead, canEditSpace, CAN_EDIT_ROLES, ADMIN_LEAD_ROLES }
