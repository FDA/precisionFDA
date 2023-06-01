import { useAuthUser } from './useAuthUser'
import { IUser } from '../../types/user'

let email = 'test'
jest.mock('./api', () => {
    const originalModule = jest.requireActual('./api')
    return {
        ...originalModule,
        useAuthUserQuery: () => (
            {
                data: {
                    user: {
                        dxuser: 'antonio',
                        email,
                    } as IUser,
                    meta: {} as any,
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