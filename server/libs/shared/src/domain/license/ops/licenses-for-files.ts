import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { BaseOperation } from '@shared/utils/base-operation'
import { UserOpsCtx } from '../../../types'
import { License } from '../license.entity'
import { FilesInput } from '../license.input'

export class LicensesForFilesOperation extends BaseOperation<
UserOpsCtx,
FilesInput,
License[]> {
  async run(fileInput: FilesInput): Promise<License []> {
    const em = this.ctx.em

    const items = await em.find(
      LicensedItem,
      { licenseableId: { $in: fileInput.ids } },
      { populate: ['license'] },
    )
    const licenses = items.map(item => item.license.getEntity())
    const unique = [...new Map(licenses.map((item: License) => [item.id, item])).values()]
    return unique
  }
}
