import { Injectable } from '@nestjs/common'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UId } from '@shared/domain/entity/domain/uid'
import { Node } from '@shared/domain/user-file/node.entity'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { License } from '@shared/domain/license/license.entity'

@Injectable()
export class LicenseService {
  constructor(private readonly em: SqlEntityManager) {}

  async findLicensedItemsByNodeUids(nodeUids: UId[]): Promise<License[]> {
    const nodes = await this.em.find(Node, { uid: { $in: nodeUids } })

    const nodeIds = nodes.map((node) => node.id)

    const licensedItems = await this.em.find(
      LicensedItem,
      { licenseableId: { $in: nodeIds } },
      { populate: ['license'] },
    )

    return licensedItems.map((item) => item.license.getEntity())
  }
}
