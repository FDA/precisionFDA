import { Injectable } from '@nestjs/common'
import { Uid } from '@shared/domain/entity/domain/uid'
import { License } from '@shared/domain/license/license.entity'
import { LicenseRepository } from '@shared/domain/license/license.repository'
import { LicensedItemRepository } from '@shared/domain/licensed-item/licensed-item.repository'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { UserContext } from '../user-context/model/user-context'
import { LicenseMap } from './license.types'

@Injectable()
export class LicenseService {
  constructor(
    private readonly licenseRepository: LicenseRepository,
    private readonly licensedItemRepo: LicensedItemRepository,
    private readonly nodeRepo: NodeRepository,
    private readonly userContext: UserContext,
  ) {}

  async findLicenseRefsByLicenseableIds(
    licenseableType: string,
    licenseableIds: number[],
  ): Promise<Map<number, { id: string; title: string; uid?: string }>> {
    const result = new Map<number, { id: string; title: string; uid?: string }>()

    if (licenseableIds.length === 0) {
      return result
    }

    const licensedItems = await this.licensedItemRepo.find(
      {
        licenseableType,
        licenseableId: { $in: licenseableIds },
      },
      { populate: ['license'] },
    )

    for (const item of licensedItems) {
      if (result.has(item.licenseableId)) {
        continue
      }

      const license = item.license.getEntity()
      const licenseWithUid = license as License & { uid?: string }
      result.set(item.licenseableId, {
        id: String(license.id),
        title: license.title,
        ...(licenseWithUid.uid ? { uid: licenseWithUid.uid } : {}),
      })
    }

    return result
  }

  async findLicenseRefByLicenseableId(
    licenseableType: string,
    licenseableId: number,
  ): Promise<{ id: string; title: string; uid?: string } | undefined> {
    const refs = await this.findLicenseRefsByLicenseableIds(licenseableType, [licenseableId])
    return refs.get(licenseableId)
  }

  async findLicensedItemsByNodeUids(nodeUids: Uid<'file'>[]): Promise<License[]> {
    const nodes = await this.nodeRepo.find({ uid: { $in: nodeUids } })

    const nodeIds = nodes.map(node => node.id)

    const licensedItems = await this.licensedItemRepo.find(
      { licenseableId: { $in: nodeIds } },
      { populate: ['license'] },
    )

    return licensedItems.map(item => item.license.getEntity())
  }

  async findLicensesForNodeIds(nodeIds: number[]): Promise<License[]> {
    if (nodeIds.length === 0) {
      return []
    }

    const licensedItems = await this.licensedItemRepo.find(
      { licenseableId: { $in: nodeIds }, licenseableType: 'Node' },
      { populate: ['license'] },
    )

    const licenses = licensedItems.map(item => item.license.getEntity())
    return [...new Map(licenses.map(item => [item.id, item])).values()]
  }

  async findAccessibleByIds(ids: number[]): Promise<License[]> {
    return this.licenseRepository.findAccessible({ id: { $in: ids } })
  }

  async findLicensesAndAcceptedLicensesByItemIds(
    licenseableType: string,
    licenseableIds: number[],
  ): Promise<LicenseMap> {
    const result: LicenseMap = new Map()

    if (licenseableIds.length === 0) {
      return result
    }

    const licensedItems = await this.licensedItemRepo.find(
      {
        licenseableType,
        licenseableId: { $in: licenseableIds },
      },
      {
        populate: ['license', 'license.acceptedLicenses'],
        populateWhere: { license: { acceptedLicenses: { user: this.userContext.id } } },
      },
    )

    for (const item of licensedItems) {
      const license = item.license.getEntity()
      result.set(item.licenseableId, { license })
    }

    return result
  }
}
