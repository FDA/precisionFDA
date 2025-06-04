import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { CliDiscussionDTO } from '@shared/domain/cli/dto/CliDiscussionDTO'
import { CliNodeSearchDTO } from '@shared/domain/cli/dto/CliNodeSearchDTO'
import { CliSpaceMemberDTO } from '@shared/domain/cli/dto/CliSpaceMemberDTO'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { Uid } from '@shared/domain/entity/domain/uid'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { Space } from '@shared/domain/space/space.entity'
import { getScopeFromSpaceId } from '@shared/domain/space/space.helper'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { NotFoundError, PermissionError } from '@shared/errors'
import { SCOPE } from '@shared/types/common'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'

@Injectable()
export class CliService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly dbclusterService: DbClusterService,
    private readonly discussionService: DiscussionService,
  ) {}

  async listSpaceMembers(spaceId: number) {
    const space = await this.em.findOne(Space, {
      id: spaceId,
      spaceMemberships: { user: this.user.id },
    })
    if (!space) {
      throw new NotFoundError('Space does not exist or is not accessible')
    }
    const memberships = await this.em.find(
      SpaceMembership,
      { spaces: spaceId },
      {
        orderBy: {
          side: 'ASC',
          role: 'ASC',
        },
      },
    )

    return await Promise.all(
      memberships.map((membership) => CliSpaceMemberDTO.fromEntity(membership)),
    )
  }

  async listSpaceDiscussions(spaceId: number) {
    const response = await this.discussionService.listDiscussions({ scope: `space-${spaceId}` })

    return response.data.map((d: DiscussionDTO) => {
      return CliDiscussionDTO.mapToDTO(d)
    })
  }

  async findNodes(input: CliNodeSearchDTO) {
    const { folderId, spaceId, arg, type } = input

    const parentFolder = !spaceId ? folderId : null
    const scope = spaceId ? getScopeFromSpaceId(spaceId) : STATIC_SCOPE.PRIVATE
    const scopedParentFolderId = spaceId ? folderId : null

    const spaces = await this.em.find(Space, {
      spaceMemberships: {
        user: { id: this.user.id },
        active: true,
        role: {
          $in: [
            SPACE_MEMBERSHIP_ROLE.ADMIN,
            SPACE_MEMBERSHIP_ROLE.LEAD,
            SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
          ],
        },
      },
    })

    const spaceScopes = spaces.map((s) => `space-${s.id}`)
    if (spaceId && !spaceScopes.includes(scope)) {
      throw new PermissionError(
        "You don't have permission to access this space or remove files in it!",
      )
    }

    let result: UserFile[] | Folder[]

    if (type === 'Folder') {
      result = await this.em.find(Folder, {
        $or: [
          { userId: this.user.id, scope: STATIC_SCOPE.PRIVATE },
          { scope: { $in: spaceScopes as SCOPE[] } },
        ],
        $and: [{ id: arg as unknown as number }, { stiType: FILE_STI_TYPE.FOLDER }],
      })

      for (const folder of result) {
        await folder.children.init()
      }
    } else {
      result = await this.em.find(UserFile, {
        $or: [
          { user: this.user.id, scope: STATIC_SCOPE.PRIVATE, parentFolder },
          { scope: { $in: spaceScopes as SCOPE[] }, scopedParentFolder: scopedParentFolderId },
        ],
        $and: [
          { name: { $like: arg } },
          { stiType: FILE_STI_TYPE.USERFILE },
          { scope: scope as SCOPE },
        ],
      })
    }

    return result
  }

  async dbClusterGetPassword(dbclusterUid: Uid<'dbcluster'>) {
    return await this.dbclusterService.getPassword(dbclusterUid)
  }

  async dbClusterRotatePassword(dbclusterUid: Uid<'dbcluster'>) {
    return await this.dbclusterService.rotatePassword(dbclusterUid)
  }
}
