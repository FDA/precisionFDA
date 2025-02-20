import { constructDxOrg } from '@shared/domain/org/org.utils'
import { Space } from '@shared/domain/space/space.entity'
import { getSpaceTypeEnum, SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator'
import crypto from 'crypto'

export class CreateSpaceDTO {
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

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.REVIEW)
  @IsBoolean()
  restrictedReviewer: boolean = false

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.REVIEW)
  @IsBoolean()
  restrictedDiscussions: boolean = false

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.REVIEW)
  @IsString()
  cts: string

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.GROUPS || o.spaceType === SPACE_TYPE.REVIEW)
  @IsString()
  guestLeadDxuser?: string

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.GROUPS)
  @IsBoolean()
  protected: boolean = false

  @ValidateIf((o) => o.spaceType === SPACE_TYPE.GROUPS)
  @IsBoolean()
  forChallenge: boolean = false

  buildEntity() {
    const uuid = crypto.randomBytes(7).toString('hex')
    const space = new Space()
    space.name = this.name
    space.description = this.description
    space.type = this.spaceType
    space.state = SPACE_STATE.ACTIVE
    space.protected = false
    space.hostDxOrg = constructDxOrg(`space_host_${uuid}`)
    if (this.spaceType in [SPACE_TYPE.GROUPS, SPACE_TYPE.REVIEW]) {
      space.guestDxOrg = constructDxOrg(`space_guest_${uuid}`)
      space.protected = this.protected
    }
    space.meta = {
      restricted_reviewer: this.restrictedReviewer,
      restricted_discussions: this.restrictedDiscussions,
      cts: this.cts,
    }
    return space
  }
}
