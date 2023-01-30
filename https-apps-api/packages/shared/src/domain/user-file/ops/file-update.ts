import { client, errors } from '../../..'
import { BaseOperation } from '../../../utils/base-operation'
import { UidInput, UserOpsCtx } from '../../../types'
import { findFileOrAssetWithUid } from '../user-file.helper'
import { IFileOrAsset } from '../user-file.types'


// FileUpdateOperation updates the status and size of a single
// File or Asset from platform
// Returns true if the file was updated
class FileUpdateOperation extends BaseOperation<
UserOpsCtx,
UidInput,
IFileOrAsset
> {
  async run(input: UidInput): Promise<IFileOrAsset> {
    const log = this.ctx.log
    const em = this.ctx.em
    const fileOrAsset = await findFileOrAssetWithUid(em, input.uid)
    if (!fileOrAsset) {
      log.error(`FileUpdateOperation: File or asset with uid ${input.uid} not found`)
      throw new errors.FileNotFoundError(`File or asset with uid ${input.uid} not found`)
    }

    log.info('FileUpdateOperation: Calling platform fileDescribe')
    const platformClient = new client.PlatformClient(this.ctx.user.accessToken, log)
    const fileDescribe = await platformClient.fileDescribe({
      fileDxid: fileOrAsset.dxid,
      projectDxid: fileOrAsset.project,
    })

    log.info({ fileDescribe }, 'FileUpdateOperation: Platform fileDescribe response')

    if (fileDescribe.state) {
      log.info({
        uid: fileOrAsset.uid,
        name: fileOrAsset.name,
        state: fileDescribe.state,
        size: fileDescribe.size,
      }, 'FileUpdateOperation: Updating file attributes')

      fileOrAsset.fileSize = fileDescribe.size
      fileOrAsset.state = fileDescribe.state

      await this.ctx.em.flush()
    }
    return fileOrAsset
  }
}

export {
  FileUpdateOperation,
}
