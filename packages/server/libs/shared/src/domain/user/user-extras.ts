import { HeaderItem } from '@shared/domain/user/header-item'

export class UserExtras {
  has_seen_guidelines: boolean = false
  inactivity_email_sent: boolean = false
  header_items: HeaderItem[] = []
}
