import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator'

/**
 * Nodes (files and folders) that were not copied together
 * with their target scope.
 */
export class NodeCopyInputDTO {
  @IsString()
  @IsNotEmpty()
  destination: string

  @IsArray()
  @IsString({ each: true })
  notCopiedFolderNames: string[]

  @IsArray()
  @IsString({ each: true })
  notCopiedFileNames: string[]

  @IsArray()
  @IsNumber({}, { each: true })
  receiverUserIds: number[]
}
