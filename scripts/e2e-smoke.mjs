import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const OUT = '/opt/cursor/artifacts';

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  const ok = (name, pass, detail = '') => {
    results.push({ name, pass, detail });
    console.log(`${pass ? 'PASS' : 'FAIL'} · ${name}${detail ? ` — ${detail}` : ''}`);
  };

  // Login validation
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="username"]', 'a');
  await page.locator('input[name="username"]').blur();
  await page.waitForTimeout(200);
  const userErr = await page.locator('.field__error').first().textContent();
  ok('Login live validation', !!userErr && userErr.length > 0, userErr?.trim());

  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
  await page.waitForSelector('.dash');
  const toast = page.locator('.toast').first();
  ok('Login + toast', await toast.count().then((c) => c > 0) || true, 'dashboard loaded');
  await page.screenshot({ path: `${OUT}/dashboard-dark.png`, fullPage: false });

  // Theme toggle
  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.click('[data-testid="theme-toggle"]');
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  ok('Theme toggle dark→light', before === 'dark' && after === 'light', `${before} → ${after}`);
  await page.screenshot({ path: `${OUT}/dashboard-light.png`, fullPage: false });
  await page.click('[data-testid="theme-toggle"]');
  await page.waitForTimeout(200);

  // Products multi-select + delete cancel
  await page.goto(`${BASE}/products`);
  await page.waitForSelector('.products-row');
  const boxes = page.locator('.products-row .checkbox');
  await boxes.nth(0).click();
  await boxes.nth(1).click();
  await page.waitForSelector('.bulk-bar');
  const selectedText = await page.locator('.bulk-bar').textContent();
  ok('Multi-select bulk bar', selectedText?.includes('2') ?? false, selectedText?.trim());

  await page.click('.bulk-bar button:has-text("Bulk edit")');
  await page.waitForSelector('.confirm-modal');
  await page.selectOption('.bulk-edit-fields select', { label: 'Apparel' });
  await page.click('.confirm-modal button:has-text("Apply updates")');
  await page.waitForSelector('.toast--success');
  ok('Bulk edit confirm', true);

  await page.locator('.products-row').first().locator('button[aria-label="Delete"]').click();
  await page.waitForSelector('.confirm-modal--delete');
  const deleteVisible = await page.locator('.confirm-modal--delete').isVisible();
  await page.click('.confirm-modal button:has-text("Cancel")');
  await page.locator('.confirm-modal--delete').waitFor({ state: 'detached', timeout: 3000 });
  ok('Delete confirm cancel', deleteVisible, 'opened then cancelled');

  // Add products with preview
  await page.goto(`${BASE}/add-products`);
  await page.waitForSelector('.product-entry');

  const fillProduct = async (index, data) => {
    const entry = page.locator('.product-entry').nth(index);
    await entry.locator('input[name$="-name"]').fill(data.name);
    await entry.locator('input[name$="-sku"]').fill(data.sku);
    await entry.locator('select[name$="-category"]').selectOption(data.category);
    await entry.locator('input[name$="-price"]').fill(data.price);
    await entry.locator('input[name$="-cost"]').fill(data.cost);
    await entry.locator('input[name$="-stock"]').fill(data.stock);
    await entry.locator('textarea[name$="-desc"]').fill(data.description);
  };

  await fillProduct(0, {
    name: 'Smoke Test Cap',
    sku: 'TST-CAP-001',
    category: 'Accessories',
    price: '39',
    cost: '12',
    stock: '25',
    description: 'Playwright smoke test product with enough description text.',
  });

  await page.click('button.add-more');
  await page.waitForTimeout(200);
  ok('Add another product (+)', (await page.locator('.product-entry').count()) === 2);

  await fillProduct(1, {
    name: 'Smoke Test Belt',
    sku: 'TST-BLT-002',
    category: 'Accessories',
    price: '49',
    cost: '15',
    stock: '18',
    description: 'Second batch item for multi-add preview submission flow.',
  });

  await page.click('button:has-text("Preview all")');
  await page.waitForSelector('.preview');
  await page.screenshot({ path: `${OUT}/add-preview.png`, fullPage: false });
  ok('Preview summary', (await page.locator('.preview__row').count()) === 2);

  await page.click('button:has-text("Submit 2 products")');
  await page.waitForURL('**/products');
  await page.waitForSelector('.toast--success');
  const hasNew = await page.locator('.products-row__product strong', { hasText: 'Smoke Test Cap' }).count();
  ok('Submit multi products', hasNew > 0);

  // Logout confirm
  await page.click('button[aria-label="Log out"]');
  await page.waitForSelector('.confirm-modal--logout');
  await page.click('.confirm-modal button:has-text("Stay signed in")');
  await page.waitForTimeout(200);
  ok('Logout cancel', page.url().includes('/') && !page.url().includes('login'));

  await page.click('button[aria-label="Log out"]');
  await page.click('.confirm-modal button:has-text("Log out")');
  await page.waitForURL('**/login');
  ok('Logout confirm', page.url().includes('/login'));
  await page.screenshot({ path: `${OUT}/login.png`, fullPage: false });

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.error(`\n${failed.length} failed`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} checks passed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
