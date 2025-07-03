import { http, HttpResponse } from 'msw'
import { License } from '../../features/licenses/types'
import { AcceptedLicense } from '../../features/apps/apps.types'

export const mockLicenses: License[] = [
  {
    id: '1',
    uid: 'license-uid-1',
    content: `
      <h3>MIT License</h3>
      <p>Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:</p>
      
      <p>The above copyright notice and this permission notice shall be included in all
      copies or substantial portions of the Software.</p>
      
      <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.</p>
    `,
    title: 'MIT License',
    added_by: 'user123',
    added_by_fullname: 'John Doe',
    created_at: new Date('2023-01-01'),
    created_at_date_time: '2023-01-01T00:00:00Z',
    location: 'public',
    approval_required: false,
    tags: ['open-source', 'permissive'],
    state: 'active',
  },
  {
    id: '2',
    uid: 'license-uid-2',
    content: `
      <h3>Commercial License</h3>
      <p>This is a commercial software license that requires approval before use.
      The software may only be used for commercial purposes with explicit written
      permission from the copyright holder.</p>
      
      <p>Contact information:</p>
      <ul>
        <li>Email: licensing@company.com</li>
        <li>Phone: +1-555-0123</li>
      </ul>
      
      <p>This license grants the user limited rights to use the software for
      commercial purposes only after proper approval has been obtained.</p>
    `,
    title: 'Commercial Software License',
    added_by: 'admin456',
    added_by_fullname: 'Admin User',
    created_at: new Date('2023-02-01'),
    created_at_date_time: '2023-02-01T00:00:00Z',
    location: 'private',
    approval_required: true,
    tags: ['commercial', 'restricted'],
    state: 'pending',
  },
  {
    id: '3',
    uid: 'license-uid-3',
    content: `
      <h3>Creative Commons Attribution 4.0</h3>
      <p>You are free to:</p>
      <ul>
        <li><strong>Share</strong> — copy and redistribute the material in any medium or format</li>
        <li><strong>Adapt</strong> — remix, transform, and build upon the material for any purpose, even commercially</li>
      </ul>
      
      <p>Under the following terms:</p>
      <ul>
        <li><strong>Attribution</strong> — You must give appropriate credit, provide a link to the license, and indicate if changes were made.</li>
      </ul>
      
      <p>This license is acceptable for Free Cultural Works.</p>
    `,
    title: 'Creative Commons Attribution 4.0',
    added_by: 'creator789',
    added_by_fullname: 'Creative User',
    created_at: new Date('2023-03-01'),
    created_at_date_time: '2023-03-01T00:00:00Z',
    location: 'public',
    approval_required: false,
    tags: ['creative-commons', 'attribution'],
    state: 'active',
  },
]

export const mockAcceptedLicenses: AcceptedLicense[] = [
  {
    id: 1,
    license: 1,
    message: 'License accepted via API',
    state: 'accepted',
    user: 123,
  },
]

export const licensesMocks = [
  http.get('/api/licenses/:id', ({ params }) => {
    const id = params.id as string
    const license = mockLicenses.find(l => l.id === id)
    if (!license) {
      return HttpResponse.json({ error: 'License not found' }, { status: 404 })
    }
    return HttpResponse.json(license)
  }),

  http.get('/api/licenses/accepted', () => {
    return HttpResponse.json(mockAcceptedLicenses)
  }),

  http.post('/api/v2/licenses/files', async ({ request }) => {
    await request.json()
    return HttpResponse.json(mockLicenses)
  }),

  http.get('/api/list_licenses', () => {
    return HttpResponse.json({
      licenses: mockLicenses,
    })
  }),

  http.post('/api/licenses/:licenseId/license_item/:dxid', ({ params }) => {
    const { licenseId, dxid } = params
    return HttpResponse.json({
      message: `License ${licenseId} attached to item ${dxid} successfully`,
    })
  }),

  http.post('/api/licenses/:licenseId/remove_item/:dxid', ({ params }) => {
    const { licenseId, dxid } = params
    return HttpResponse.json({
      message: `License ${licenseId} detached from item ${dxid} successfully`,
    })
  }),

  http.post('/api/licenses/:licenseId/accept', ({ params }) => {
    const { licenseId } = params
    return HttpResponse.json({
      message: `License ${licenseId} accepted successfully`,
    })
  }),

  http.post('/api/accept_licenses', async ({ request }) => {
    const { license_ids } = await request.json() as { license_ids: string[] }
    return HttpResponse.json({
      message: 'Licenses accepted successfully',
      accepted_licenses: license_ids.map(id => ({
        id: parseInt(id),
        license: parseInt(id),
        message: 'License accepted via API',
        state: 'accepted',
        user: 123,
      })),
    })
  }),
]
