import { vi, describe, it, expect } from 'vitest'
import { useAuthUser } from './useAuthUser'
import { IUser } from '../../types/user'
import { IMeta } from '../home/types'

let email = 'test'
vi.mock('./api', async () => {
    const originalModule = await vi.importActual('./api')
    return {
        ...originalModule,
        useAuthUserQuery: () => (
            {
                data: {
                    user: {
                        dxuser: 'antonio',
                        email,
                    } as IUser,
                    meta: {} as IMeta,
                },
            }
        ),
    }
})

describe('test useAuthUser', () => {
    it('test gov User', () => {
        email = 'antonio.seruti@fda.hhs.gov'
        const authUser = useAuthUser()
        expect(authUser?.isGovUser).toBeTruthy()
    })
    it('no gov User', () => {
        email = 'norma.jean@dnanexus.com'
        const authUser = useAuthUser()
        expect(authUser?.isGovUser).toBeFalsy()
    })
})