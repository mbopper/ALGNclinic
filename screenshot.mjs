import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1] || '0')).filter(Boolean);
const n = nums.length ? Math.max(...nums) + 1 : 1;
const filename = `screenshot-${n}${label}.png`;
const outPath = path.join(dir, filename);

const browser = await puppeteer.launch({
  executablePath: (() => {
    const candidates = [
      'C:/Users/nateh/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe',
      'C:/Users/maxtr/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe',
      process.env.PUPPETEER_EXECUTABLE_PATH,
    ].filter(Boolean);
    for (const c of candidates) { try { if (fs.existsSync(c)) return c; } catch {} }
    return undefined;
  })(),
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log(`Saved: temporary screenshots/${filename}`);
