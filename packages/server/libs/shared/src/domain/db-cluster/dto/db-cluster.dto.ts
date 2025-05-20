import { ENGINE, ENGINES, STATUS, STATUSES } from '@shared/domain/db-cluster/db-cluster.enum'
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
  status: typeof STATUSES
  location: string
  scopeName: string
  description?: string
  addedBy: string
  addedByFullname: string
  createdAt: Date
  createdAtDateTime: string
  engine: ENGINE
  engineVersion: string
  dxInstanceClass: string
  statusAsOf: Date
  statusUpdatedDateTime: string
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
      location: space ? getLocation(space) : titleize(dbcluster.scope),
      scopeName: dbcluster.scope,
      description: dbcluster.description,
      addedBy: dbcluster.user.getProperty('dxuser'),
      addedByFullname: dbcluster.user.getProperty('fullName'),
      createdAt: dbcluster.createdAt,
      createdAtDateTime: formatDateTime(dbcluster.createdAt),
      engine: ENGINES[invertObj(ENGINE)[dbcluster.engine]],
      engineVersion: dbcluster.engineVersion,
      dxInstanceClass: dbcluster.dxInstanceClass,
      statusAsOf: dbcluster.statusAsOf,
      statusUpdatedDateTime: formatDateTime(dbcluster.statusAsOf),
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

const formatDateTime = (time: Date): string => {
  return time
    .toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
      hour12: false,
    })
    .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')
    .replace(',', '')
}
