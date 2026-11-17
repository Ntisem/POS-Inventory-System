import { chromium } from 'playwright';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173';
const OUT = '/opt/cursor/artifacts';
const TMP = '/tmp/pos-demo-video';

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(TMP, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: TMP, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  const pause = (ms) => page.waitForTimeout(ms);

  await page.goto(`${BASE}/login`);
  await page.evaluate(() => {
    localStorage.removeItem('pos-auth');
    localStorage.setItem('pos-theme', 'dark');
  });
  await page.reload();
  await page.waitForSelector('input[name="username"]');
  await pause(800);
  await page.fill('input[name="username"]', 'admin');
  await pause(300);
  await page.fill('input[name="password"]', 'Admin@123');
  await pause(400);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.dash');
  await pause(1200);

  await page.click('[data-testid="theme-toggle"]');
  await pause(1000);
  await page.click('[data-testid="theme-toggle"]');
  await pause(800);

  await page.goto(`${BASE}/add-products`);
  await page.waitForSelector('.product-entry');
  await pause(500);

  const entry0 = page.locator('.product-entry').nth(0);
  await entry0.locator('input[name$="-name"]').fill('Demo Mug');
  await entry0.locator('input[name$="-sku"]').fill('DEM-MUG-1');
  await entry0.locator('select[name$="-category"]').selectOption('Accessories');
  await entry0.locator('input[name$="-price"]').fill('24');
  await entry0.locator('input[name$="-cost"]').fill('8');
  await entry0.locator('input[name$="-stock"]').fill('40');
  await entry0
    .locator('textarea[name$="-desc"]')
    .fill('Ceramic demo mug for walkthrough recording with enough characters.');
  await pause(500);

  await page.click('button.add-more');
  await pause(700);

  const entry1 = page.locator('.product-entry').nth(1);
  await entry1.locator('input[name$="-name"]').fill('Demo Notebook');
  await entry1.locator('input[name$="-sku"]').fill('DEM-NTB-2');
  await entry1.locator('select[name$="-category"]').selectOption('Accessories');
  await entry1.locator('input[name$="-price"]').fill('18');
  await entry1.locator('input[name$="-cost"]').fill('6');
  await entry1.locator('input[name$="-stock"]').fill('60');
  await entry1
    .locator('textarea[name$="-desc"]')
    .fill('Softcover notebook added in the same batch before preview submit.');
  await pause(500);

  await page.click('button:has-text("Preview all")');
  await page.waitForSelector('.preview');
  await pause(1400);

  await page.click('button:has-text("Submit 2 products")');
  await page.waitForURL('**/products');
  await pause(1000);

  await page.locator('.products-row .checkbox').nth(0).click();
  await page.locator('.products-row .checkbox').nth(1).click();
  await page.waitForSelector('.bulk-bar');
  await pause(1000);

  await page.locator('.products-row').first().locator('button[aria-label="Delete"]').click();
  await page.waitForSelector('.confirm-modal--delete');
  await pause(1200);
  await page.click('.confirm-modal button:has-text("Cancel")');
  await pause(600);

  await page.click('button[aria-label="Log out"]');
  await page.waitForSelector('.confirm-modal--logout');
  await pause(1500);
  await page.click('.confirm-modal button:has-text("Log out")');
  await page.waitForURL('**/login');
  await pause(800);

  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const src = await video.path();
    const dest = path.join(OUT, 'pos-inventory-demo.webm');
    await copyFile(src, dest);
    console.log(`Saved ${dest}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
