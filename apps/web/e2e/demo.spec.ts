import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Each test gets a fresh browser context, so the in-memory demo store and
  // the persisted language both start clean.
  await page.goto('./');
});

test('landing page renders in German and toggles to English', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Weniger Lieferanten');

  await page.getByRole('group', { name: /Sprache/ }).getByRole('button', { name: 'EN' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Stop chasing suppliers');
  await expect(page.getByRole('heading', { name: 'Looking for pilot customers' })).toBeVisible();
});

test('dashboard shows live demo data with risk indicators', async ({ page }) => {
  await page.getByRole('link', { name: /Demo starten/ }).click();

  await expect(page).toHaveURL(/#\/dashboard/);
  await expect(page.getByText('Aktive Bestellungen')).toBeVisible();
  await expect(page.getByRole('link', { name: 'PO-2026-089' })).toBeVisible();
  await expect(page.getByText('Kritisch').first()).toBeVisible();
});

test('creating an order adds it to the dashboard', async ({ page }) => {
  await page.goto('./#/orders/new');

  await page.locator('select').selectOption({ label: 'Elektro Bauer & Co.' });
  await page.getByLabel('Bestellnummer').fill('PO-2026-777');
  await page.getByLabel('Beschreibung').fill('Servomotor 3kW');
  await page.getByLabel('Fälligkeitsdatum').fill('2026-09-01T10:00');
  await page.getByRole('button', { name: 'Bestellung anlegen' }).click();

  await expect(page).toHaveURL(/#\/dashboard/);
  await expect(page.getByRole('link', { name: 'PO-2026-777' })).toBeVisible();
});

test('buyer can mark an order as delivered', async ({ page }) => {
  await page.goto('./#/orders/ord-2');

  await page.locator('select').selectOption('DELIVERED');
  await page.getByRole('button', { name: 'Speichern' }).click();

  await expect(page.getByText('Geliefert').first()).toBeVisible();
});

test('supplier magic-link page accepts a status update', async ({ page }) => {
  await page.goto('./#/s/demo');

  await expect(page.getByText('PO-2026-089')).toBeVisible();
  await page.getByRole('button', { name: 'Versendet' }).click();
  await page.getByRole('button', { name: 'Status senden' }).click();

  await expect(page.getByText('Vielen Dank!')).toBeVisible();
});
