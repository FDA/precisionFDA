import { IsString, IsNotEmpty } from 'class-validator'

export class RecreateFolderDTO {
  @IsString()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  projectId: string
}
