import { Participant, ParticipantKind } from '@shared/domain/participant/entity/participant.entity'

export class ParticipantDTO {
  id: number
  title: string | null
  imageUrl: string | null
  public?: boolean | null
  kind: string | null
  position: number | null
  createdAt: Date
  updatedAt: Date

  static fromEntity(participant: Participant): ParticipantDTO {
    return {
      id: participant.id,
      title: participant.title ?? null,
      imageUrl: participant.imageUrl ? ParticipantDTO.resolveImageUrl(participant.imageUrl) : null,
      public: participant.public ?? null,
      kind: participant.kind ? ParticipantKind[participant.kind].toLowerCase() : null,
      position: participant.position ?? null,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
    }
  }

  private static resolveImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('/') || imageUrl.startsWith('http')) {
      return imageUrl
    }
    return `/assets/${imageUrl}`
  }
}
