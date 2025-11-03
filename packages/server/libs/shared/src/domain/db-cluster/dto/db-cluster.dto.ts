import {
  DB_SYNC_STATUS,
  DB_SYNC_STATUSES,
  DbClusterStatus,
  DbClusterSyncStatus,
  ENGINE,
  ENGINES,
  STATUS,
  STATUSES,
} from '@shared/domain/db-cluster/db-cluster.enum'
import { EntityScope } from '@shared/types/common'
import { DbCluster } from '../db-cluster.entity'
import { Uid } from '@shared/domain/entity/domain/uid'
import { invertObj } from 'ramda'
import { Space } from '@shared/domain/space/space.entity'

export class DbClusterDTO {
  id: number
  dxid: string
  uid: Uid<'dbcluster'>
  name: string
  title: string
  status: DbClusterStatus
  syncStatus: DbClusterSyncStatus
  location: string
  scopeName: string
  description?: string
  addedBy: string
  addedByFullname: string
  createdAt: Date
  createdAtDateTime: Date
  engine: ENGINE
  engineVersion: string
  dxInstanceClass: string
  statusAsOf: Date
  statusUpdatedDateTime: Date
  host: string
  port: string
  showLicensePending?: boolean
  tags: string[]
  properties: {
    [key: string]: string
  }
  links: {
    [key: string]: string
  }
  scope: EntityScope

  static mapToDTO(dbcluster: DbCluster, space?: Space): DbClusterDTO {
    return {
      id: dbcluster.id,
      dxid: dbcluster.dxid,
      uid: dbcluster.uid,
      name: dbcluster.name,
      title: dbcluster.name,
      status: STATUSES[invertObj(STATUS)[dbcluster.status]],
      syncStatus: DB_SYNC_STATUSES[invertObj(DB_SYNC_STATUS)[dbcluster.syncStatus]],
      location: space ? getLocation(space) : titleize(dbcluster.scope),
      scopeName: dbcluster.scope,
      description: dbcluster.description,
      addedBy: dbcluster.user.getProperty('dxuser'),
      addedByFullname: dbcluster.user.getProperty('fullName'),
      createdAt: dbcluster.createdAt,
      createdAtDateTime: dbcluster.createdAt,
      engine: ENGINES[invertObj(ENGINE)[dbcluster.engine]],
      engineVersion: dbcluster.engineVersion,
      dxInstanceClass: dbcluster.dxInstanceClass,
      statusAsOf: dbcluster.statusAsOf,
      statusUpdatedDateTime: dbcluster.statusAsOf,
      host: dbcluster.host,
      port: dbcluster.port,
      showLicensePending: false,
      tags: dbcluster.taggings.map((t) => t?.tag?.name),
      properties: dbcluster.properties.getItems().reduce(
        (acc, prop) => {
          acc[prop.propertyName] = prop.propertyValue
          return acc
        },
        {} as Record<string, string>,
      ),
      scope: dbcluster.scope,
      links: {
        user: `/users/${dbcluster.user.getEntity().dxuser}`,
        create: `/api/dbclusters/${dbcluster.uid}`,
        update: `/api/dbclusters/${dbcluster.uid}`,
        start: '/api/dbclusters/start',
        stop: '/api/dbclusters/stop',
        terminate: '/api/dbclusters/terminate',
      },
    }
  }
}

const titleize = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
    .join(' ')
}
const getLocation = (space: Space): string => {
  if (space.isConfidential()) {
    return `${space.name} - Private`
  }

  return `${space.name} - Shared`
}
