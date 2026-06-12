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
  await page.getByRole('link', { name: 'Interaktive Demo' }).first().click();

  await expect(page).toHaveURL(/#\/dashboard/);
  await expect(page.getByText('Aktive Bestellungen')).toBeVisible();
  await expect(page.getByText('Warenwert in Verzug')).toBeVisible();
  await expect(page.getByRole('link', { name: 'PO-2026-118' })).toBeVisible();
  await expect(page.getByText('Kritisch').first()).toBeVisible();
  await expect(page.getByText('Entwicklung der letzten 6 Monate')).toBeVisible();
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
  await page.goto('./#/orders/ord-19');

  await page.locator('select').selectOption('DELIVERED');
  await page.getByRole('button', { name: 'Speichern' }).click();

  await expect(page.getByText('Geliefert').first()).toBeVisible();
});

test('supplier magic-link page accepts a status update with confirmed date', async ({ page }) => {
  await page.goto('./#/s/demo');

  await expect(page.getByText('PO-2026-118')).toBeVisible();
  await page.getByRole('button', { name: 'Versendet' }).click();
  await page.getByLabel(/Bestätigter Liefertermin/).fill('2026-09-01');
  await page.getByRole('button', { name: 'Status senden' }).click();

  await expect(page.getByText('Vielen Dank!')).toBeVisible();
});

test('team page lists members and simulates an invite', async ({ page }) => {
  await page.goto('./#/team');

  await expect(page.getByText('Thomas Müller')).toBeVisible();
  await page.getByLabel('E-Mail').fill('neu@muster.de');
  await page.getByRole('button', { name: 'Einladung senden' }).click();
  await expect(page.getByText('neu@muster.de')).toBeVisible();
});
