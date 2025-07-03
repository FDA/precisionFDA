import { appsMocks } from './handlers/apps.handlers'
import { dataPortalsHandlers } from './handlers/data-portal.handlers'
import { dbclusterMocks } from './handlers/databases.handlers'
import { executionsMocks } from './handlers/executions.handlers'
import { filesMocks } from './handlers/files.handlers'
import { newsMocks } from './handlers/news.handlers'
import { resourcesMocks } from './handlers/resources.handlers'
import { spacesMocks } from './handlers/spaces.handlers'
import { workflowMocks } from './handlers/workflows.handlers'
import { authHandlers } from './handlers/auth.handlers'
import { generalHandlers } from './handlers/general.handlers'
import { notesHandlers } from './handlers/notes.handlers'
import { assetsHandlers } from './handlers/assets.handlers'
import { ws } from 'msw'

// WebSocket handlers
const websocketHandlers = [
  ws.link('wss://localhost:3001/*').addEventListener('connection', ({ client }) => {
    // Handle WebSocket connection - just acknowledge it to prevent warnings
    client.addEventListener('message', () => {
      // Echo or handle messages as needed
    })
  }),
]

export const handlers = [
  ...authHandlers,
  ...generalHandlers,
  ...notesHandlers,
  ...assetsHandlers,
  ...filesMocks,
  ...newsMocks,
  ...dbclusterMocks,
  ...workflowMocks,
  ...spacesMocks,
  ...executionsMocks,
  ...dataPortalsHandlers,
  ...appsMocks,
  ...resourcesMocks,
  ...websocketHandlers,
]
