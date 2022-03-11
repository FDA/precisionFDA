import fetchMock from 'fetch-mock'

import { BACKEND_URL } from '../../test/helper'
import { backendCall } from './api'


describe('backendCall()', () => {
  const token = 'someToken'

  afterEach(() => {
    fetchMock.reset()
  })

  describe('POST / PUT requests', () => {
    it('sends X-CSRF-TOKEN on POST request', () => {
      fetchMock.post(BACKEND_URL, {})

      return backendCall(BACKEND_URL, 'POST', {}, token)
        .then(() => {
          expect(fetchMock.lastOptions().headers['X-CSRF-Token']).toEqual(token)
        })
    })

    describe('CSRF-token from meta', () => {
      beforeEach(() => {
        const meta = document.createElement('meta')

        meta.setAttribute('name', 'csrf-token')
        meta.setAttribute('content', token)

        document.body.appendChild(meta)
      })

      afterEach(() => {
        const meta = document.getElementsByName('csrf-token')[0]
        document.body.removeChild(meta)
      })

      it('takes CSRF token from meta tag if tag presents', () => {
        fetchMock.post(BACKEND_URL, {})

        return backendCall(BACKEND_URL, 'POST', {})
          .then(() => {
            expect(fetchMock.lastOptions().headers['X-CSRF-Token']).toEqual(token)
          })
      })
    })

    it('it sends null as CSRF token if meta tag absents', () => {
      fetchMock.post(BACKEND_URL, {})

      return backendCall(BACKEND_URL, 'POST', {})
        .then(() => {
          expect(fetchMock.lastOptions().headers['X-CSRF-Token']).toEqual(null)
        })
    })

    it('sends data as JSON', () => {
      fetchMock.post(BACKEND_URL, {})

      return backendCall(BACKEND_URL, 'POST', {})
        .then(() => {
          expect(fetchMock.lastOptions().headers['Content-Type']).toEqual('application/json')
        })
    })

    it('sends body on POST request', () => {
      const body = 'someBody'

      fetchMock.post(BACKEND_URL, {})

      return backendCall(BACKEND_URL, 'POST', body)
        .then(() => {
          expect(fetchMock.lastOptions().body).toEqual(JSON.stringify(body))
        })
    })
  })

  describe('GET / HEAD requests', () => {
    it('send request to correct route', () => {
      fetchMock.get('*', {})

      return backendCall(BACKEND_URL, 'GET', { some: 'data' })
        .then(() => {
          expect(fetchMock.lastUrl()).toEqual(`${BACKEND_URL}/?some=data`)
        })
    })

    it('send request to correct route', () => {
      fetchMock.head('*', {})

      return backendCall(BACKEND_URL, 'HEAD', { some: 'data' })
        .then(() => {
          expect(fetchMock.lastUrl()).toEqual(`${BACKEND_URL}/?some=data`)
        })
    })
  })

  it("it doesn't send X-CSRF-TOKEN on non-POST request", () => {
    fetchMock.get(BACKEND_URL, {})

    return backendCall(BACKEND_URL, 'GET', {}, token)
      .then(() => {
        expect(fetchMock.lastOptions().headers['X-CSRF-Token']).toEqual(null)
      })
  })

  it('throws error when not JSON returned', () => {
    fetchMock.post(BACKEND_URL, '<html>', { sendAsJson: false })

    return backendCall(BACKEND_URL).catch(error => {
      expect(error.type).toEqual('invalid-json')
    })
  })

  it('returns backend data on successful request with body', () => {
    const apiResponse = { data: 'some data' }

    fetchMock.post(BACKEND_URL, apiResponse)

    return backendCall(BACKEND_URL).then(response => {
      expect(response.status).toEqual(200)
      expect(response.payload).toEqual(apiResponse)
    })
  })

  it('returns backend data on successful request without body', () => {
    fetchMock.post(BACKEND_URL, { status: 204 })

    return backendCall(BACKEND_URL).then(response => {
      expect(response.status).toEqual(204)
      expect(response.payload).toEqual(null)
    })
  })

  it('returns backend error on failed request', () => {
    const body = { error: 'some error' }
    const status = 404

    fetchMock.post(BACKEND_URL, { status, body })

    return backendCall(BACKEND_URL).catch(response => {
      expect(response.status).toEqual(status)
      expect(response.payload).toEqual(body)
    })
  })
})
