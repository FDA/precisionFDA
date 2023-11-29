import { USER_CONTEXT_HTTP_HEADERS } from '@shared'
import { expect } from 'chai'
import { isRequestFromAuthenticatedUser, isRequestFromFdaSubnet } from '../../../src/server/utils'
import { log } from '../../../src/logger'

describe('Server.utils ', () => {
  let mockCtx: Api.Ctx

  context('isRequestFromFdaSubnet', () => {
    it('should return true - valid IP', async () => {
      const ctx = { id: 12, dxuser: 'testing.user', accessToken: 'fake-token' }
      const req = { headers: { 'X-Forwarded-For': '127.0.0.1' }, query: { ...ctx } }

      mockCtx = {
        log,
        user: ctx,
        request: req,
        em: null as any,
        validatedQuery: null as any,
        get(header: string) {
          return this.request.headers[header]
        },
      }

      const result = isRequestFromFdaSubnet(mockCtx)
      expect(result).to.be.true()
    })

    it('should return false - invalid IP', async () => {
      const ctx = { id: 12, dxuser: 'testing.user', accessToken: 'fake-token' }
      const req = { headers: { 'X-Forwarded-For': '203.0.113.42' }, query: { ...ctx } }

      mockCtx = {
        log,
        user: ctx,
        request: req,
        em: null as any,
        validatedQuery: null as any,
        get(header: string) {
          return this.request.headers[header]
        },
      }

      const result = isRequestFromFdaSubnet(mockCtx)
      expect(result).to.be.false()
    })
  })

  context('isRequestFromAuthenticatedUser()', () => {
    it('should return true - user context is set', async () => {
      const ctx = { [USER_CONTEXT_HTTP_HEADERS.id]: 12, [USER_CONTEXT_HTTP_HEADERS.dxUser]: 'testing.user', [USER_CONTEXT_HTTP_HEADERS.accessToken]: 'fake-token' }
      const req = { headers: { 'X-Forwarded-For': '127.0.0.1', ...ctx } }

      mockCtx = {
        log,
        user: ctx,
        request: req,
        em: null as any,
        validatedQuery: null as any,
        get(header: string) {
          return this.request.headers[header]
        },
      }

      const result = isRequestFromAuthenticatedUser(mockCtx)
      expect(result).to.be.true()
    })

    it('should return false - user context is not set', async () => {
      const req = { headers: { 'X-Forwarded-For': '127.0.0.1' } }
      mockCtx = {
        log,
        user: null as any,
        request: req,
        em: null as any,
        validatedQuery: null as any,
        get(header: string) {
          return this.request.headers[header]
        },
      }

      const result = isRequestFromAuthenticatedUser(mockCtx)
      expect(result).to.be.false()
    })
  })
})
