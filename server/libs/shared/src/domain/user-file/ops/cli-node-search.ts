import { entities, errors } from '@shared'
import { STATIC_SCOPE } from '@shared/enums'
import { SCOPE } from '@shared/types/common'
import { Folder, Node, UserFile } from '../..'
import { UserOpsCtx } from '../../../types'
import { BaseOperation } from '../../../utils'
import { SPACE_MEMBERSHIP_ROLE } from '../../space-membership/space-membership.enum'
import { getScopeFromSpaceId } from '../../space/space.helper'
import { CLINodeSearchInput } from '../user-file.input'
import { FILE_STI_TYPE } from '../user-file.types'


class CLINodeSearchOperation extends BaseOperation<
    UserOpsCtx,
    CLINodeSearchInput,
    Node[]
> {
    async run(input: CLINodeSearchInput): Promise<Node[]> {
        const em = this.ctx.em
        const user = this.ctx.user
        const arg = input.arg
        const parentFolder = input.folderId && input.spaceId ? null : input.folderId
        const scope = input.spaceId ? getScopeFromSpaceId(input.spaceId) : 'private'
        const scopedParentFolderId = input.folderId && input.spaceId ? input.folderId : null

        const spaces = await em.find(
            entities.Space,
            {
                spaceMemberships: {
                    user: {
                        id: this.ctx.user.id,
                    },
                    role: {
                        $in: [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD, SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR],
                    },
                },
            },
        )

        const spaceScopes = spaces.map(s => `space-${s.id}`)
        if (input.spaceId && !spaceScopes.includes(scope)) {
            throw new errors.PermissionError("You don't have permission to access this space or remove files in it!")
        }

        let result: UserFile[] | Folder[]

        if (input.type === 'Folder') {
            result = await em.find(
                entities.Folder,
                {
                    $or: [
                        {userId: user.id, scope: STATIC_SCOPE.PRIVATE},
                        {scope: {$in: spaceScopes as SCOPE[]}},
                    ],
                    $and: [
                        {id: arg as any},
                        {stiType: FILE_STI_TYPE.FOLDER},
                    ],
                }, {},
            )

            for (const n of result) {
                await n.children.init();
            }
        } else {
            result = await em.find(
                entities.UserFile,
                {
                    $or: [
                        {$and: [{userId: user.id, scope: STATIC_SCOPE.PRIVATE, parentFolder}]},
                        {$and: [{scope: {$in: spaceScopes as SCOPE[]}, scopedParentFolder: scopedParentFolderId}]}
                    ],
                    $and: [
                        {name: {$like: arg}},
                        {stiType: FILE_STI_TYPE.USERFILE},
                        {scope: scope as SCOPE},
                    ],
                }, {},
            )
        }

        return result
    }
}

export { CLINodeSearchOperation }
