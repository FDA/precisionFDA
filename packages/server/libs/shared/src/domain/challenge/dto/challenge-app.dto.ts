import { App } from '@shared/domain/app/app.entity'
import type { AppInputSpecItem } from '@shared/domain/app/app.input'

export class ChallengeAppDTO {
  inputSpec: AppInputSpecItem[]

  static mapToDTO(app: App): ChallengeAppDTO {
    return { inputSpec: app.spec?.input_spec ?? [] }
  }
}
