# SPA Navigation in Playwright Tests

This guide documents our approach to SPA (Single Page Application) navigation in Playwright tests, based on [React Router's PlaywrightFixture](https://github.com/remix-run/react-router/blob/main/integration/helpers/playwright-fixture.ts).

## Overview

We use **worker-scoped shared page fixtures** combined with an `ensureRoute()` method that automatically chooses between full page loads and fast SPA navigation. This gives us:

- **Fast serial test execution** - SPA navigation between tests (no page reload)
- **Individual test support** - Each test can run standalone
- **Simple API** - Just use `app.ensureRoute('/path')` at the start of each test

## Quick Start

```typescript
import { test, expect } from './fixtures/shared-page'

test.describe.configure({ mode: 'serial' })

test.describe('My Serial Tests', () => {
  test('first test', async ({ page, app }) => {
    await app.ensureRoute('/home/files')  // Full page load (first test)
    // ...
  })

  test('second test', async ({ page, app }) => {
    await app.ensureRoute('/home/files')  // Fast SPA navigation
    // ...
  })
})
```

## Core Components

### 1. PlaywrightFixture Class

Located in `fixtures/playwright-fixture.ts`, this class provides SPA-friendly navigation helpers:

```typescript
export class PlaywrightFixture {
  readonly page: Page
  private _initialized = false  // Tracks if page has had a full load

  constructor(page: Page) {
    this.page = page
  }

  // Full page navigation - marks page as initialized
  async goto(href: string) {
    const result = await this.page.goto(href)
    this._initialized = true
    return result
  }

  // SPA navigation via pushState (requires initialized page)
  async navigateTo(path: string) {
    await doAndWait(this.page, async () => {
      await this.page.evaluate((targetPath) => {
        window.history.pushState({}, '', targetPath)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }, path)
    })
  }

  // Smart navigation - auto-selects goto() or navigateTo()
  async ensureRoute(path: string) {
    if (!this._initialized) {
      await this.goto(path)
    } else {
      await this.navigateTo(path)
    }
  }

  // Other helpers...
  async clickLink(href: string) { /* ... */ }
  async clickElement(selector: string) { /* ... */ }
  async goBack() { /* ... */ }
  async goForward() { /* ... */ }
  async reload() { /* ... */ }
}
```

### 2. Shared Page Fixtures

Located in `fixtures/shared-page.ts`, these fixtures provide worker-scoped page and app instances:

```typescript
export const test = base.extend<
  { app: PlaywrightFixture },
  { sharedContext: BrowserContext; sharedPage: Page }
>({
  // Worker-scoped context - lives for all tests in this file
  sharedContext: [async ({ browser }, use) => {
    const context = await browser.newContext()
    await use(context)
    await context.close()
  }, { scope: 'worker' }],

  // Worker-scoped page - lives for all tests in this file  
  sharedPage: [async ({ sharedContext }, use) => {
    const page = await sharedContext.newPage()
    setupPageStyles(page)
    await use(page)
  }, { scope: 'worker' }],

  // Override default page fixture to use shared page
  page: async ({ sharedPage }, use) => {
    await use(sharedPage)
  },

  // Worker-scoped app - preserves _initialized state across tests
  app: [async ({ sharedPage }, use) => {
    const app = new PlaywrightFixture(sharedPage)
    await use(app)
  }, { scope: 'worker' }],
})
```

### 3. The `doAndWait()` Helper

This utility wraps any action and waits for the network to settle:

```typescript
await doAndWait(page, async () => {
  await page.click('button')
})
```

It's more reliable than `waitForLoadState('networkidle')` because it tracks requests that start during the action itself.

## How `ensureRoute()` Works

The `ensureRoute()` method is the key to our approach:

| Scenario | What `ensureRoute('/path')` does |
|----------|----------------------------------|
| First test (page not initialized) | Full `goto('/path')` - sets `_initialized = true` |
| Subsequent tests (page initialized) | Fast `navigateTo('/path')` - SPA navigation via pushState |
| Running single test individually | Full `goto('/path')` - works standalone |

This means **every test can call `app.ensureRoute()` at the start** without worrying about whether it's running in isolation or as part of a serial suite.

## Usage Pattern

### Serial Tests (Recommended for Related Workflows)

```typescript
import { test, expect } from './fixtures/shared-page'

test.describe.configure({ mode: 'serial' })

test.describe('Spaces - Discussions', () => {
  test('Create Discussion', async ({ page, app }) => {
    await app.ensureRoute('/spaces')
    await SpacesList.searchSpaceOpenDetail(page, spaceName)
    // ... create discussion
  })

  test('Add Comment', async ({ page, app }) => {
    await app.ensureRoute('/spaces')  // Fast SPA nav
    await SpacesList.searchSpaceOpenDetail(page, spaceName)
    // ... add comment
  })

  test('Delete Discussion', async ({ page, app }) => {
    await app.ensureRoute('/spaces')  // Fast SPA nav
    // ... delete discussion
  })
})
```

### SPA Navigation Within a Test

Use the other PlaywrightFixture methods for navigation within a single test:

```typescript
test('navigation flow', async ({ page, app }) => {
  await app.ensureRoute('/home/files')
  
  // SPA navigation (no page reload)
  await app.clickLink('/home/apps')
  await app.clickElement('[data-testid="create-button"]')
  await app.goBack()
})
```

## Available Methods

| Method | Description |
|--------|-------------|
| `ensureRoute(path)` | Smart navigation - goto if not initialized, else SPA nav |
| `goto(path)` | Full page navigation (marks as initialized) |
| `navigateTo(path)` | SPA navigation via pushState |
| `clickLink(href)` | Click link and wait for network |
| `clickElement(selector)` | Click any element with network wait |
| `clickSubmitButton(action)` | Click submit button by formAction |
| `waitForNetworkAfter(fn)` | Wrap any action with network idle wait |
| `goBack()` / `goForward()` | Browser navigation with network wait |
| `reload()` | Reload page with network wait |

## File Organization

```
e2e/tests/
├── fixtures/
│   ├── index.ts              # Re-exports all fixtures
│   ├── playwright-fixture.ts  # PlaywrightFixture class
│   ├── shared-page.ts         # Worker-scoped shared page fixtures
│   └── e2e-styles.ts          # Style setup (disable animations, etc.)
├── extend.ts                  # Standard (non-shared) test fixtures
└── *.spec.ts                  # Test files
```

## Choosing the Right Approach

| Approach | Import | Use Case |
|----------|--------|----------|
| **Shared Page (Serial)** | `import { test } from './fixtures/shared-page'` | Related tests that run in sequence |
| **Standard (Isolated)** | `import { test } from './extend'` | Independent tests that can run in parallel |

## Trade-offs

| Approach | Speed | Reliability | Debugging |
|----------|-------|-------------|-----------|
| Shared page + serial | ⚡ Fast | Medium | Each test depends on prior state |
| Fresh page per test | Slower | High | Tests are independent |
| Single test with steps | ⚡⚡ Fastest | Medium | All-or-nothing execution |

## Best Practices

1. **Always use `ensureRoute()`** at the start of each test - it handles both serial and individual runs
2. **Use serial mode** for related tests that share setup (e.g., create → edit → delete)
3. **Group related tests** in a `test.describe` block with `mode: 'serial'`
4. **Clean up** at the end of test suites to leave the system in a known state
