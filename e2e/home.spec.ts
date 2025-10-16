import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Home Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Check if page loaded
    await expect(page).toHaveTitle(/Reflectio/i)
  })

  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // Look for login link/button
    const loginLink = page.getByRole('link', { name: /entrar|login/i }).or(
      page.getByRole('button', { name: /entrar|login/i })
    )

    if (await loginLink.count() > 0) {
      await loginLink.first().click()
      await expect(page).toHaveURL(/login/)
    }
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page).not.toHaveURL(/error/)

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page).not.toHaveURL(/error/)

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page).not.toHaveURL(/error/)
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/')

    // Check for essential meta tags
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
  })
})

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })
})
