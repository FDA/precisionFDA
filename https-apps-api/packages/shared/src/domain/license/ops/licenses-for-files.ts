import { BaseOperation } from '../../../utils'
import { UserOpsCtx } from '../../../types'
import { License } from '../license.entity'
import { FilesInput } from '../license.input'
import { entities } from '../..'

export class LicensesForFilesOperation extends BaseOperation<
UserOpsCtx,
FilesInput,
License[]> {
  async run(fileInput: FilesInput): Promise<License []> {
    const em = this.ctx.em

    const items = await em.find(
      entities.LicensedItem,
      { licenseableId: { $in: fileInput.ids } },
      { populate: ['license'] },
    )
    const licenses = items.map(item => item.license.getEntity())
    const unique = [...new Map(licenses.map((item: License) => [item.id, item])).values()]
    return unique
  }
}
