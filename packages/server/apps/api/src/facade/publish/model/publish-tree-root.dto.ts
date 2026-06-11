import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { EntityWithIconType } from '@shared/domain/entity/entity-icon/entity-with-icon.type'
import { EntityProvenance } from '@shared/domain/provenance/model/entity-provenance'
import { EntityProvenanceData } from '@shared/domain/provenance/model/entity-provenance-data'

export class PublishTreeRootDTO {
  @ApiProperty({
    type: 'object',
    properties: {
      type: { type: 'string' },
      title: { type: 'string' },
      url: { type: 'string' },
      identifier: { type: 'string' },
      scope: { type: 'string' },
    },
  })
  data!: EntityProvenanceData<EntityWithIconType>

  @ApiPropertyOptional({ type: () => [PublishTreeRootDTO] })
  parents?: PublishTreeRootDTO[]

  static fromProvenance(item: EntityProvenance): PublishTreeRootDTO {
    const dto = new PublishTreeRootDTO()
    dto.data = item.data

    if (!item.parents?.length) {
      return dto
    }

    dto.parents = item.parents
      .filter(parent => parent.data.type !== 'user')
      .map(parent => PublishTreeRootDTO.fromProvenance(parent))

    return dto
  }
}
