import { SPACE_MEMBERSHIP_ROLE } from "./space-membership.enum";

const isAdminOrLead = (role: SPACE_MEMBERSHIP_ROLE): boolean =>
    [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD].includes(role)

export { isAdminOrLead }