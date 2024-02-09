import { Controller, Param, Patch, UseGuards } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { createCloseFileJobTask } from '@shared/queue'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/files')
export class FilesController {
  constructor(private readonly user: UserContext) {}

  // Triggers job that closes file
  //   Note that the file uid (not dxid) is used here, e.g.
  //   /files/file-xxxx-1/close
  // https://confluence.internal.dnanexus.com/display/XVGEN/Closing+of+the+files
  @Patch('/:uid/close')
  async closeFile(@Param('uid') fileUid: string) {
    await createCloseFileJobTask({ ...{ fileUid } }, this.user)
  }
}
