import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { Uid } from '@shared/domain/entity/domain/uid'
import { License } from '@shared/domain/license/license.entity'
import { LicensedItem } from '@shared/domain/licensed-item/licensed-item.entity'
import { Node } from '@shared/domain/user-file/node.entity'

@Injectable()
export class LicenseService {
  constructor(private readonly em: SqlEntityManager) {}

  async findLicensedItemsByNodeUids(nodeUids: Uid<'file'>[]): Promise<License[]> {
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
