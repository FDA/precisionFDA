import { http, HttpResponse } from 'msw'


export const resourcesMocks = [
  http.get('/api/data_portals/:slug', () => HttpResponse.json({
      id: 1,
      name: 'prism',
      urlSlug: 'prism',
      description: 'sdfsdfd',
      sortOrder: 0,
      cardImageUid: 'file-Gk86QqQ0v5ZxpyJqb8Pxv8Xq-1',
      cardImageUrl: '',
      status: 'open',
      spaceId: 2,
      lastUpdated: 'Tue Jun 11 2024 12:31:28 GMT+0000 (Coordinated Universal Time)',
      content: '',
      editorState: '',
      members: [
          {
              'dxuser': 'randall.ebert',
              'role': 'lead',
          },
          {
              'dxuser': 'pfda_autotest1',
              'role': 'lead',
          },
      ],
      'hostLeadDxuser': 'randall.ebert',
      'guestLeadDxuser': 'pfda_autotest1',
  })),
  http.get('/api/data_portals/:slug/resources', () => HttpResponse.json([
    {
      id: 3,
      name: 'bitcoin.pdf',
      url: 'https://localhost:3000/api/files/file-GkQ58600v5Zqv9kGgPyf8p3K-1/bitcoin.pdf?inline=true',
    },
    {
      id: 44,
      name: 'image-ee1db807-0f6c-48ad-a9c4-a43d26864a6c.jpg',
      url: 'https://localhost:3000/api/files/file-GkZ4g4j0v5ZZPzJK6pYp55gj-1/image-ee1db807-0f6c-48ad-a9c4-a43d26864a6c.jpg?inline=true',
    },
  ], { status: 200 },
  )),
]
