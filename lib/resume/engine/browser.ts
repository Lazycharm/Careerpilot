/**
 * Serverless-compatible browser launcher.
 *
 * Local dev: uses system Chrome/Chromium (set CHROMIUM_EXECUTABLE_PATH env var)
 *   or falls back to Puppeteer's bundled Chromium if available.
 * Production (Vercel / Lambda): uses @sparticuz/chromium-min which downloads
 *   a compact Chromium binary from a CDN URL on first invocation.
 *
 * Requires CHROMIUM_URL env var in production to point to a chromium-min pack.
 * Hosted at: https://github.com/Sparticuz/chromium/releases
 */

import type { Browser } from 'puppeteer-core'

let _browser: Browser | null = null

export async function launchBrowser(): Promise<Browser> {
  if (_browser) return _browser

  const isServerless = !!(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NEXT_RUNTIME === 'nodejs'
  )

  if (isServerless && process.env.CHROMIUM_URL) {
    const chromiumMod = await import('@sparticuz/chromium-min').then((m) => m.default ?? m)
    // Access chromium-min API through unknown to handle missing type declarations
    const chromium = chromiumMod as {
      args: string[]
      executablePath: (location: string) => Promise<string>
    }
    const puppeteer = await import('puppeteer-core').then((m) => m.default ?? m)
    _browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        ...chromium.args,
      ],
      executablePath: await chromium.executablePath(process.env.CHROMIUM_URL),
      headless: true,
      defaultViewport: { width: 794, height: 1123 },
    })
    return _browser
  }

  // Local dev — use system Chrome or CHROMIUM_EXECUTABLE_PATH
  const puppeteer = await import('puppeteer-core').then((m) => m.default ?? m)
  const executablePath =
    process.env.CHROMIUM_EXECUTABLE_PATH ||
    // Common Chrome paths
    (process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/google-chrome')

  _browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
  return _browser
}

export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close()
    _browser = null
  }
}
