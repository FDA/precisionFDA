import { constructDxOrg } from '@shared/domain/org/org.utils'
import { Space } from '@shared/domain/space/space.entity'
import { getSpaceTypeEnum, SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator'
import crypto from 'crypto'

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @Transform(({ value }) => getSpaceTypeEnum(value))
  @IsNotEmpty()
  @IsEnum(SPACE_TYPE)
  spaceType: SPACE_TYPE

  @IsString()
  hostLeadDxuser: string

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.GROUPS)
  @IsString()
  guestLeadDxuser?: string

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.GROUPS)
  @IsBoolean()
  protected: boolean = false

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.REVIEW)
  @IsBoolean()
  restrictedReviewer: boolean = false

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.GROUPS)
  @IsBoolean()
  forChallenge: boolean = false

  // ATM only for non-review spaces !!
  buildEntity() {
    const uuid = crypto.randomBytes(7).toString('hex')
    const space = new Space()
    space.name = this.name
    space.description = this.description
    space.type = this.spaceType
    space.state = SPACE_STATE.ACTIVE
    space.protected = false
    space.hostDxOrg = constructDxOrg(`space_host_${uuid}`)
    if (this.spaceType === SPACE_TYPE.GROUPS) {
      space.guestDxOrg = constructDxOrg(`space_guest_${uuid}`)
      space.protected = this.protected
    }
    space.meta = null //TODO: CTS for review space ?
    return space
  }
}
