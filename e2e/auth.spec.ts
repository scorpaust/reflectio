import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Reflectio/i)

    // Check main elements
    await expect(page.getByText('Bem-vindo de volta')).toBeVisible()
    await expect(page.getByPlaceholder('seu@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.getByRole('button', { name: /entrar/i }).click()

    // HTML5 validation should prevent submission
    const emailInput = page.getByPlaceholder('seu@email.com')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBeTruthy()
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('seu@email.com').fill('wrong@example.com')
    await page.getByPlaceholder('••••••••').fill('wrongpassword')
    await page.getByRole('button', { name: /entrar/i }).click()

    // Should show error message (adjust selector based on actual error display)
    await expect(page.getByText(/erro/i).or(page.getByText(/invalid/i))).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.getByText('Registe-se gratuitamente').click()
    await expect(page).toHaveURL(/register/)
  })

  test('should have accessible login form', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should remember me checkbox work', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first()
    await expect(checkbox).toBeVisible()

    // Check the checkbox
    await checkbox.check()
    await expect(checkbox).toBeChecked()

    // Uncheck the checkbox
    await checkbox.uncheck()
    await expect(checkbox).not.toBeChecked()
  })

  test('should display loading state on login', async ({ page }) => {
    await page.getByPlaceholder('seu@email.com').fill('test@example.com')
    await page.getByPlaceholder('••••••••').fill('password123')

    await page.getByRole('button', { name: /entrar/i }).click()

    // Should show loading state
    await expect(page.getByText('A carregar...')).toBeVisible({ timeout: 1000 })
  })

  test('should show forgot password link', async ({ page }) => {
    const forgotPasswordLink = page.getByText('Esqueceu a senha?')
    await expect(forgotPasswordLink).toBeVisible()
    await expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })
})

test.describe('Login Page - Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')

    await expect(page.getByText('Bem-vindo de volta')).toBeVisible()
    await expect(page.getByPlaceholder('seu@email.com')).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/login')

    await expect(page.getByText('Bem-vindo de volta')).toBeVisible()
  })
})

test.describe('Login Page - Keyboard Navigation', () => {
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login')

    // Tab through form elements
    await page.keyboard.press('Tab')
    await expect(page.getByPlaceholder('seu@email.com')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByPlaceholder('••••••••')).toBeFocused()
  })

  test('should submit form with Enter key', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder('seu@email.com').fill('test@example.com')
    await page.getByPlaceholder('••••••••').fill('password123')

    // Press Enter to submit
    await page.keyboard.press('Enter')

    // Should attempt login (loading state or error)
    await page.waitForTimeout(500)
  })
})
