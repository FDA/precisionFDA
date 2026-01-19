/**
 * PlaywrightFixture - SPA navigation helpers for Playwright tests.
 * 
 * Ported from React Router's integration test helpers:
 * @see https://github.com/remix-run/react-router/blob/main/integration/helpers/playwright-fixture.ts
 * 
 * MIT License - Copyright (c) React Training LLC 2015-2019
 * Copyright (c) Remix Software Inc. 2020-2021
 * Copyright (c) Shopify Inc. 2022-2023
 */

import type { Page, Response, Request } from 'playwright/test'

/**
 * Execute an action and wait for the network to settle.
 * 
 * This is more reliable than just waitForLoadState('networkidle') because
 * it tracks requests that start during the action itself.
 */
export async function doAndWait(
  page: Page,
  action: () => Promise<unknown>,
  longPolls = 0,
): Promise<unknown> {
  const DEBUG = !!process.env.DEBUG

  let networkSettledCallback: () => void
  const networkSettledPromise = new Promise<void>((resolve) => {
    networkSettledCallback = resolve
  })

  let requestCounter = 0
  let actionDone = false
  const pending = new Set<Request>()

  const maybeSettle = () => {
    if (actionDone && requestCounter <= longPolls) {
      networkSettledCallback()
    }
  }

  const onRequest = (request: Request) => {
    ++requestCounter
    if (DEBUG) {
      pending.add(request)
      console.log(`+[${requestCounter}]: ${request.url()}`)
    }
  }

  const onRequestDone = (request: Request) => {
    // Let the page handle responses asynchronously (via setTimeout(0)).
    const evaluate = page.evaluate(() => {
      return new Promise((resolve) => setTimeout(resolve, 0))
    })
    evaluate
      .catch(() => null)
      .then(() => {
        --requestCounter
        maybeSettle()
        if (DEBUG) {
          pending.delete(request)
          console.log(`-[${requestCounter}]: ${request.url()}`)
        }
      })
  }

  page.on('request', onRequest)
  page.on('requestfinished', onRequestDone)
  page.on('requestfailed', onRequestDone)
  page.on('load', networkSettledCallback!) // e.g. navigation with javascript disabled

  const timeoutId = DEBUG
    ? setInterval(() => {
        console.log(`${requestCounter} requests pending:`)
        for (const request of pending) {
          console.log(`  ${request.url()}`)
        }
      }, 5000)
    : undefined

  const result = await action()
  actionDone = true
  maybeSettle()

  if (DEBUG) {
    console.log(`action done, ${requestCounter} requests pending`)
  }

  await networkSettledPromise

  // Safari workaround - wait for next animation frame
  const userAgent = await page.evaluate(() => navigator.userAgent)
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)))
  }

  if (DEBUG) {
    console.log(`action done, network settled`)
  }

  page.removeListener('request', onRequest)
  page.removeListener('requestfinished', onRequestDone)
  page.removeListener('requestfailed', onRequestDone)
  page.removeListener('load', networkSettledCallback!)

  if (DEBUG && timeoutId) {
    clearTimeout(timeoutId)
  }

  return result
}

/**
 * PlaywrightFixture provides SPA-friendly navigation helpers.
 * 
 * Use this class when you need to interact with a React Router app
 * and want reliable network-settled assertions.
 */
export class PlaywrightFixture {
  readonly page: Page
  
  /**
   * Tracks whether the page has been initialized with a full page load.
   * This is used by ensureRoute() to determine if a full goto() is needed.
   */
  private _initialized = false

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Check if the page has been initialized with a full page load.
   */
  get initialized(): boolean {
    return this._initialized
  }

  /**
   * Navigate to a URL and wait for the page to load.
   * This is a convenience wrapper around page.goto().
   *
   * @param href The path to navigate to
   * @param options waitUntil option for page.goto()
   */
  async goto(href: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' }) {
    const result = await this.page.goto(href, options)
    this._initialized = true
    return result
  }

  /**
   * Navigate to a route using client-side navigation (no full page reload).
   * Uses history.pushState and dispatches a popstate event to trigger React Router.
   * 
   * This is useful for SPA navigation between tests without a full page reload.
   *
   * @param path The path to navigate to (e.g., '/home/apps')
   */
  async navigateTo(path: string) {
    await doAndWait(this.page, async () => {
      await this.page.evaluate((targetPath) => {
        window.history.pushState({}, '', targetPath)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }, path)
    })
  }

  /**
   * Ensure the page is at the specified route.
   * 
   * If the page hasn't been initialized yet (no full page load), performs a full goto().
   * If already initialized, uses SPA navigation via navigateTo() for faster transitions.
   * 
   * This method enables running tests individually - each test can specify
   * the route it needs, and ensureRoute() will do the right thing:
   * - First test (or individual test run): full page load
   * - Subsequent tests in serial: fast SPA navigation
   *
   * @param path The path to navigate to (e.g., '/home/files')
   */
  async ensureRoute(path: string) {
    if (!this._initialized) {
      await this.goto(path)
    } else {
      await this.navigateTo(path)
    }
  }

  /**
   * Finds a link on the page with a matching href, clicks it, and waits for
   * the network to be idle before continuing.
   *
   * @param href The href of the link you want to click
   * @param options `{ wait }` waits for the network to be idle before moving on
   */
  async clickLink(href: string, options: { wait: boolean } = { wait: true }) {
    const selector = `a[href="${href}"]`
    const el = await this.page.$(selector)
    if (!el) {
      throw new Error(`Could not find link for ${selector}`)
    }
    if (options.wait) {
      await doAndWait(this.page, () => el.click())
    } else {
      await el.click()
    }
  }

  /**
   * Find the input element and fill for file uploads.
   *
   * @param inputSelector The selector of the input you want to fill
   * @param filePaths The paths to the files you want to upload
   */
  async uploadFile(inputSelector: string, ...filePaths: string[]) {
    const el = await this.page.$(inputSelector)
    if (!el) {
      throw new Error(`Could not find input for: ${inputSelector}`)
    }
    await el.setInputFiles(filePaths)
  }

  /**
   * Finds the first submit button with `formAction` that matches the
   * `action` supplied, clicks it, and optionally waits for the network to
   * be idle before continuing.
   *
   * @param action The formAction of the button you want to click
   * @param options `{ wait }` waits for the network to be idle before moving on
   */
  async clickSubmitButton(
    action: string,
    options: { wait?: boolean; method?: string } = { wait: true },
  ) {
    let selector: string
    if (options.method) {
      selector = `button[formAction="${action}"][formMethod="${options.method}"]`
    } else {
      selector = `button[formAction="${action}"]`
    }

    let el = await this.page.$(selector)
    if (!el) {
      if (options.method) {
        selector = `form[action="${action}"] button[type="submit"][formMethod="${options.method}"]`
      } else {
        selector = `form[action="${action}"] button[type="submit"]`
      }
      el = await this.page.$(selector)
      if (!el) {
        throw new Error(`Can't find button for: ${action}`)
      }
    }
    if (options.wait) {
      await doAndWait(this.page, () => el!.click())
    } else {
      await el.click()
    }
  }

  /**
   * Clicks any element and waits for the network to be idle.
   */
  async clickElement(selector: string) {
    const el = await this.page.$(selector)
    if (!el) {
      throw new Error(`Can't find element for: ${selector}`)
    }
    await doAndWait(this.page, () => el.click())
  }

  /**
   * Perform any interaction and wait for the network to be idle:
   *
   * ```ts
   * await app.waitForNetworkAfter(() => app.page.focus("#el"))
   * ```
   */
  async waitForNetworkAfter(fn: () => Promise<unknown>) {
    await doAndWait(this.page, fn)
  }

  /**
   * "Clicks" the back button and optionally waits for the network to be
   * idle (defaults to waiting).
   */
  async goBack(options: { wait: boolean } = { wait: true }) {
    if (options.wait) {
      await doAndWait(this.page, () => this.page.goBack())
    } else {
      await this.page.goBack()
    }
  }

  /**
   * "Clicks" the forward button and optionally waits for the network to be
   * idle (defaults to waiting).
   */
  async goForward(options: { wait: boolean } = { wait: true }) {
    if (options.wait) {
      await doAndWait(this.page, () => this.page.goForward())
    } else {
      await this.page.goForward()
    }
  }

  /**
   * "Clicks" the refresh button.
   */
  async reload(options: { wait: boolean } = { wait: true }) {
    if (options.wait) {
      await doAndWait(this.page, () => this.page.reload())
    } else {
      await this.page.reload()
    }
  }

  /**
   * Collects responses from the network, usually after a link click or
   * form submission. A filter can be provided to only collect responses
   * that meet a certain criteria.
   */
  collectResponses(filter?: (url: URL) => boolean) {
    const responses: Response[] = []

    this.page.on('response', (res) => {
      if (!filter || filter(new URL(res.url()))) {
        responses.push(res)
      }
    })

    return responses
  }
}
