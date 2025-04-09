import { HeaderItem } from '@shared/domain/user/header-item'

export class UserExtras {
  has_seen_guidelines: boolean = false
  inactivity_email_sent: boolean = false
  // TODO: PFDA-6176 set default value to empty array
  header_items: HeaderItem[] = undefined
}
